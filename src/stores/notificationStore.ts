import { create } from 'zustand'

export interface NotificationItem {
  id: string
  keyword: string
  sender: string
  chatName: string
  messagePreview: string
  timestamp: number
  read: boolean
}

interface NotificationState {
  notifications: NotificationItem[]
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  removeNotification: (id: string) => void
  getUnreadCount: () => number
}

const NOTIFICATIONS_KEY = 'chatsight-notifications'

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    }
    set((state) => {
      const updated = [newNotification, ...state.notifications].slice(0, 100)
      try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error('保存通知失败')
      }
      return { notifications: updated }
    })
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error('保存通知失败')
      }
      return { notifications: updated }
    })
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }))
      try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error('保存通知失败')
      }
      return { notifications: updated }
    })
  },

  clearNotifications: () => {
    set({ notifications: [] })
    try {
      localStorage.removeItem(NOTIFICATIONS_KEY)
    } catch (err) {
      console.error('清除通知失败')
    }
  },

  removeNotification: (id) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id)
      try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error('保存通知失败')
      }
      return { notifications: updated }
    })
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length
  },
}))

export const loadNotificationsFromStorage = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as NotificationItem[]
      useNotificationStore.setState({ notifications: parsed })
    }
  } catch {
    useNotificationStore.setState({ notifications: [] })
  }
}
