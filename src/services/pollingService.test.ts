import type { Message } from '../types'
import { startPolling, stopPolling, isPolling } from './pollingService'

describe('pollingService', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      sender: 'Test User',
      content: 'Test message',
      timestamp: '2024-01-01T12:00:00Z',
      isSelf: false
    }
  ]

  let originalWindow: typeof globalThis.window

  beforeEach(() => {
    jest.useFakeTimers()
    originalWindow = globalThis.window
  })

  afterEach(() => {
    stopPolling()
    jest.useRealTimers()
    globalThis.window = originalWindow
    jest.clearAllMocks()
  })

  const mockWindow = (getNewMessagesMock: jest.Mock) => {
    ;(globalThis as any).window = {
      electronAPI: {
        wechat: {
          getNewMessages: getNewMessagesMock
        }
      }
    }
  }

  const flushTimersAndPromises = async () => {
    await Promise.resolve()
    jest.runAllTicks()
  }

  describe('startPolling', () => {
    it('should call getNewMessages immediately on start', async () => {
      const getNewMessagesMock = jest.fn().mockResolvedValue(mockMessages)
      mockWindow(getNewMessagesMock)

      startPolling()
      await flushTimersAndPromises()
      expect(getNewMessagesMock).toHaveBeenCalledTimes(1)
    })

    it('should respect custom interval', async () => {
      const getNewMessagesMock = jest.fn().mockResolvedValue(mockMessages)
      mockWindow(getNewMessagesMock)

      startPolling({ interval: 60000 })
      await flushTimersAndPromises()
      jest.advanceTimersByTime(60000)
      await flushTimersAndPromises()
      expect(getNewMessagesMock).toHaveBeenCalledTimes(2)
    })

    it('should call onMessages callback with new messages', async () => {
      const getNewMessagesMock = jest.fn().mockResolvedValue(mockMessages)
      const onMessagesMock = jest.fn()
      mockWindow(getNewMessagesMock)

      startPolling({ onMessages: onMessagesMock })
      await flushTimersAndPromises()
      jest.advanceTimersByTime(30000)
      await flushTimersAndPromises()
      expect(onMessagesMock).toHaveBeenCalled()
    })

    it('should call onError callback on error', async () => {
      const error = new Error('Test error')
      const getNewMessagesMock = jest.fn().mockRejectedValue(error)
      const onErrorMock = jest.fn()
      mockWindow(getNewMessagesMock)

      startPolling({ onError: onErrorMock })
      await flushTimersAndPromises()
      jest.advanceTimersByTime(30000)
      await flushTimersAndPromises()
      expect(onErrorMock).toHaveBeenCalled()
    })
  })

  describe('stopPolling', () => {
    it('should stop polling', async () => {
      const getNewMessagesMock = jest.fn().mockResolvedValue(mockMessages)
      mockWindow(getNewMessagesMock)

      startPolling()
      await flushTimersAndPromises()
      stopPolling()
      jest.advanceTimersByTime(60000)
      expect(getNewMessagesMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('isPolling', () => {
    it('should return true when polling', () => {
      const getNewMessagesMock = jest.fn().mockResolvedValue(mockMessages)
      mockWindow(getNewMessagesMock)

      startPolling()
      expect(isPolling()).toBe(true)
    })
  })
})
