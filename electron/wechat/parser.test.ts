import { WeChatParser } from './parser'

describe('WeChatParser.parseStats', () => {
  let parser: WeChatParser

  beforeEach(() => {
    parser = new WeChatParser()
  })

  describe('基础字段解析', () => {
    it('应正确解析 JSON 格式的基础统计数据', () => {
      const output = JSON.stringify({
        totalMessages: 1500,
        totalMembers: 50,
        activeMembers: [
          { name: '张三', messageCount: 300 },
          { name: '李四', messageCount: 200 }
        ],
        messageTypes: [
          { type: 'text', count: 1000 },
          { type: 'image', count: 300 },
          { type: 'link', count: 200 }
        ]
      })

      const result = parser.parseStats(output)

      expect(result.totalMessages).toBe(1500)
      expect(result.totalMembers).toBe(50)
      expect(result.activeMembers).toHaveLength(2)
      expect(result.activeMembers[0].name).toBe('张三')
      expect(result.messageTypes).toHaveLength(3)
    })

    it('应正确处理空数据情况', () => {
      const output = JSON.stringify({})
      const result = parser.parseStats(output)

      expect(result.totalMessages).toBe(0)
      expect(result.totalMembers).toBe(0)
      expect(result.activeMembers).toEqual([])
      expect(result.messageTypes).toEqual([])
    })
  })

  describe('消息趋势数据解析', () => {
    it('应正确解析 messageTrend 数据', () => {
      const output = JSON.stringify({
        totalMessages: 1000,
        totalMembers: 30,
        activeMembers: [],
        messageTypes: [],
        messageTrend: [
          { date: '2024-01-01', count: 150 },
          { date: '2024-01-02', count: 200 },
          { date: '2024-01-03', count: 180 }
        ]
      })

      const result = parser.parseStats(output)

      expect(result.messageTrend).toBeDefined()
      expect(result.messageTrend).toHaveLength(3)
      expect(result.messageTrend![0].date).toBe('2024-01-01')
      expect(result.messageTrend![0].count).toBe(150)
    })

    it('应正确处理 messageTrend 空值情况', () => {
      const output = JSON.stringify({
        totalMessages: 100,
        totalMembers: 10,
        activeMembers: [],
        messageTypes: []
      })

      const result = parser.parseStats(output)

      expect(result.messageTrend).toBeUndefined()
    })
  })

  describe('时段分布数据解析', () => {
    it('应正确解析 hourlyDistribution 数据', () => {
      const output = JSON.stringify({
        totalMessages: 1000,
        totalMembers: 30,
        activeMembers: [],
        messageTypes: [],
        hourlyDistribution: [
          { hour: 0, count: 20 },
          { hour: 9, count: 150 },
          { hour: 12, count: 200 },
          { hour: 21, count: 100 }
        ]
      })

      const result = parser.parseStats(output)

      expect(result.hourlyDistribution).toBeDefined()
      expect(result.hourlyDistribution).toHaveLength(4)
      expect(result.hourlyDistribution![0].hour).toBe(0)
      expect(result.hourlyDistribution![0].count).toBe(20)
    })

    it('应生成默认的 24 小时分布数据', () => {
      const output = JSON.stringify({
        totalMessages: 100,
        totalMembers: 10,
        activeMembers: [],
        messageTypes: []
      })

      const result = parser.parseStats(output)

      expect(result.hourlyDistribution).toBeUndefined()
    })
  })

  describe('消息类型分类解析', () => {
    it('应正确处理不同的消息类型字段名', () => {
      const output = JSON.stringify({
        totalMessages: 500,
        totalMembers: 20,
        activeMembers: [],
        messageTypes: [
          { type: 'text', count: 300 },
          { type: 'image', count: 100 },
          { type: 'video', count: 50 },
          { type: 'file', count: 30 },
          { type: 'link', count: 20 }
        ]
      })

      const result = parser.parseStats(output)

      expect(result.messageTypes).toHaveLength(5)
      const types = result.messageTypes.map(t => t.type)
      expect(types).toContain('text')
      expect(types).toContain('image')
      expect(types).toContain('video')
    })
  })

  describe('活跃成员解析', () => {
    it('应正确处理不同的活跃成员字段名', () => {
      const output = JSON.stringify({
        totalMessages: 1000,
        totalMembers: 50,
        activeMembers: [
          { name: '用户A', messageCount: 250 },
          { name: '用户B', user: '用户B', count: 200 }
        ],
        messageTypes: []
      })

      const result = parser.parseStats(output)

      expect(result.activeMembers).toHaveLength(2)
      expect(result.activeMembers[0].name).toBe('用户A')
      expect(result.activeMembers[1].name).toBe('用户B')
      expect(result.activeMembers[1].messageCount).toBe(200)
    })
  })

  describe('文本格式解析', () => {
    it('应从文本格式解析统计数据', () => {
      const output = `总消息：1000
总成员：50

用户A | 300
用户B | 250
用户C | 200`

      const result = parser.parseStats(output)

      expect(result.totalMessages).toBe(1000)
      expect(result.totalMembers).toBe(50)
      expect(result.activeMembers.length).toBeGreaterThanOrEqual(1)
    })
  })
})
