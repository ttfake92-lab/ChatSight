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

export interface WeChatAPI {
  init: () => Promise<any>
  getSessions: (limit?: number) => Promise<any>
  getHistory: (sessionName: string, limit?: number) => Promise<any>
  search: (keyword: string, sessionName?: string) => Promise<any>
  getStats: (sessionName?: string) => Promise<any>
  getContacts: (query?: string) => Promise<any>
  getNewMessages: (sinceTimestamp?: string) => Promise<any>
}

export interface ElectronAPI {
  platform: string
  wechat: WeChatAPI
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
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

export interface KeywordConfig {
  id: string
  keyword: string
  isRegex: boolean
  enabled: boolean
}

export interface MonitoringConfig {
  keywords: KeywordConfig[]
  silentHours: {
    enabled: boolean
    start: string
    end: string
    weekendsOnly: boolean
  }
}

export interface MessageTrend {
  date: string
  count: number
}

export interface HourlyDistribution {
  hour: number
  count: number
}

export interface MemberStats {
  name: string
  messageCount: number
}

export interface SearchResult {
  session: string
  messages: Message[]
}

export interface FAQItem {
  id: string
  question: string
  answer?: string
  timestamp: string
  sourceMessages: string[]
}

export interface FAQSession {
  sessionName: string
  faqs: FAQItem[]
  lastUpdated: string
}

export interface Stats {
  totalMessages: number
  totalMembers: number
  activeMembers: MemberStats[]
  messageTypes: { type: string; count: number }[]
  messageTrend?: MessageTrend[]
  hourlyDistribution?: HourlyDistribution[]
}
