export interface Session {
  id: string
  name: string
  type: 'private' | 'group'
  lastMessage: string
  lastMessageTime: string
  unreadCount?: number
}

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isSelf: boolean
}

export interface AISummary {
  overview: {
    totalMessages: number
    activeUsers: number
    peakHours: string[]
    trend: string
  }
  topics: {
    topic: string
    heat: 'high' | 'medium' | 'low'
    count: number
  }[]
  keyPoints: {
    type: 'suggestion' | 'consensus' | 'dispute'
    content: string
    author?: string
  }[]
  faqs: {
    question: string
    answer?: string
  }[]
  actionItems: {
    content: string
    priority: 'high' | 'medium' | 'low'
    assignTo?: string
  }[]
  insights: {
    content: string
    type: 'opportunity' | 'risk' | 'trend'
  }[]
}

export type AIProvider = 'openai' | 'claude' | 'local' | 'minimax'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model: string
  baseUrl?: string
}

export type WeChatError = 
  | { code: 'NOT_INITIALIZED'; message: string }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'EXECUTION_FAILED'; message: string }
  | { code: 'TIMEOUT'; message: string }
  | { code: 'PARSE_ERROR'; message: string }

export type AIError =
  | { code: 'INVALID_KEY'; message: string }
  | { code: 'QUOTA_EXCEEDED'; message: string }
  | { code: 'NETWORK_ERROR'; message: string }
  | { code: 'RATE_LIMIT'; message: string }
