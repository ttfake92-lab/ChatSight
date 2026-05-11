import { spawn } from 'child_process'
import { Session, Message, Contact, SearchResult, Stats, WeChatError } from './types'
import { WeChatParser } from './parser'

export class WeChatExecutor {
  private parser: WeChatParser
  private commandPrefix: string
  private timeout: number
  private initialized: boolean

  constructor(commandPrefix: string = 'wechat-cli', timeout: number = 30000) {
    this.parser = new WeChatParser()
    this.commandPrefix = commandPrefix
    this.timeout = timeout
    this.initialized = false
  }

  async init(): Promise<boolean> {
    try {
      await this.executeCommand(['init'])
      this.initialized = true
      return true
    } catch (error) {
      throw this.createError('EXECUTION_FAILED', `初始化失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async getSessions(limit: number = 50): Promise<Session[]> {
    this.ensureInitialized()
    try {
      const output = await this.executeCommand(['sessions', '--limit', String(limit)])
      return this.parser.parseSessions(output)
    } catch (error) {
      throw this.handleError(error, '获取会话列表失败')
    }
  }

  async getHistory(sessionName: string, limit: number = 100): Promise<Message[]> {
    this.ensureInitialized()
    try {
      const output = await this.executeCommand(['history', sessionName, '--limit', String(limit)])
      const result = this.parser.parseHistory(output)
      return result
    } catch (error) {
      throw this.handleError(error, `获取聊天记录失败: ${sessionName}`)
    }
  }

  async search(keyword: string, sessionName?: string): Promise<SearchResult[]> {
    this.ensureInitialized()
    try {
      const args = ['search', keyword]
      if (sessionName) {
        args.push('--session', sessionName)
      }
      const output = await this.executeCommand(args)
      return this.parser.parseSearchResults(output)
    } catch (error) {
      throw this.handleError(error, `搜索失败: ${keyword}`)
    }
  }

  async getStats(sessionName?: string): Promise<Stats> {
    this.ensureInitialized()
    try {
      const args = sessionName ? ['stats', sessionName] : ['stats']
      const output = await this.executeCommand(args)
      return this.parser.parseStats(output)
    } catch (error) {
      throw this.handleError(error, '获取统计数据失败')
    }
  }

  async getContacts(query?: string): Promise<Contact[]> {
    this.ensureInitialized()
    try {
      const args = query ? ['contacts', '--query', query] : ['contacts']
      const output = await this.executeCommand(args)
      return this.parser.parseContacts(output)
    } catch (error) {
      throw this.handleError(error, '获取联系人失败')
    }
  }

  private async executeCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = this.commandPrefix.split(' ')[0]
      const commandArgs = this.commandPrefix.split(' ').slice(1).concat(args)
      
      const process = spawn(command, commandArgs, {
        shell: true,
        windowsHide: true
      })

      let stdout = ''
      let stderr = ''
      let timeoutId: NodeJS.Timeout

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId)
        process.removeAllListeners()
      }

      timeoutId = setTimeout(() => {
        cleanup()
        process.kill()
        reject(this.createError('TIMEOUT', `命令执行超时: ${this.commandPrefix} ${args.join(' ')}`))
      }, this.timeout)

      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      process.on('close', (code) => {
        cleanup()
        
        if (code === 0) {
          resolve(stdout.trim())
        } else {
          const errorMessage = stderr.trim() || stdout.trim() || `命令执行失败，退出码: ${code}`
          
          if (errorMessage.includes('not found') || errorMessage.includes('未找到')) {
            reject(this.createError('NOT_FOUND', `wechat-cli 未找到或未安装`))
          } else if (errorMessage.includes('not initialized')) {
            reject(this.createError('NOT_INITIALIZED', `wechat-cli 未初始化，请先调用 init()`))
          } else {
            reject(this.createError('EXECUTION_FAILED', errorMessage))
          }
        }
      })

      process.on('error', (error) => {
        cleanup()
        reject(this.createError('EXECUTION_FAILED', `命令执行错误: ${error.message}`))
      })
    })
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw this.createError('NOT_INITIALIZED', 'wechat-cli 未初始化，请先调用 init()')
    }
  }

  private createError(code: WeChatError['code'], message: string): WeChatError {
    return { code, message }
  }

  private handleError(error: unknown, context: string): WeChatError {
    if (this.isWeChatError(error)) {
      return error
    }
    return this.createError('EXECUTION_FAILED', `${context}: ${error instanceof Error ? error.message : '未知错误'}`)
  }

  private isWeChatError(error: unknown): error is WeChatError {
    return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
  }
}
