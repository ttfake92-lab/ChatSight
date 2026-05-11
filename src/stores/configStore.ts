import { create } from 'zustand'
import type { AIConfig, AIProvider } from '../types'

const STORAGE_KEY = 'wechat-insight-ai-config'

const getDefaultConfig = (): AIConfig => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
  
  return {
    provider: (import.meta.env.VITE_DEFAULT_PROVIDER as AIProvider) || 'openai',
    apiKey,
    model: import.meta.env.VITE_DEFAULT_MODEL || 'gpt-3.5-turbo',
    baseUrl: import.meta.env.VITE_API_BASE_URL || undefined,
  }
}

interface ConfigState {
  aiConfig: AIConfig
  isConfigured: boolean
  updateAIConfig: (config: Partial<AIConfig>) => void
  setConfigured: (isConfigured: boolean) => void
  loadConfig: () => void
  saveConfig: () => void
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  aiConfig: getDefaultConfig(),
  isConfigured: false,

  updateAIConfig: (config) => {
    set((state) => ({
      aiConfig: { ...state.aiConfig, ...config },
    }))
  },

  setConfigured: (isConfigured) => set({ isConfigured }),

  loadConfig: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AIConfig
        set({ aiConfig: parsed, isConfigured: true })
      } else {
        const defaultConfig = getDefaultConfig()
        set({ 
          aiConfig: defaultConfig, 
          isConfigured: !!defaultConfig.apiKey 
        })
      }
    } catch {
      const defaultConfig = getDefaultConfig()
      set({ aiConfig: defaultConfig, isConfigured: false })
    }
  },

  saveConfig: () => {
    const { aiConfig } = get()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(aiConfig))
      set({ isConfigured: true })
    } catch (err) {
      console.error('保存配置失败')
    }
  },
}))
