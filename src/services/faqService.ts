import type { FAQItem, FAQSession, Message } from '../types'
import { aiService } from './aiService'

const FAQ_STORAGE_KEY = 'chatsight_faqs'

export class FAQService {
  private static instance: FAQService

  private constructor() {}

  public static getInstance(): FAQService {
    if (!FAQService.instance) {
      FAQService.instance = new FAQService()
    }
    return FAQService.instance
  }

  private loadFAQs(): Record<string, FAQSession> {
    try {
      const data = localStorage.getItem(FAQ_STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('加载 FAQ 失败:', error)
      return {}
    }
  }

  private saveFAQs(faqs: Record<string, FAQSession>): void {
    try {
      localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(faqs))
    } catch (error) {
      console.error('保存 FAQ 失败:', error)
    }
  }

  public getSessionFAQs(sessionName: string): FAQSession | null {
    const faqs = this.loadFAQs()
    return faqs[sessionName] || null
  }

  public getAllFAQs(): Record<string, FAQSession> {
    return this.loadFAQs()
  }

  public async extractFAQsFromMessages(
    sessionName: string,
    messages: Message[]
  ): Promise<FAQItem[]> {
    if (!aiService.hasConfig()) {
      throw new Error('AI 配置未设置，请先在设置中配置 AI API')
    }

    const summary = await aiService.generateSummary(messages)
    
    const faqItems: FAQItem[] = summary.faqs.map((faq, index) => ({
      id: `${Date.now()}-${index}`,
      question: faq.question,
      answer: faq.answer,
      timestamp: new Date().toISOString(),
      sourceMessages: this.findRelevantMessages(messages, faq.question)
    }))

    const faqs = this.loadFAQs()
    faqs[sessionName] = {
      sessionName,
      faqs: faqItems,
      lastUpdated: new Date().toISOString()
    }
    this.saveFAQs(faqs)

    return faqItems
  }

  public addFAQ(sessionName: string, faq: FAQItem): void {
    const faqs = this.loadFAQs()
    if (!faqs[sessionName]) {
      faqs[sessionName] = {
        sessionName,
        faqs: [],
        lastUpdated: new Date().toISOString()
      }
    }
    faqs[sessionName].faqs.push(faq)
    faqs[sessionName].lastUpdated = new Date().toISOString()
    this.saveFAQs(faqs)
  }

  public updateFAQ(sessionName: string, faqId: string, updates: Partial<FAQItem>): void {
    const faqs = this.loadFAQs()
    if (!faqs[sessionName]) return

    const index = faqs[sessionName].faqs.findIndex(f => f.id === faqId)
    if (index !== -1) {
      faqs[sessionName].faqs[index] = {
        ...faqs[sessionName].faqs[index],
        ...updates
      }
      faqs[sessionName].lastUpdated = new Date().toISOString()
      this.saveFAQs(faqs)
    }
  }

  public deleteFAQ(sessionName: string, faqId: string): void {
    const faqs = this.loadFAQs()
    if (!faqs[sessionName]) return

    faqs[sessionName].faqs = faqs[sessionName].faqs.filter(f => f.id !== faqId)
    faqs[sessionName].lastUpdated = new Date().toISOString()
    this.saveFAQs(faqs)
  }

  public clearSessionFAQs(sessionName: string): void {
    const faqs = this.loadFAQs()
    delete faqs[sessionName]
    this.saveFAQs(faqs)
  }

  public exportToJSON(sessionName: string): string {
    const sessionFAQ = this.getSessionFAQs(sessionName)
    if (!sessionFAQ) {
      throw new Error('该会话没有 FAQ 数据')
    }
    return JSON.stringify(sessionFAQ, null, 2)
  }

  public exportToMarkdown(sessionName: string): string {
    const sessionFAQ = this.getSessionFAQs(sessionName)
    if (!sessionFAQ) {
      throw new Error('该会话没有 FAQ 数据')
    }

    let markdown = `# ${sessionName} 常见问题\n\n`
    markdown += `> 更新时间: ${new Date(sessionFAQ.lastUpdated).toLocaleString('zh-CN')}\n\n`

    sessionFAQ.faqs.forEach((faq, index) => {
      markdown += `## ${index + 1}. ${faq.question}\n\n`
      if (faq.answer) {
        markdown += `${faq.answer}\n\n`
      }
      markdown += `---\n\n`
    })

    return markdown
  }

  private findRelevantMessages(messages: Message[], question: string): string[] {
    const keywords = question.split(/\s+/).filter(k => k.length > 1)
    return messages
      .filter(msg => {
        return keywords.some(keyword => 
          msg.content.toLowerCase().includes(keyword.toLowerCase())
        )
      })
      .slice(0, 5)
      .map(msg => msg.id)
  }
}

export const faqService = FAQService.getInstance()
