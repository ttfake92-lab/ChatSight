import { NotificationService, NotificationOptions } from './notificationService'

describe('NotificationService', () => {
  let notificationService: NotificationService
  let mockElectronAPI: any

  beforeEach(() => {
    mockElectronAPI = {
      notification: {
        show: jest.fn().mockResolvedValue({ success: true })
      }
    }
    ;(global as any).window = { electronAPI: mockElectronAPI }
    notificationService = new NotificationService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('show', () => {
    it('should call electron notification API with correct options', async () => {
      const options: NotificationOptions = {
        title: 'Test Notification',
        body: 'This is a test notification'
      }

      await notificationService.show(options)

      expect(mockElectronAPI.notification.show).toHaveBeenCalledWith(options)
    })

    it('should return success result when notification is shown', async () => {
      const options: NotificationOptions = {
        title: 'Test',
        body: 'Body'
      }

      const result = await notificationService.show(options)

      expect(result).toEqual({ success: true })
    })

    it('should return error result when notification fails', async () => {
      mockElectronAPI.notification.show.mockRejectedValue(new Error('Notification failed'))

      const options: NotificationOptions = {
        title: 'Test',
        body: 'Body'
      }

      const result = await notificationService.show(options)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Notification failed')
    })

    it('should handle missing electronAPI gracefully', async () => {
      ;(global as any).window = {}

      const service = new NotificationService()
      const options: NotificationOptions = {
        title: 'Test',
        body: 'Body'
      }

      const result = await service.show(options)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not available')
    })
  })

  describe('showKeywordMatch', () => {
    it('should show notification with keyword match format', async () => {
      const result = await notificationService.showKeywordMatch({
        keyword: 'urgent',
        sender: 'John',
        chatName: 'Project Team',
        messagePreview: 'This is urgent!'
      })

      expect(mockElectronAPI.notification.show).toHaveBeenCalledWith({
        title: expect.stringContaining('John'),
        body: expect.stringContaining('urgent')
      })
      expect(result.success).toBe(true)
    })
  })

  describe('isSupported', () => {
    it('should return true when notification API is available', () => {
      expect(notificationService.isSupported()).toBe(true)
    })

    it('should return false when notification API is not available', () => {
      ;(global as any).window = {}
      const service = new NotificationService()
      expect(service.isSupported()).toBe(false)
    })
  })
})
