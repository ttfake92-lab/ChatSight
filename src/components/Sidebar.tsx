import { Search, MessageCircle, Users, Loader2 } from 'lucide-react'
import { Input } from './ui/input'
import { useSessionStore } from '../stores/sessionStore'
import { cn, formatTime, truncateText } from '../lib/utils'
import type { Session } from '../types'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className = '' }: SidebarProps) {
  const {
    sessions,
    selectedSession,
    isLoading,
    searchQuery,
    setSearchQuery,
    setSelectedSession
  } = useSessionStore()

  const filteredSessions = sessions.filter((session) =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupSessions = filteredSessions.filter((s) => s.type === 'group')
  const privateSessions = filteredSessions.filter((s) => s.type === 'private')

  const renderSessionItem = (session: Session) => {
    const isSelected = selectedSession?.id === session.id

    return (
      <button
        key={session.id}
        onClick={() => setSelectedSession(session)}
        className={cn(
          'w-full text-left px-3 py-3 rounded-lg transition-colors hover:bg-accent',
          isSelected && 'bg-accent'
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
              session.type === 'group'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-green-100 text-green-600'
            )}
          >
            {session.type === 'group' ? (
              <Users className="h-5 w-5" />
            ) : (
              <MessageCircle className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{session.name}</h3>
              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                {formatTime(session.lastMessageTime)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {truncateText(session.lastMessage, 40)}
            </p>
            {session.unreadCount && session.unreadCount > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  {session.unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <aside className={cn('flex flex-col h-full bg-card border-r', className)}>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索会话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {groupSessions.length > 0 && (
              <div className="p-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  群聊 ({groupSessions.length})
                </h2>
                <div className="space-y-1">
                  {groupSessions.map(renderSessionItem)}
                </div>
              </div>
            )}

            {privateSessions.length > 0 && (
              <div className="p-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  私聊 ({privateSessions.length})
                </h2>
                <div className="space-y-1">
                  {privateSessions.map(renderSessionItem)}
                </div>
              </div>
            )}

            {filteredSessions.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? '未找到匹配的会话' : '暂无会话记录'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
