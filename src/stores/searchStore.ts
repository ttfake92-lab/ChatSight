import { create } from 'zustand'
import type { SearchResult } from '../types'

interface SearchState {
  keyword: string
  results: SearchResult[]
  isSearching: boolean
  isSearchMode: boolean
  error: string | null
  selectedSession: string | null
  setKeyword: (keyword: string) => void
  setIsSearchMode: (mode: boolean) => void
  setSelectedSession: (session: string | null) => void
  performSearch: (keyword: string, sessionName?: string) => Promise<void>
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  keyword: '',
  results: [],
  isSearching: false,
  isSearchMode: false,
  error: null,
  selectedSession: null,

  setKeyword: (keyword: string) => set({ keyword }),

  setIsSearchMode: (mode: boolean) => set({ isSearchMode: mode }),

  setSelectedSession: (session: string | null) => set({ selectedSession: session }),

  performSearch: async (keyword: string, sessionName?: string) => {
    if (!keyword.trim()) {
      set({ results: [], error: null })
      return
    }

    set({ isSearching: true, error: null })

    if (!window.electronAPI || !window.electronAPI.wechat) {
      set({ error: 'Electron API 未初始化', isSearching: false })
      return
    }

    try {
      const result = await window.electronAPI.wechat.search(keyword, sessionName)
      const apiResult = result as { error?: string }

      if (apiResult && apiResult.error) {
        set({ error: apiResult.error, isSearching: false })
        return
      }

      const results: SearchResult[] = Array.isArray(result)
        ? result
        : (result && typeof result === 'object' && 'results' in result)
          ? (result as { results: SearchResult[] }).results
          : []

      set({ results, isSearching: false })
    } catch (err) {
      console.error('搜索失败:', err)
      const error = err instanceof Error ? err.message : '搜索失败'
      set({ error, isSearching: false })
    }
  },

  clearSearch: () =>
    set({
      keyword: '',
      results: [],
      isSearching: false,
      error: null,
      selectedSession: null,
    }),
}))
