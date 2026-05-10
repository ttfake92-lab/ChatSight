import { create } from 'zustand'
import type { Message } from '../types'

interface MessageState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  setMessages: (messages: Message[]) => void
  appendMessages: (messages: Message[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setHasMore: (hasMore: boolean) => void
  fetchHistory: (sessionName: string, limit?: number) => Promise<void>
  clearMessages: () => void
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  hasMore: true,

  setMessages: (messages) => set({ messages }),

  appendMessages: (newMessages) => set((state) => ({
    messages: [...state.messages, ...newMessages]
  })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setHasMore: (hasMore) => set({ hasMore }),

  fetchHistory: async (sessionName: string, limit?: number) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.wechat.getHistory(sessionName, limit)
      const messages: Message[] = Array.isArray(result) 
        ? result 
        : (result && typeof result === 'object' && 'messages' in result) 
          ? (result as { messages: Message[] }).messages 
          : []
      set({ 
        messages, 
        hasMore: messages.length === (limit || 50),
        isLoading: false 
      })
    } catch (err) {
      const error = err instanceof Error ? err.message : '获取聊天记录失败'
      set({ error, isLoading: false })
    }
  },

  clearMessages: () => set({ messages: [], hasMore: true, error: null }),
}))
