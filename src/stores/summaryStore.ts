import { create } from 'zustand'
import type { AISummary } from '../types'

const SUMMARY_STORAGE_KEY = 'chatsight-summaries'

interface StoredSummary {
  summary: AISummary
  sessionId: string
  sessionName: string
  generatedAt: string
}

interface SummaryState {
  summaries: Map<string, StoredSummary>
  loadSummaries: () => void
  getSummary: (sessionId: string) => StoredSummary | undefined
  saveSummary: (sessionId: string, sessionName: string, summary: AISummary) => void
  clearSummary: (sessionId: string) => void
  clearAll: () => void
}

export const useSummaryStore = create<SummaryState>((set, get) => ({
  summaries: new Map(),

  loadSummaries: () => {
    try {
      const stored = localStorage.getItem(SUMMARY_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as StoredSummary[]
        const map = new Map<string, StoredSummary>()
        parsed.forEach((item) => {
          map.set(item.sessionId, item)
        })
        set({ summaries: map })
      }
    } catch {
      set({ summaries: new Map() })
    }
  },

  getSummary: (sessionId) => {
    return get().summaries.get(sessionId)
  },

  saveSummary: (sessionId, sessionName, summary) => {
    const stored: StoredSummary = {
      summary,
      sessionId,
      sessionName,
      generatedAt: new Date().toISOString(),
    }
    const newMap = new Map(get().summaries)
    newMap.set(sessionId, stored)
    set({ summaries: newMap })

    try {
      const arr = Array.from(newMap.values())
      localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(arr))
    } catch {
      console.error('保存摘要失败')
    }
  },

  clearSummary: (sessionId) => {
    const newMap = new Map(get().summaries)
    newMap.delete(sessionId)
    set({ summaries: newMap })

    try {
      const arr = Array.from(newMap.values())
      localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(arr))
    } catch {
      console.error('清除摘要失败')
    }
  },

  clearAll: () => {
    set({ summaries: new Map() })
    try {
      localStorage.removeItem(SUMMARY_STORAGE_KEY)
    } catch {
      console.error('清除所有摘要失败')
    }
  },
}))
