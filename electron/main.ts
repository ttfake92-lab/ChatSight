import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { WeChatExecutor } from './wechat/executor'

// 默认连接到 Vite 开发服务器
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

let wechatExecutor: WeChatExecutor

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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

function registerWeChatHandlers() {
  ipcMain.handle('wechat:init', async () => {
    try {
      return await wechatExecutor.init()
    } catch (error: any) {
      return { error: error.message, code: error.code }
    }
  })

  ipcMain.handle('wechat:sessions', async (_, limit?: number) => {
    try {
      return await wechatExecutor.getSessions(limit)
    } catch (error: any) {
      return { error: error.message, code: error.code }
    }
  })

  ipcMain.handle('wechat:history', async (_, sessionName: string, limit?: number) => {
    try {
      const result = await wechatExecutor.getHistory(sessionName, limit)
      return result
    } catch (error: any) {
      return { error: error.message, code: error.code }
    }
  })

  ipcMain.handle('wechat:search', async (_, keyword: string, sessionName?: string) => {
    try {
      return await wechatExecutor.search(keyword, sessionName)
    } catch (error: any) {
      return { error: error.message, code: error.code }
    }
  })

  ipcMain.handle('wechat:stats', async (_, sessionName?: string) => {
    try {
      return await wechatExecutor.getStats(sessionName)
    } catch (error: any) {
      return { error: error.message, code: error.code }
    }
  })

  ipcMain.handle('wechat:contacts', async (_, query?: string) => {
    try {
      return await wechatExecutor.getContacts(query)
    } catch (error: any) {
      return { error: error.message, code: error.code }
    }
  })
}

app.whenReady().then(async () => {
  initializeWeChatExecutor()
  registerWeChatHandlers()
  
  // 自动初始化 wechat-cli
  try {
    await wechatExecutor.init()
    console.log('✅ wechat-cli 初始化成功')
  } catch (error: any) {
    console.error('❌ wechat-cli 初始化失败:', error.message)
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
