import { useEffect, useRef } from 'react'
import { MessageCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { useMessageStore } from '../stores/messageStore'
import { useSessionStore } from '../stores/sessionStore'
import { cn } from '../lib/utils'
import type { Message } from '../types'

export function ChatHistory() {
  const { messages, isLoading, error, fetchHistory } = useMessageStore()
  const { selectedSession } = useSessionStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleRetry = () => {
    if (selectedSession) {
      fetchHistory(selectedSession.name)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const time = date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })

    if (isToday) {
      return time
    } else {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = date.toDateString() === yesterday.toDateString()
      
      if (isYesterday) {
        return `昨天 ${time}`
      } else {
        return `${date.getMonth() + 1}/${date.getDate()} ${time}`
      }
    }
  }

  const renderMessage = (message: Message) => {
    return (
      <div
        key={message.id}
        className={cn(
          'flex w-full mb-4',
          message.isSelf ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'flex flex-col max-w-[70%] rounded-lg p-3',
            message.isSelf
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {!message.isSelf && (
            <div className="text-xs font-medium mb-1 opacity-80">
              {message.sender}
            </div>
          )}
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
          <div
            className={cn(
              'text-[10px] mt-1',
              message.isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}
          >
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    )
  }

  if (!selectedSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          选择一个会话
        </h3>
        <p className="text-sm text-muted-foreground/70">
          从左侧选择一个会话以查看聊天记录
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">加载聊天记录中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-destructive mb-2">
          加载失败
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          重试
        </Button>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          暂无消息
        </h3>
        <p className="text-sm text-muted-foreground/70">
          该会话暂无聊天记录
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{selectedSession.name}</h2>
            <p className="text-xs text-muted-foreground">
              {messages.length} 条消息
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
