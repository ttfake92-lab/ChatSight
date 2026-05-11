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
    
    if (!window.electronAPI || !window.electronAPI.wechat) {
      set({ error: 'Electron API 未初始化，请确保在 Electron 环境中运行', isLoading: false })
      return
    }
    
    try {
      const result = await window.electronAPI.wechat.getHistory(sessionName, limit)
      
      let messages: Message[] = []
      
      if (Array.isArray(result)) {
        messages = result as Message[]
      } else if (result && typeof result === 'object' && 'messages' in result) {
        const data = result as { messages: string[] | Message[] }
        
        if (Array.isArray(data.messages)) {
          if (typeof data.messages[0] === 'string') {
            messages = (data.messages as string[]).map((msg: string, index: number) => {
              const match = msg.match(/^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\]\s*(.+?):\s*(.+)$/)
              if (match) {
                return {
                  id: String(index),
                  timestamp: match[1],
                  sender: match[2],
                  content: match[3],
                  isSelf: false
                }
              }
              return {
                id: String(index),
                timestamp: '',
                sender: '未知',
                content: msg,
                isSelf: false
              }
            })
          } else {
            messages = data.messages as Message[]
          }
        }
      }
      
      set({ 
        messages, 
        hasMore: messages.length === (limit || 50),
        isLoading: false 
      })
    } catch (err) {
      console.error('获取聊天记录失败:', err)
      const error = err instanceof Error ? err.message : '获取聊天记录失败'
      set({ error, isLoading: false })
    }
  },

  clearMessages: () => set({ messages: [], hasMore: true, error: null }),
}))
