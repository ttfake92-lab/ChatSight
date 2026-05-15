import { contextBridge, ipcRenderer } from 'electron'

interface NotificationAPI {
  show: (options: { title: string; body: string; silent?: boolean }) => Promise<{ success: boolean; error?: string }>
}

interface WeChatAPI {
  init: () => Promise<any>
  getSessions: (limit?: number) => Promise<any>
  getHistory: (sessionName: string, limit?: number) => Promise<any>
  search: (keyword: string, sessionName?: string) => Promise<any>
  getStats: (sessionName?: string) => Promise<any>
  getContacts: (query?: string) => Promise<any>
  getNewMessages: (sinceTimestamp?: string) => Promise<any>
}

interface SafeStorageAPI {
  encrypt: (plaintext: string) => Promise<{ data?: string; error?: string }>
  decrypt: (encryptedBase64: string) => Promise<{ data?: string; error?: string }>
}

interface ElectronAPI {
  platform: string
  wechat: WeChatAPI
  notification: NotificationAPI
  safeStorage: SafeStorageAPI
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  wechat: {
    init: () => ipcRenderer.invoke('wechat:init'),
    getSessions: (limit?: number) => ipcRenderer.invoke('wechat:sessions', limit),
    getHistory: (sessionName: string, limit?: number) => ipcRenderer.invoke('wechat:history', sessionName, limit),
    search: (keyword: string, sessionName?: string) => ipcRenderer.invoke('wechat:search', keyword, sessionName),
    getStats: (sessionName?: string) => ipcRenderer.invoke('wechat:stats', sessionName),
    getContacts: (query?: string) => ipcRenderer.invoke('wechat:contacts', query),
    getNewMessages: (sinceTimestamp?: string) => ipcRenderer.invoke('wechat:new-messages', sinceTimestamp)
  },
  notification: {
    show: (options: { title: string; body: string; silent?: boolean }) =>
      ipcRenderer.invoke('notification:show', options)
  },
  safeStorage: {
    encrypt: (plaintext: string) => ipcRenderer.invoke('safeStorage:encrypt', plaintext),
    decrypt: (encryptedBase64: string) => ipcRenderer.invoke('safeStorage:decrypt', encryptedBase64)
  }
} as ElectronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
