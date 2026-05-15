import { useState, useEffect } from 'react'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  Loader2,
  HelpCircle,
  CheckCircle,
  Target,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useMessageStore } from '../stores/messageStore'
import { useConfigStore } from '../stores/configStore'
import { aiService } from '../services/aiService'
import { cn } from '../lib/utils'
import type { AISummary, AIError } from '../types'

export function AISummary() {
  const { messages } = useMessageStore()
  const { aiConfig } = useConfigStore()
  const [summary, setSummary] = useState<AISummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      aiService.abortCurrent()
    }
  }, [])

  const handleGenerateSummary = async () => {
    // 取消之前的请求
    aiService.abortCurrent()
    // 检查是否有消息
    if (messages.length === 0) {
      setError('没有可分析的聊天记录')
      return
    }

    // 检查 AI 配置
    if (!aiConfig.apiKey || aiConfig.apiKey.trim() === '') {
      setError('请先配置 AI API Key：点击右上角设置按钮，填入你的 API Key')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      aiService.setConfig(aiConfig)
      const result = await aiService.generateSummary(messages)
      setSummary(result)
    } catch (err) {
      // 忽略用户主动取消的请求
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      const aiError = err as AIError
      const errorMessage = aiError.message || '生成摘要失败，请重试'

      // 提供更友好的错误提示
      if (errorMessage.includes('API Key 无效') || errorMessage.includes('INVALID_KEY')) {
        setError('API Key 无效或已过期，请在设置中更新')
      } else if (errorMessage.includes('RATE_LIMIT')) {
        setError('请求过于频繁，请稍后重试')
      } else if (errorMessage.includes('网络')) {
        setError('网络连接失败，请检查网络')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    handleGenerateSummary()
  }

  const getHeatColor = (heat: 'high' | 'medium' | 'low') => {
    switch (heat) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
    }
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
    }
  }

  const getInsightIcon = (type: 'opportunity' | 'risk' | 'trend') => {
    switch (type) {
      case 'opportunity':
        return <Zap className="h-4 w-4" />
      case 'risk':
        return <Shield className="h-4 w-4" />
      case 'trend':
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: 'opportunity' | 'risk' | 'trend') => {
    switch (type) {
      case 'opportunity':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'risk':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'trend':
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getKeyPointIcon = (type: 'suggestion' | 'consensus' | 'dispute') => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="h-4 w-4" />
      case 'consensus':
        return <CheckCircle className="h-4 w-4" />
      case 'dispute':
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getKeyPointColor = (type: 'suggestion' | 'consensus' | 'dispute') => {
    switch (type) {
      case 'suggestion':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'consensus':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'dispute':
        return 'text-orange-600 bg-orange-50 border-orange-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="relative mb-6">
          <Sparkles className="h-16 w-16 text-primary animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-lg font-medium mb-2">AI 正在分析中...</h3>
        <p className="text-sm text-muted-foreground">
          正在分析聊天记录，生成智能摘要
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-destructive mb-2">
          生成失败
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          重试
        </Button>
      </div>
    )
  }

  if (!summary) {
    const hasMessages = messages.length > 0
    const hasApiKey = aiConfig.apiKey && aiConfig.apiKey.trim() !== ''
    const isDisabled = !hasMessages || !hasApiKey

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Sparkles className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">AI 智能摘要</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          选择一个会话，AI 将为你分析聊天内容，生成结构化的摘要和洞察
        </p>
        <Button
          onClick={handleGenerateSummary}
          disabled={isDisabled}
          className={!hasApiKey ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {hasApiKey ? '生成摘要' : '请先配置 API Key'}
        </Button>
        {!hasMessages && hasApiKey && (
          <p className="text-xs text-muted-foreground mt-2">
            请先选择一个会话
          </p>
        )}
        {!hasApiKey && (
          <p className="text-xs text-yellow-600 mt-2">
            点击右上角 ⚙️ 设置，配置 AI API Key
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI 摘要分析</h2>
            <p className="text-xs text-muted-foreground">基于聊天记录生成</p>
          </div>
          <Button onClick={handleGenerateSummary} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新生成
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              今日概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{summary.overview.totalMessages}</p>
                <p className="text-xs text-muted-foreground">总消息数</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{summary.overview.activeUsers}</p>
                <p className="text-xs text-muted-foreground">活跃用户</p>
              </div>
            </div>
            {summary.overview.peakHours.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">活跃时段</p>
                <div className="flex flex-wrap gap-2">
                  {summary.overview.peakHours.map((hour, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-xs"
                    >
                      {hour}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">趋势</p>
              <div className="flex items-center gap-2">
                {summary.overview.trend === '上升' && (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                )}
                {summary.overview.trend === '下降' && (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                {(summary.overview.trend === '平稳' || summary.overview.trend === '持平') && (
                  <Minus className="h-5 w-5 text-gray-600" />
                )}
                <span className="text-sm">{summary.overview.trend}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {summary.topics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                核心话题
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.topics.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full mt-1.5 flex-shrink-0',
                        getHeatColor(item.heat)
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.count} 条相关消息 · 热度:{' '}
                        {item.heat === 'high'
                          ? '高'
                          : item.heat === 'medium'
                          ? '中'
                          : '低'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {summary.keyPoints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                重要观点
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.keyPoints.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex gap-3 p-3 rounded-lg border',
                      getKeyPointColor(item.type)
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getKeyPointIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">
                        {item.type === 'suggestion'
                          ? '建议'
                          : item.type === 'consensus'
                          ? '共识'
                          : '争议'}
                        {item.author && ` - ${item.author}`}
                      </p>
                      <p className="text-sm">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {summary.faqs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                常见问题
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.faqs.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium flex items-start gap-2">
                      <span className="text-primary">Q:</span>
                      {faq.question}
                    </p>
                    {faq.answer && (
                      <p className="text-sm text-muted-foreground flex items-start gap-2 pl-4">
                        <span className="text-green-600">A:</span>
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {summary.actionItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                待跟进事项
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.actionItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm">{item.content}</p>
                      {item.assignTo && (
                        <p className="text-xs text-muted-foreground mt-1">
                          负责人: {item.assignTo}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium flex-shrink-0',
                        getPriorityColor(item.priority)
                      )}
                    >
                      {item.priority === 'high'
                        ? '高'
                        : item.priority === 'medium'
                        ? '中'
                        : '低'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {summary.insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                趋势洞察
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.insights.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex gap-3 p-3 rounded-lg border',
                      getInsightColor(item.type)
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getInsightIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium mb-1 capitalize">
                        {item.type === 'opportunity'
                          ? '机会'
                          : item.type === 'risk'
                          ? '风险'
                          : '趋势'}
                      </p>
                      <p className="text-sm">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
