import { app, BrowserWindow, ipcMain, Notification, safeStorage } from 'electron'
import path from 'path'
import { WeChatExecutor } from './wechat/executor'

// esbuild 编译为 CJS 时，__dirname 全局可用
declare const __dirname: string

// 仅在开发模式下连接到 Vite 开发服务器
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

let wechatExecutor: WeChatExecutor
let mainWindow: BrowserWindow | null = null

type InitStatus = 'idle' | 'initializing' | 'ready' | 'error'
let initStatus: InitStatus = 'idle'
let initError: string | undefined = undefined

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

function registerWeChatHandlers() {
  ipcMain.handle('wechat:init-status', () => {
    return { status: initStatus, error: initError }
  })

  ipcMain.handle('wechat:init', async () => {
    if (initStatus === 'initializing') {
      return { error: 'Already initializing', code: 'ALREADY_INITIALIZING' }
    }
    if (initStatus === 'ready') {
      return { data: true }
    }
    
    initStatus = 'initializing'
    initError = undefined
    mainWindow?.webContents.send('wechat:init-status-changed', { status: 'initializing' })
    
    try {
      await wechatExecutor.init()
      initStatus = 'ready'
      mainWindow?.webContents.send('wechat:init-status-changed', { status: 'ready' })
      return { data: true }
    } catch (error: unknown) {
      initStatus = 'error'
      initError = getErrorMessage(error)
      mainWindow?.webContents.send('wechat:init-status-changed', { status: 'error', error: initError })
      return { error: initError, code: getErrorCode(error) }
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

function createWindow() {
  mainWindow = new BrowserWindow({
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
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (initStatus === 'idle') {
    initStatus = 'initializing'
    mainWindow?.webContents.send('wechat:init-status-changed', { status: 'initializing' })
    wechatExecutor.init().then(() => {
      initStatus = 'ready'
      mainWindow?.webContents.send('wechat:init-status-changed', { status: 'ready' })
    }).catch((error: unknown) => {
      initStatus = 'error'
      initError = getErrorMessage(error)
      mainWindow?.webContents.send('wechat:init-status-changed', { status: 'error', error: initError })
    })
  }
}

function initializeWeChatExecutor() {
  const commandPrefix = process.env.WECHAT_CLI_COMMAND || 'wechat-cli'
  const timeout = parseInt(process.env.WECHAT_CLI_TIMEOUT || '30000')
  wechatExecutor = new WeChatExecutor(commandPrefix, timeout)
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
