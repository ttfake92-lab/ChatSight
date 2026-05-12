import { matchKeywords, matchSingleKeyword } from './keywordMatcher'
import type { KeywordConfig, Message } from '../types'

describe('keywordMatcher', () => {
  describe('matchSingleKeyword', () => {
    it('should match plain text keyword (case insensitive)', () => {
      const keyword: KeywordConfig = {
        id: 'kw1',
        keyword: 'Hello',
        isRegex: false,
        enabled: true,
      }
      expect(matchSingleKeyword('Hello world', keyword)).toBe(true)
      expect(matchSingleKeyword('hello world', keyword)).toBe(true)
      expect(matchSingleKeyword('HELLO WORLD', keyword)).toBe(true)
      expect(matchSingleKeyword('Hi there', keyword)).toBe(false)
    })

    it('should match regex keyword', () => {
      const keyword: KeywordConfig = {
        id: 'kw2',
        keyword: '\\d{3}',
        isRegex: true,
        enabled: true,
      }
      expect(matchSingleKeyword('123', keyword)).toBe(true)
      expect(matchSingleKeyword('abc123def', keyword)).toBe(true)
      expect(matchSingleKeyword('12', keyword)).toBe(false)
    })

    it('should not match if keyword is disabled', () => {
      const keyword: KeywordConfig = {
        id: 'kw3',
        keyword: 'Test',
        isRegex: false,
        enabled: false,
      }
      expect(matchSingleKeyword('Test message', keyword)).toBe(false)
    })

    it('should handle invalid regex gracefully', () => {
      const keyword: KeywordConfig = {
        id: 'kw4',
        keyword: '[invalid regex',
        isRegex: true,
        enabled: true,
      }
      expect(() => matchSingleKeyword('message', keyword)).not.toThrow()
      expect(matchSingleKeyword('message', keyword)).toBe(false)
    })
  })

  describe('matchKeywords', () => {
    const testMessage: Message = {
      id: 'msg1',
      sender: 'User1',
      content: 'Hello world 123, this is a test',
      timestamp: '2026-05-12',
      isSelf: false,
    }

    it('should return all matching keywords', () => {
      const keywords: KeywordConfig[] = [
        { id: 'kw1', keyword: 'Hello', isRegex: false, enabled: true },
        { id: 'kw2', keyword: '\\d{3}', isRegex: true, enabled: true },
        { id: 'kw3', keyword: 'NotThere', isRegex: false, enabled: true },
        { id: 'kw4', keyword: 'test', isRegex: false, enabled: false },
      ]
      const matches = matchKeywords(testMessage, keywords)
      expect(matches).toHaveLength(2)
      expect(matches.map(m => m.id)).toEqual(['kw1', 'kw2'])
    })

    it('should return empty array when no keywords match', () => {
      const keywords: KeywordConfig[] = [
        { id: 'kw1', keyword: 'Not there', isRegex: false, enabled: true },
        { id: 'kw2', keyword: '\\d{4}', isRegex: true, enabled: true },
      ]
      const matches = matchKeywords(testMessage, keywords)
      expect(matches).toEqual([])
    })

    it('should return empty array when keywords is empty', () => {
      const matches = matchKeywords(testMessage, [])
      expect(matches).toEqual([])
    })

    it('should only consider enabled keywords', () => {
      const keywords: KeywordConfig[] = [
        { id: 'kw1', keyword: 'Hello', isRegex: false, enabled: false },
        { id: 'kw2', keyword: 'world', isRegex: false, enabled: true },
      ]
      const matches = matchKeywords(testMessage, keywords)
      expect(matches).toHaveLength(1)
      expect(matches[0].id).toBe('kw2')
    })
  })
})
