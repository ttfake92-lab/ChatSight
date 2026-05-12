import type { MonitoringConfig } from '../types'

export function isInSilentHours(silentHours: MonitoringConfig['silentHours']): boolean {
  if (!silentHours.enabled) {
    return false
  }

  const now = new Date()
  const currentDay = now.getDay()
  
  if (silentHours.weekendsOnly && currentDay !== 0 && currentDay !== 6) {
    return false
  }

  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const [startHour, startMin] = silentHours.start.split(':').map(Number)
  const [endHour, endMin] = silentHours.end.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  if (startMinutes <= endMinutes) {
    return currentTime >= startMinutes && currentTime <= endMinutes
  } else {
    return currentTime >= startMinutes || currentTime <= endMinutes
  }
}
