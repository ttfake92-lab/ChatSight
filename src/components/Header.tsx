import { RefreshCw, Settings, Sparkles } from 'lucide-react'
import { Button } from './ui/button'

interface HeaderProps {
  onRefresh?: () => void
  onSettings?: () => void
  isRefreshing?: boolean
  className?: string
}

export function Header({
  onRefresh,
  onSettings,
  isRefreshing = false,
  className = ''
}: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}
    >
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">微信洞察</span>
            <span className="text-xs text-muted-foreground">
              WeChat Insight
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="刷新数据"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            title="设置"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
