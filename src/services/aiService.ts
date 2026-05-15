import type { AIConfig, AISummary, AIError, Message } from '../types'
import { buildSummaryPrompt } from '../lib/prompts'

class AIService {
  private static instance: AIService
  private config: AIConfig | null = null
  private abortController: AbortController | null = null

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  public abortCurrent(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  public setConfig(config: AIConfig): void {
    this.config = config
  }

  public getConfig(): AIConfig | null {
    return this.config
  }

  public hasConfig(): boolean {
    return this.config !== null && !!this.config.apiKey
  }

  public async generateSummary(messages: Message[], signal?: AbortSignal): Promise<AISummary> {
    if (!this.config) {
      throw {
        code: 'INVALID_KEY' as const,
        message: 'AI 配置未设置'
      }
    }

    // 取消之前的请求
    this.abortCurrent()
    this.abortController = new AbortController()

    // 如果外部传入了 signal，合并到内部 controller
    if (signal) {
      signal.addEventListener('abort', () => {
        this.abortController?.abort()
      })
      if (signal.aborted) {
        this.abortController.abort()
      }
    }

    const prompt = buildSummaryPrompt(messages)

    let response: string
    try {
      if (this.config.provider === 'openai') {
        response = await this.callOpenAI(prompt)
      } else if (this.config.provider === 'claude') {
        response = await this.callClaude(prompt)
      } else if (this.config.provider === 'minimax') {
        response = await this.callMiniMax(prompt)
      } else {
        throw {
          code: 'INVALID_KEY' as const,
          message: `不支持的 AI 提供商: ${this.config.provider}`
        }
      }
    } finally {
      this.abortController = null
    }

    return this.parseSummaryResponse(response)
  }

  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.config) {
      throw {
        code: 'INVALID_KEY' as const,
        message: 'AI 配置未设置'
      }
    }

    const model = this.config.model || 'gpt-4'
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1'

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
        signal: this.abortController?.signal ?? undefined
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401 || response.status === 403) {
          throw {
            code: 'INVALID_KEY' as const,
            message: 'API Key 无效或已过期'
          }
        } else if (response.status === 429) {
          throw {
            code: 'RATE_LIMIT' as const,
            message: '请求过于频繁，请稍后重试'
          }
        } else {
          throw {
            code: 'NETWORK_ERROR' as const,
            message: errorData.error?.message || `请求失败: ${response.status}`
          }
        }
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      if (this.isAIError(error)) {
        throw error
      }
      throw {
        code: 'NETWORK_ERROR' as const,
        message: error instanceof Error ? error.message : '网络请求失败'
      }
    }
  }

  private async callClaude(prompt: string): Promise<string> {
    if (!this.config) {
      throw {
        code: 'INVALID_KEY' as const,
        message: 'AI 配置未设置'
      }
    }

    const model = this.config.model || 'claude-3-sonnet-20240229'
    const baseUrl = this.config.baseUrl || 'https://api.anthropic.com/v1'

    try {
      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
        signal: this.abortController?.signal ?? undefined
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401 || response.status === 403) {
          throw {
            code: 'INVALID_KEY' as const,
            message: 'API Key 无效或已过期'
          }
        } else if (response.status === 429) {
          throw {
            code: 'RATE_LIMIT' as const,
            message: '请求过于频繁，请稍后重试'
          }
        } else {
          throw {
            code: 'NETWORK_ERROR' as const,
            message: errorData.error?.message || `请求失败: ${response.status}`
          }
        }
      }

      const data = await response.json()
      return data.content[0]?.text || ''
    } catch (error) {
      if (this.isAIError(error)) {
        throw error
      }
      throw {
        code: 'NETWORK_ERROR' as const,
        message: error instanceof Error ? error.message : '网络请求失败'
      }
    }
  }

  private async callMiniMax(prompt: string): Promise<string> {
    if (!this.config) {
      throw {
        code: 'INVALID_KEY' as const,
        message: 'AI 配置未设置'
      }
    }

    const model = this.config.model || 'MiniMax-M2.7-highspeed'
    const baseUrl = this.config.baseUrl || 'https://api.minimaxi.com/v1'

    try {
      const response = await fetch(`${baseUrl}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
        signal: this.abortController?.signal ?? undefined
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401 || response.status === 403) {
          throw {
            code: 'INVALID_KEY' as const,
            message: 'API Key 无效或已过期'
          }
        } else if (response.status === 429) {
          throw {
            code: 'RATE_LIMIT' as const,
            message: '请求过于频繁，请稍后重试'
          }
        } else {
          throw {
            code: 'NETWORK_ERROR' as const,
            message: errorData.error?.message || `请求失败: ${response.status}`
          }
        }
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || ''
    } catch (error) {
      if (this.isAIError(error)) {
        throw error
      }
      throw {
        code: 'NETWORK_ERROR' as const,
        message: error instanceof Error ? error.message : '网络请求失败'
      }
    }
  }

  public parseSummaryResponse(response: string): AISummary {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('无法从响应中提取 JSON')
      }

      const parsed = JSON.parse(jsonMatch[0])

      const summary: AISummary = {
        overview: {
          totalMessages: parsed.overview?.totalMessages || 0,
          activeUsers: parsed.overview?.activeUsers || 0,
          peakHours: parsed.overview?.peakHours || [],
          trend: parsed.overview?.trend || '平稳'
        },
        topics: Array.isArray(parsed.topics) ? parsed.topics : [],
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        insights: Array.isArray(parsed.insights) ? parsed.insights : []
      }

      return summary
    } catch (error) {
      console.error('解析 AI 响应失败:', error)
      throw {
        code: 'NETWORK_ERROR' as const,
        message: '解析 AI 响应失败，请重试'
      }
    }
  }

  private isAIError(error: unknown): error is AIError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as AIError).code === 'string'
    )
  }
}

export const aiService = AIService.getInstance()
