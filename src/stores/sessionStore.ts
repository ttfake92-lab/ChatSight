import { create } from 'zustand'
import type { Session } from '../types'

interface SessionState {
  sessions: Session[]
  selectedSession: Session | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  setSessions: (sessions: Session[]) => void
  setSelectedSession: (session: Session | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  fetchSessions: (limit?: number) => Promise<void>
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  selectedSession: null,
  isLoading: false,
  error: null,
  searchQuery: '',

  setSessions: (sessions) => set({ sessions }),

  setSelectedSession: (session) => set({ selectedSession: session }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchSessions: async (limit?: number) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.wechat.getSessions(limit)
      const sessions: Session[] = Array.isArray(result) 
        ? result 
        : (result && typeof result === 'object' && 'sessions' in result) 
          ? (result as { sessions: Session[] }).sessions 
          : []
      set({ sessions, isLoading: false })
    } catch (err) {
      const error = err instanceof Error ? err.message : '获取会话列表失败'
      set({ error, isLoading: false })
    }
  },
}))
