import { contextBridge, ipcRenderer } from 'electron'

export interface WeChatAPI {
  init: () => Promise<any>
  getSessions: (limit?: number) => Promise<any>
  getHistory: (sessionName: string, limit?: number) => Promise<any>
  search: (keyword: string, sessionName?: string) => Promise<any>
  getStats: (sessionName?: string) => Promise<any>
  getContacts: (query?: string) => Promise<any>
}

export interface ElectronAPI {
  platform: string
  wechat: WeChatAPI
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  wechat: {
    init: () => ipcRenderer.invoke('wechat:init'),
    getSessions: (limit?: number) => ipcRenderer.invoke('wechat:sessions', limit),
    getHistory: (sessionName: string, limit?: number) => ipcRenderer.invoke('wechat:history', sessionName, limit),
    search: (keyword: string, sessionName?: string) => ipcRenderer.invoke('wechat:search', keyword, sessionName),
    getStats: (sessionName?: string) => ipcRenderer.invoke('wechat:stats', sessionName),
    getContacts: (query?: string) => ipcRenderer.invoke('wechat:contacts', query)
  }
} as ElectronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
