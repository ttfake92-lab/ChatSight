import {
  createDefaultDashboardStats,
  formatNumber,
  getPeakHour,
  getTopMembers,
  calculateEngagementRate
} from './dashboardUtils'

describe('dashboardUtils', () => {
  describe('createDefaultDashboardStats', () => {
    it('应返回包含所有必需字段的默认统计对象', () => {
      const stats = createDefaultDashboardStats()

      expect(stats.totalMessages).toBe(0)
      expect(stats.totalMembers).toBe(0)
      expect(stats.activeMembers).toEqual([])
      expect(stats.messageTypes).toEqual([])
      expect(stats.messageTrend).toEqual([])
      expect(stats.hourlyDistribution).toEqual([])
    })
  })

  describe('formatNumber', () => {
    it('应正确格式化小于 1000 的数字', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(100)).toBe('100')
      expect(formatNumber(999)).toBe('999')
    })

    it('应正确格式化千位数', () => {
      expect(formatNumber(1000)).toBe('1k')
      expect(formatNumber(1500)).toBe('1.5k')
      expect(formatNumber(9999)).toBe('10k')
    })

    it('应正确格式化万位数', () => {
      expect(formatNumber(10000)).toBe('1w')
      expect(formatNumber(15000)).toBe('1.5w')
      expect(formatNumber(99999)).toBe('10w')
    })
  })

  describe('getPeakHour', () => {
    it('应返回消息数量最多的时段', () => {
      const distribution = [
        { hour: 0, count: 10 },
        { hour: 9, count: 50 },
        { hour: 12, count: 100 },
        { hour: 21, count: 30 }
      ]
      expect(getPeakHour(distribution)).toBe(12)
    })

    it('应处理空数组', () => {
      expect(getPeakHour([])).toBeNull()
    })

    it('应处理 undefined', () => {
      expect(getPeakHour(undefined)).toBeNull()
    })
  })

  describe('getTopMembers', () => {
    it('应返回按消息数量排序的前 N 名成员', () => {
      const members = [
        { name: '张三', messageCount: 50 },
        { name: '李四', messageCount: 100 },
        { name: '王五', messageCount: 30 },
        { name: '赵六', messageCount: 80 }
      ]

      const top3 = getTopMembers(members, 3)

      expect(top3).toHaveLength(3)
      expect(top3[0].name).toBe('李四')
      expect(top3[1].name).toBe('赵六')
      expect(top3[2].name).toBe('张三')
    })

    it('应处理成员数量少于 topN 的情况', () => {
      const members = [
        { name: '张三', messageCount: 50 },
        { name: '李四', messageCount: 100 }
      ]

      const top5 = getTopMembers(members, 5)

      expect(top5).toHaveLength(2)
    })

    it('不应修改原数组', () => {
      const members = [
        { name: '张三', messageCount: 50 },
        { name: '李四', messageCount: 100 }
      ]

      const top1 = getTopMembers(members, 1)

      expect(members).toHaveLength(2)
      expect(top1).toHaveLength(1)
    })
  })

  describe('calculateEngagementRate', () => {
    it('应正确计算参与率', () => {
      expect(calculateEngagementRate({ totalMessages: 1000, totalMembers: 100 })).toBe(10)
    })

    it('应处理零消息数', () => {
      expect(calculateEngagementRate({ totalMessages: 0, totalMembers: 100 })).toBe(0)
    })

    it('应处理零成员数', () => {
      expect(calculateEngagementRate({ totalMessages: 1000, totalMembers: 0 })).toBe(0)
    })

    it('应保留一位小数', () => {
      expect(calculateEngagementRate({ totalMessages: 100, totalMembers: 33 })).toBe(3)
    })
  })
})
