/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_DEV_SERVER_PORT: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_DEFAULT_PROVIDER?: 'openai' | 'claude' | 'local'
  readonly VITE_DEFAULT_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}

declare global {
  interface WeChatAPI {
    init: () => Promise<unknown>
    getSessions: (limit?: number) => Promise<unknown>
    getHistory: (sessionName: string, limit?: number) => Promise<unknown>
    search: (keyword: string, sessionName?: string) => Promise<unknown>
    getStats: (sessionName?: string) => Promise<unknown>
    getContacts: (query?: string) => Promise<unknown>
  }

  interface ElectronAPI {
    platform: string
    wechat: WeChatAPI
  }

  interface Window {
    electronAPI: ElectronAPI
  }
}
