import { create } from 'zustand'

export type InitStatus = 'idle' | 'initializing' | 'ready' | 'error'

interface InitState {
  status: InitStatus
  error: string | undefined
  setStatus: (status: InitStatus, error?: string) => void
  fetchStatus: () => Promise<void>
  retry: () => Promise<void>
}

export const useInitStore = create<InitState>((set) => ({
  status: 'idle',
  error: undefined,

  setStatus: (status, error) => set({ status, error }),

  fetchStatus: async () => {
    if (!window.electronAPI?.wechat?.initStatus) {
      set({ status: 'ready' })
      return
    }
    try {
      const result = await window.electronAPI.wechat.initStatus()
      set({ 
        status: result.status as InitStatus, 
        error: result.error 
      })
    } catch {
      set({ status: 'error', error: '无法获取初始化状态' })
    }
  },

  retry: async () => {
    if (!window.electronAPI?.wechat?.init) return
    
    set({ status: 'initializing', error: undefined })
    try {
      const result = await window.electronAPI.wechat.init()
      if (result.error) {
        set({ status: 'error', error: result.error })
      } else {
        set({ status: 'ready' })
      }
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : '初始化失败' })
    }
  },
}))
