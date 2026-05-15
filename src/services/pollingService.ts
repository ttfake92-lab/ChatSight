import type { Message } from '../types'

interface APIResult {
  error?: string
  code?: string
}

interface PollingServiceOptions {
  interval?: number
  onMessages?: (messages: Message[]) => void
  onError?: (error: unknown) => void
}

export class PollingService {
  private isPolling: boolean = false
  private intervalId: ReturnType<typeof setInterval> | null = null
  private lastTimestamp: string | null = null
  private options: PollingServiceOptions = {}
  private readonly defaultInterval: number = 30000

  startPolling(options: PollingServiceOptions = {}): void {
    if (this.isPolling) {
      return
    }

    this.options = options
    const interval = options.interval || this.defaultInterval

    const poll = async () => {
      if (!window.electronAPI?.wechat?.getNewMessages) {
        return
      }

      try {
        const result = await window.electronAPI.wechat.getNewMessages(this.lastTimestamp || undefined)

        const apiResult = result as APIResult
        if (apiResult && !apiResult.error) {
          const messages = result as Message[]

          if (messages.length > 0) {
            this.lastTimestamp = messages[messages.length - 1].timestamp

            if (this.options.onMessages) {
              this.options.onMessages(messages)
            }
          }
        } else if (apiResult?.error && this.options.onError) {
          this.options.onError(apiResult.error)
        }
      } catch (error) {
        if (this.options.onError) {
          this.options.onError(error)
        }
      }
    }

    poll()

    this.intervalId = setInterval(poll, interval)
    this.isPolling = true
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isPolling = false
    this.options = {}
  }

  getIsPolling(): boolean {
    return this.isPolling
  }

  getLastTimestamp(): string | null {
    return this.lastTimestamp
  }

  reset(): void {
    this.stopPolling()
    this.lastTimestamp = null
  }
}

// 为了向后兼容，保留一个默认实例的导出
export const pollingService = new PollingService()
