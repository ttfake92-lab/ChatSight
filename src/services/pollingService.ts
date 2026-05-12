import type { Message } from '../types'

interface PollingServiceOptions {
  interval?: number
  onMessages?: (messages: Message[]) => void
  onError?: (error: unknown) => void
}

interface PollingState {
  isPolling: boolean
  intervalId: ReturnType<typeof setInterval> | null
  lastTimestamp: string | null
  options: PollingServiceOptions
}

const state: PollingState = {
  isPolling: false,
  intervalId: null,
  lastTimestamp: null,
  options: {}
}

const DEFAULT_INTERVAL = 30000

function startPolling(options: PollingServiceOptions = {}): void {
  if (state.isPolling) {
    return
  }

  state.options = options
  const interval = options.interval || DEFAULT_INTERVAL

  const poll = async () => {
    if (!window.electronAPI?.wechat?.getNewMessages) {
      return
    }

    try {
      const result = await window.electronAPI.wechat.getNewMessages(state.lastTimestamp || undefined)

      if (result && !result.error) {
        const messages = result as Message[]

        if (messages.length > 0) {
          state.lastTimestamp = messages[messages.length - 1].timestamp

          if (options.onMessages) {
            options.onMessages(messages)
          }
        }
      } else if (result?.error && options.onError) {
        options.onError(result.error)
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error)
      }
    }
  }

  poll()

  state.intervalId = setInterval(poll, interval)
  state.isPolling = true
}

function stopPolling(): void {
  if (state.intervalId) {
    clearInterval(state.intervalId)
    state.intervalId = null
  }
  state.isPolling = false
  state.options = {}
}

function isPolling(): boolean {
  return state.isPolling
}

function getLastTimestamp(): string | null {
  return state.lastTimestamp
}

function resetState(): void {
  if (state.intervalId) {
    clearInterval(state.intervalId)
  }
  state.isPolling = false
  state.intervalId = null
  state.lastTimestamp = null
  state.options = {}
}

export const pollingService = {
  startPolling,
  stopPolling,
  isPolling,
  getLastTimestamp,
  resetState
}

export { startPolling, stopPolling, isPolling }
