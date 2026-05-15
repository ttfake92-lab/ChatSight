import { create } from 'zustand'
import type { AIConfig, AIProvider, KeywordConfig, MonitoringConfig } from '../types'

const AI_CONFIG_KEY = 'chatsight-ai-config'
const MONITORING_CONFIG_KEY = 'chatsight-monitoring-config'

const getDefaultConfig = (): AIConfig => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
  
  return {
    provider: (import.meta.env.VITE_DEFAULT_PROVIDER as AIProvider) || 'openai',
    apiKey,
    model: import.meta.env.VITE_DEFAULT_MODEL || 'gpt-3.5-turbo',
    baseUrl: import.meta.env.VITE_API_BASE_URL || undefined,
  }
}

const getDefaultMonitoringConfig = (): MonitoringConfig => ({
  keywords: [],
  silentHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    weekendsOnly: false,
  },
})

interface ConfigState {
  aiConfig: AIConfig
  isConfigured: boolean
  monitoringConfig: MonitoringConfig
  updateAIConfig: (config: Partial<AIConfig>) => void
  setConfigured: (isConfigured: boolean) => void
  loadConfig: () => void
  saveConfig: () => void
  addKeyword: (keyword: Omit<KeywordConfig, 'id'>) => void
  removeKeyword: (id: string) => void
  updateKeyword: (id: string, updates: Partial<KeywordConfig>) => void
  updateSilentHours: (updates: Partial<MonitoringConfig['silentHours']>) => void
  loadMonitoringConfig: () => void
  saveMonitoringConfig: () => void
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  aiConfig: getDefaultConfig(),
  isConfigured: false,
  monitoringConfig: getDefaultMonitoringConfig(),

  updateAIConfig: (config) => {
    set((state) => ({
      aiConfig: { ...state.aiConfig, ...config },
    }))
  },

  setConfigured: (isConfigured) => set({ isConfigured }),

  loadConfig: async () => {
    try {
      const stored = localStorage.getItem(AI_CONFIG_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AIConfig
        // 尝试解密 apiKey；失败则视为明文（向后兼容旧数据）
        if (parsed.apiKey && window.electronAPI?.safeStorage) {
          try {
            const result = await window.electronAPI.safeStorage.decrypt(parsed.apiKey)
            if (result.data) {
              parsed.apiKey = result.data
            }
          } catch {
            // 解密失败：保持原值，视为明文存储的旧数据
          }
        }
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

  saveConfig: async () => {
    const { aiConfig } = get()
    try {
      let configToSave = { ...aiConfig }
      if (aiConfig.apiKey && window.electronAPI?.safeStorage) {
        const result = await window.electronAPI.safeStorage.encrypt(aiConfig.apiKey)
        if (result.data) {
          configToSave.apiKey = result.data
        } else {
          console.warn('API Key 加密失败，将以明文存储')
        }
      }
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(configToSave))
      set({ isConfigured: true })
    } catch (err) {
      console.error('保存配置失败')
    }
  },

  addKeyword: (keyword) => {
    const newKeyword: KeywordConfig = {
      ...keyword,
      id: `kw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    set((state) => ({
      monitoringConfig: {
        ...state.monitoringConfig,
        keywords: [...state.monitoringConfig.keywords, newKeyword],
      },
    }))
    get().saveMonitoringConfig()
  },

  removeKeyword: (id) => {
    set((state) => ({
      monitoringConfig: {
        ...state.monitoringConfig,
        keywords: state.monitoringConfig.keywords.filter((kw) => kw.id !== id),
      },
    }))
    get().saveMonitoringConfig()
  },

  updateKeyword: (id, updates) => {
    set((state) => ({
      monitoringConfig: {
        ...state.monitoringConfig,
        keywords: state.monitoringConfig.keywords.map((kw) =>
          kw.id === id ? { ...kw, ...updates } : kw
        ),
      },
    }))
    get().saveMonitoringConfig()
  },

  updateSilentHours: (updates) => {
    set((state) => ({
      monitoringConfig: {
        ...state.monitoringConfig,
        silentHours: { ...state.monitoringConfig.silentHours, ...updates },
      },
    }))
    get().saveMonitoringConfig()
  },

  loadMonitoringConfig: () => {
    try {
      const stored = localStorage.getItem(MONITORING_CONFIG_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as MonitoringConfig
        set({ monitoringConfig: parsed })
      }
    } catch {
      set({ monitoringConfig: getDefaultMonitoringConfig() })
    }
  },

  saveMonitoringConfig: () => {
    const { monitoringConfig } = get()
    try {
      localStorage.setItem(MONITORING_CONFIG_KEY, JSON.stringify(monitoringConfig))
    } catch (err) {
      console.error('保存监控配置失败')
    }
  },
}))
