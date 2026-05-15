import { app, BrowserWindow, ipcMain, Notification, safeStorage } from 'electron'
import path from 'path'
import { WeChatExecutor } from './wechat/executor'

// esbuild 编译为 CJS 时，__dirname 全局可用
declare const __dirname: string

// 仅在开发模式下连接到 Vite 开发服务器
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

let wechatExecutor: WeChatExecutor

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'ChatSight',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

function initializeWeChatExecutor() {
  const commandPrefix = process.env.WECHAT_CLI_COMMAND || 'wechat-cli'
  const timeout = parseInt(process.env.WECHAT_CLI_TIMEOUT || '30000')
  wechatExecutor = new WeChatExecutor(commandPrefix, timeout)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as Record<string, unknown>).code
    return code !== undefined ? String(code) : undefined
  }
  return undefined
}

function registerWeChatHandlers() {
  ipcMain.handle('wechat:init', async () => {
    try {
      return await wechatExecutor.init()
    } catch (error: unknown) {
      return { error: getErrorMessage(error), code: getErrorCode(error) }
    }
  })

  ipcMain.handle('wechat:sessions', async (_, limit?: number) => {
    try {
      return await wechatExecutor.getSessions(limit)
    } catch (error: unknown) {
      return { error: getErrorMessage(error), code: getErrorCode(error) }
    }
  })

  ipcMain.handle('wechat:history', async (_, sessionName: string, limit?: number) => {
    try {
      const result = await wechatExecutor.getHistory(sessionName, limit)
      return result
    } catch (error: unknown) {
      return { error: getErrorMessage(error), code: getErrorCode(error) }
    }
  })

  ipcMain.handle('wechat:search', async (_, keyword: string, sessionName?: string) => {
    try {
      return await wechatExecutor.search(keyword, sessionName)
    } catch (error: unknown) {
      return { error: getErrorMessage(error), code: getErrorCode(error) }
    }
  })

  ipcMain.handle('wechat:stats', async (_, sessionName?: string) => {
    try {
      return await wechatExecutor.getStats(sessionName)
    } catch (error: unknown) {
      return { error: getErrorMessage(error), code: getErrorCode(error) }
    }
  })

  ipcMain.handle('wechat:contacts', async (_, query?: string) => {
    try {
      return await wechatExecutor.getContacts(query)
    } catch (error: unknown) {
      return { error: getErrorMessage(error), code: getErrorCode(error) }
    }
  })

  ipcMain.handle('wechat:new-messages', async (_, sinceTimestamp?: string) => {
    try {
      return await wechatExecutor.getNewMessages(sinceTimestamp)
    } catch (error: unknown) {
      return { error: getErrorMessage(error), code: getErrorCode(error) }
    }
  })
}

function registerNotificationHandlers() {
  ipcMain.handle('notification:show', async (_, options: { title: string; body: string; silent?: boolean }) => {
    if (!Notification.isSupported()) {
      return { success: false, error: 'Notifications are not supported on this system' }
    }

    try {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        silent: options.silent || false
      })

      notification.show()
      return { success: true }
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) }
    }
  })
}

function registerSafeStorageHandlers() {
  ipcMain.handle('safeStorage:encrypt', async (_, plaintext: string) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        return { error: 'Encryption is not available on this system' }
      }
      const encrypted = safeStorage.encryptString(plaintext)
      return { data: encrypted.toString('base64') }
    } catch (error: unknown) {
      return { error: getErrorMessage(error) }
    }
  })

  ipcMain.handle('safeStorage:decrypt', async (_, encryptedBase64: string) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        return { error: 'Encryption is not available on this system' }
      }
      const decrypted = safeStorage.decryptString(Buffer.from(encryptedBase64, 'base64'))
      return { data: decrypted }
    } catch (error: unknown) {
      return { error: getErrorMessage(error) }
    }
  })
}

app.whenReady().then(async () => {
  initializeWeChatExecutor()
  registerWeChatHandlers()
  registerNotificationHandlers()
  registerSafeStorageHandlers()

  // 自动初始化 wechat-cli
  try {
    await wechatExecutor.init()
    console.log('wechat-cli initialized')
  } catch (error: unknown) {
    console.error('wechat-cli init failed:', getErrorMessage(error))
  }

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
