import { useEffect } from 'react'
import { Bell, BellOff, Check, CheckCheck, Trash2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useNotificationStore, loadNotificationsFromStorage, NotificationItem } from '../stores/notificationStore'

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`
  if (diffHours < 24) return `${diffHours} 小时前`
  if (diffDays < 7) return `${diffDays} 天前`
  return date.toLocaleDateString('zh-CN')
}

function NotificationItemView({ 
  notification, 
  onMarkRead, 
  onRemove 
}: { 
  notification: NotificationItem
  onMarkRead: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        notification.read ? 'bg-card opacity-70' : 'bg-primary/5 border-primary/20'
      }`}
    >
      <div className={`flex-shrink-0 mt-0.5 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`}>
        <Bell className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{notification.sender}</span>
          <span className="text-xs text-muted-foreground">在</span>
          <span className="text-sm text-muted-foreground">{notification.chatName}</span>
        </div>
        <p className="text-sm mt-1">
          <span className="text-primary font-medium">「{notification.keyword}」</span>
          <span className="text-muted-foreground">: </span>
          <span className="text-foreground">{notification.messagePreview}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(notification.timestamp)}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkRead(notification.id)}
            title="标记为已读"
            className="h-7 w-7 p-0"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(notification.id)}
          title="删除"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function NotificationPanel() {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications, 
    removeNotification,
    getUnreadCount 
  } = useNotificationStore()

  useEffect(() => {
    loadNotificationsFromStorage()
  }, [])

  const unreadCount = getUnreadCount()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          通知中心
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              全部已读
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="h-8 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              清空
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BellOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">暂无通知</p>
            <p className="text-xs mt-1">关键词匹配时将在此显示通知</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItemView
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
                onRemove={removeNotification}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
