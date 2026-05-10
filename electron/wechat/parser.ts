import { Session, Message, Contact, SearchResult, Stats, MemberStats } from './types'

export class WeChatParser {
  parseSessions(output: string): Session[] {
    try {
      const data = JSON.parse(output)
      if (Array.isArray(data)) {
        return data.map((item: any, index: number) => ({
          id: item.id || String(index),
          name: item.name || item.userName || '',
          type: item.type || (item.isGroup ? 'group' : 'private'),
          lastMessage: item.lastMessage || item.content || '',
          lastMessageTime: item.lastMessageTime || item.createTime || '',
          unreadCount: item.unreadCount || 0
        }))
      }
    } catch {
      return this.parseSessionsFromText(output)
    }
    return []
  }

  private parseSessionsFromText(output: string): Session[] {
    const sessions: Session[] = []
    const lines = output.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      const match = line.match(/^\[?(.*?)\]?\s*\|?\s*(.*)$/)
      if (match) {
        sessions.push({
          id: this.generateId(),
          name: match[1].trim(),
          type: match[1].includes('群') ? 'group' : 'private',
          lastMessage: match[2].trim(),
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        })
      }
    }
    return sessions
  }

  parseHistory(output: string): Message[] {
    try {
      const data = JSON.parse(output)
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id || this.generateId(),
          sender: item.sender || item.from || '',
          content: item.content || item.message || '',
          timestamp: item.timestamp || item.time || new Date().toISOString(),
          isSelf: item.isSelf || item.from === 'self' || false
        }))
      }
    } catch {
      return this.parseHistoryFromText(output)
    }
    return []
  }

  private parseHistoryFromText(output: string): Message[] {
    const messages: Message[] = []
    const lines = output.split('\n').filter(line => line.trim())
    const timeRegex = /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/
    
    for (const line of lines) {
      const timeMatch = line.match(timeRegex)
      const colonIndex = line.indexOf(':')
      
      if (colonIndex > 0) {
        const sender = line.substring(0, colonIndex).replace(timeRegex, '').trim()
        const content = line.substring(colonIndex + 1).trim()
        
        messages.push({
          id: this.generateId(),
          sender: sender,
          content: content,
          timestamp: timeMatch ? timeMatch[1] : new Date().toISOString(),
          isSelf: sender.toLowerCase().includes('self') || sender.includes('我')
        })
      }
    }
    return messages
  }

  parseSearchResults(output: string): SearchResult[] {
    try {
      const data = JSON.parse(output)
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          session: item.session || item.chatName || '',
          messages: item.messages ? this.parseHistory(JSON.stringify(item.messages)) : []
        }))
      }
    } catch {
      return this.parseSearchResultsFromText(output)
    }
    return []
  }

  private parseSearchResultsFromText(output: string): SearchResult[] {
    const results: SearchResult[] = []
    const sections = output.split(/\n(?=会话|Chat)/i).filter(s => s.trim())
    
    for (const section of sections) {
      const lines = section.split('\n')
      const sessionName = lines[0]?.replace(/^会话:|Chat:\s*/i, '').trim() || ''
      const messages = this.parseHistory(lines.slice(1).join('\n'))
      
      if (sessionName || messages.length > 0) {
        results.push({
          session: sessionName,
          messages
        })
      }
    }
    return results
  }

  parseContacts(output: string): Contact[] {
    try {
      const data = JSON.parse(output)
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id || item.userName || '',
          name: item.name || item.nickName || '',
          type: item.type || (item.isGroup ? 'group' : 'friend'),
          avatar: item.avatar || ''
        }))
      }
    } catch {
      return this.parseContactsFromText(output)
    }
    return []
  }

  private parseContactsFromText(output: string): Contact[] {
    const contacts: Contact[] = []
    const lines = output.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      const parts = line.split(/[\t,|]/).map(p => p.trim()).filter(Boolean)
      if (parts.length > 0) {
        contacts.push({
          id: this.generateId(),
          name: parts[0],
          type: parts.length > 1 && parts[1].includes('群') ? 'group' : 'friend',
          avatar: ''
        })
      }
    }
    return contacts
  }

  parseStats(output: string): Stats {
    try {
      const data = JSON.parse(output)
      return {
        totalMessages: data.totalMessages || data.messageCount || 0,
        totalMembers: data.totalMembers || data.memberCount || 0,
        activeMembers: this.parseMemberStats(data.activeMembers || data.topMembers || []),
        messageTypes: this.parseMessageTypes(data.messageTypes || data.types || [])
      }
    } catch {
      return this.parseStatsFromText(output)
    }
  }

  private parseMemberStats(data: any[]): MemberStats[] {
    if (Array.isArray(data)) {
      return data.map(item => ({
        name: item.name || item.user || '',
        messageCount: item.messageCount || item.count || 0
      }))
    }
    return []
  }

  private parseMessageTypes(data: any[]): { type: string; count: number }[] {
    if (Array.isArray(data)) {
      return data.map(item => ({
        type: item.type || item.name || 'unknown',
        count: item.count || 0
      }))
    }
    return []
  }

  private parseStatsFromText(output: string): Stats {
    const stats: Stats = {
      totalMessages: 0,
      totalMembers: 0,
      activeMembers: [],
      messageTypes: []
    }

    const totalMsgMatch = output.match(/总消息[：:]\s*(\d+)/i) || output.match(/Total Messages:\s*(\d+)/i)
    if (totalMsgMatch) {
      stats.totalMessages = parseInt(totalMsgMatch[1])
    }

    const totalMembersMatch = output.match(/总成员[：:]\s*(\d+)/i) || output.match(/Total Members:\s*(\d+)/i)
    if (totalMembersMatch) {
      stats.totalMembers = parseInt(totalMembersMatch[1])
    }

    const memberLines = output.match(/^\s*([^|]+?)\s*\|\s*(\d+)\s*$/gm)
    if (memberLines) {
      stats.activeMembers = memberLines.map(line => {
        const parts = line.split('|').map(p => p.trim())
        return {
          name: parts[0],
          messageCount: parseInt(parts[1]) || 0
        }
      })
    }

    return stats
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
