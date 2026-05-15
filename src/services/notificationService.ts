export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  silent?: boolean
}

export interface NotificationResult {
  success: boolean
  error?: string
}

export interface KeywordMatchNotification {
  keyword: string
  sender: string
  chatName: string
  messagePreview: string
}

export class NotificationService {
  isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.electronAPI &&
      window.electronAPI.notification
    )
  }

  async show(options: NotificationOptions): Promise<NotificationResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: 'Notification API is not available'
      }
    }

    try {
      await window.electronAPI!.notification.show(options)
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return {
        success: false,
        error: message
      }
    }
  }

  async showKeywordMatch(match: KeywordMatchNotification): Promise<NotificationResult> {
    const { keyword, sender, chatName, messagePreview } = match

    return this.show({
      title: `${sender} 在 ${chatName}`,
      body: `关键词「${keyword}」: ${messagePreview.slice(0, 50)}${messagePreview.length > 50 ? '...' : ''}`
    })
  }
}
