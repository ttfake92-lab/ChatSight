import type { KeywordConfig, Message } from '../types'

export const matchSingleKeyword = (content: string, keyword: KeywordConfig): boolean => {
  if (!keyword.enabled) return false

  try {
    if (keyword.isRegex) {
      const regex = new RegExp(keyword.keyword, 'i')
      return regex.test(content)
    } else {
      return content.toLowerCase().includes(keyword.keyword.toLowerCase())
    }
  } catch (err) {
    console.error('关键词匹配错误:', err)
    return false
  }
}

export const matchKeywords = (message: Message, keywords: KeywordConfig[]): KeywordConfig[] => {
  return keywords.filter(keyword => matchSingleKeyword(message.content, keyword))
}

export const hasMatchingKeyword = (message: Message, keywords: KeywordConfig[]): boolean => {
  return keywords.some(keyword => matchSingleKeyword(message.content, keyword))
}
