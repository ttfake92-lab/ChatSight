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

export interface Contact {
  id: string
  name: string
  type: 'friend' | 'group'
  avatar?: string
}

export interface SearchResult {
  session: string
  messages: Message[]
}

export interface MessageTrend {
  date: string
  count: number
}

export interface HourlyDistribution {
  hour: number
  count: number
}

export interface Stats {
  totalMessages: number
  totalMembers: number
  activeMembers: MemberStats[]
  messageTypes: { type: string; count: number }[]
  messageTrend?: MessageTrend[]
  hourlyDistribution?: HourlyDistribution[]
}

export interface MemberStats {
  name: string
  messageCount: number
}

export type WeChatError = 
  | { code: 'NOT_INITIALIZED'; message: string }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'EXECUTION_FAILED'; message: string }
  | { code: 'TIMEOUT'; message: string }
  | { code: 'PARSE_ERROR'; message: string }
