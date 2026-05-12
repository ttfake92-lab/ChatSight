import { isInSilentHours } from './silentHours'
import type { MonitoringConfig } from '../types'

describe('isInSilentHours', () => {
  const baseConfig: MonitoringConfig['silentHours'] = {
    enabled: true,
    start: '22:00',
    end: '08:00',
    weekendsOnly: false,
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return false when silent hours is disabled', () => {
    const config = { ...baseConfig, enabled: false }
    expect(isInSilentHours(config)).toBe(false)
  })

  it('should return true when current time is within silent hours (overnight)', () => {
    jest.setSystemTime(new Date('2026-05-12T23:00:00'))
    expect(isInSilentHours(baseConfig)).toBe(true)
  })

  it('should return true when current time is within silent hours (early morning)', () => {
    jest.setSystemTime(new Date('2026-05-12T06:00:00'))
    expect(isInSilentHours(baseConfig)).toBe(true)
  })

  it('should return false when current time is outside silent hours', () => {
    jest.setSystemTime(new Date('2026-05-12T14:00:00'))
    expect(isInSilentHours(baseConfig)).toBe(false)
  })

  it('should return false on weekdays when weekendsOnly is true', () => {
    const config = { ...baseConfig, weekendsOnly: true }
    jest.setSystemTime(new Date('2026-05-12T23:00:00'))
    expect(isInSilentHours(config)).toBe(false)
  })

  it('should return true on Saturday when weekendsOnly is true', () => {
    const config = { ...baseConfig, weekendsOnly: true }
    jest.setSystemTime(new Date('2026-05-16T23:00:00'))
    expect(isInSilentHours(config)).toBe(true)
  })

  it('should return true on Sunday when weekendsOnly is true', () => {
    const config = { ...baseConfig, weekendsOnly: true }
    jest.setSystemTime(new Date('2026-05-17T06:00:00'))
    expect(isInSilentHours(config)).toBe(true)
  })

  it('should handle same-day silent hours', () => {
    const config: MonitoringConfig['silentHours'] = {
      enabled: true,
      start: '12:00',
      end: '14:00',
      weekendsOnly: false,
    }
    jest.setSystemTime(new Date('2026-05-12T13:00:00'))
    expect(isInSilentHours(config)).toBe(true)
    jest.setSystemTime(new Date('2026-05-12T15:00:00'))
    expect(isInSilentHours(config)).toBe(false)
  })
})
