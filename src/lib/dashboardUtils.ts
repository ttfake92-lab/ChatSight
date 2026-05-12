import { Stats } from '../types'

export type DashboardStats = Stats & {
  sessionName?: string
  lastUpdated?: string
}

export function createDefaultDashboardStats(): DashboardStats {
  return {
    totalMessages: 0,
    totalMembers: 0,
    activeMembers: [],
    messageTypes: [],
    messageTrend: [],
    hourlyDistribution: []
  }
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    const result = (num / 10000).toFixed(1)
    return parseFloat(result) + 'w'
  }
  if (num >= 1000) {
    const result = (num / 1000).toFixed(1)
    return parseFloat(result) + 'k'
  }
  return String(num)
}

export function getPeakHour(distribution?: { hour: number; count: number }[]): number | null {
  if (!distribution || distribution.length === 0) return null
  const peak = distribution.reduce((max, curr) =>
    curr.count > max.count ? curr : max
  )
  return peak.hour
}

export function getTopMembers(members: { name: string; messageCount: number }[], topN: number = 5): { name: string; messageCount: number }[] {
  return [...members]
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, topN)
}

export function calculateEngagementRate(stats: { totalMessages: number; totalMembers: number }): number {
  if (stats.totalMessages === 0 || stats.totalMembers === 0) return 0
  return Math.round((stats.totalMessages / stats.totalMembers) * 10) / 10
}
