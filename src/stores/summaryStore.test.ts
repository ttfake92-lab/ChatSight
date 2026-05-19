import { useSummaryStore } from './summaryStore'
import type { AISummary } from '../types'

const mockStorage: Record<string, string> = {}

Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn((key: string) => mockStorage[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { mockStorage[key] = value }),
    removeItem: jest.fn((key: string) => { delete mockStorage[key] }),
    clear: jest.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }),
    key: jest.fn((index: number) => Object.keys(mockStorage)[index] ?? null),
    get length() { return Object.keys(mockStorage).length },
  },
  writable: true,
})

const createMockSummary = (id: string): AISummary => ({
  overview: {
    totalMessages: 100,
    activeUsers: 10,
    peakHours: ['10:00', '14:00'],
    trend: '上升' as const,
  },
  topics: [
    { topic: `Topic ${id}`, count: 5, heat: 'high' as const },
  ],
  keyPoints: [],
  faqs: [],
  actionItems: [],
  insights: [],
})

describe('summaryStore', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k])
    jest.clearAllMocks()
    useSummaryStore.setState({ summaries: new Map() })
  })

  it('按会话保存和读取摘要', () => {
    const store = useSummaryStore.getState()
    const sessionId = 'session-123'
    const sessionName = '测试群'
    const summary = createMockSummary(sessionId)

    store.saveSummary(sessionId, sessionName, summary)

    const stored = store.getSummary(sessionId)
    expect(stored).toBeDefined()
    expect(stored?.summary).toEqual(summary)
    expect(stored?.sessionId).toBe(sessionId)
    expect(stored?.sessionName).toBe(sessionName)
  })

  it('不同会话的摘要不串线', () => {
    const store = useSummaryStore.getState()
    
    const summaryA = createMockSummary('A')
    const summaryB = createMockSummary('B')

    store.saveSummary('session-A', '群聊A', summaryA)
    store.saveSummary('session-B', '群聊B', summaryB)

    const storedA = store.getSummary('session-A')
    const storedB = store.getSummary('session-B')

    expect(storedA?.summary).toEqual(summaryA)
    expect(storedB?.summary).toEqual(summaryB)
    expect(storedA?.summary).not.toEqual(storedB?.summary)
  })

  it('重启后从 localStorage 恢复摘要', () => {
    const store = useSummaryStore.getState()
    const sessionId = 'session-recover'
    const sessionName = '恢复测试'
    const summary = createMockSummary(sessionId)

    store.saveSummary(sessionId, sessionName, summary)

    const newStore = useSummaryStore.getState()
    newStore.loadSummaries()

    const recovered = newStore.getSummary(sessionId)
    expect(recovered).toBeDefined()
    expect(recovered?.summary).toEqual(summary)
  })

  it('清除单个会话的摘要', () => {
    const store = useSummaryStore.getState()
    const sessionId = 'session-clear'

    store.saveSummary(sessionId, '测试', createMockSummary(sessionId))
    expect(store.getSummary(sessionId)).toBeDefined()

    store.clearSummary(sessionId)
    expect(store.getSummary(sessionId)).toBeUndefined()
  })

  it('清除所有摘要', () => {
    const store = useSummaryStore.getState()

    store.saveSummary('session-1', '群聊1', createMockSummary('1'))
    store.saveSummary('session-2', '群聊2', createMockSummary('2'))

    store.clearAll()

    expect(store.getSummary('session-1')).toBeUndefined()
    expect(store.getSummary('session-2')).toBeUndefined()
  })
})
