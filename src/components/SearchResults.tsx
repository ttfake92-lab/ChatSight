import { Search, X, Loader2, ChevronLeft, Users } from 'lucide-react'
import { useSearchStore } from '../stores/searchStore'
import { cn, formatTime, truncateText } from '../lib/utils'
import type { Message, SearchResult } from '../types'
import { useMemo } from 'react'

interface SearchResultsProps {
  className?: string
  onBack?: () => void
  onSelectMessage?: (session: string, message: Message) => void
}

export function SearchResults({ className = '', onBack, onSelectMessage }: SearchResultsProps) {
  const {
    keyword,
    results,
    isSearching,
    error,
    selectedSession,
    setKeyword,
    setSelectedSession,
    performSearch,
    clearSearch,
  } = useSearchStore()

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value
    setKeyword(newKeyword)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(keyword)
    }
  }

  // 当没有选中的搜索结果
  const displayedResults = useMemo(() => {
    if (!selectedSession) {
      return results.filter((r) => r.session === selectedSession)
    }
    return results
  }, [results, selectedSession])

  // 高亮匹配的关键词
  const highlightKeyword = (text: string) => {
    if (!keyword.trim()) return text

    try {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      const parts = text.split(regex)
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
            part
          )
      )
    } catch {
      return text
    }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          <h2 className="text-lg font-semibold">搜索消息</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="输入关键词搜索消息..."
            value={keyword}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-9 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {keyword && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">搜索中...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <X className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : displayedResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {keyword ? '未找到相关消息' : '输入关键词开始搜索'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedResults.map((result: SearchResult, idx) => (
              <div key={idx} className="space-y-2">
                {!selectedSession && (
                  <button
                    onClick={() => setSelectedSession(result.session)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    {result.session}
                  </button>
                )}
                <div className="space-y-2">
                  {result.messages.map((message: Message, msgIdx: number) => (
                    <button
                      key={message.id || msgIdx}
                      onClick={() =>
                        onSelectMessage?.(result.session, message)
                      }
                      className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.sender}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {highlightKeyword(truncateText(message.content, 200))}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
