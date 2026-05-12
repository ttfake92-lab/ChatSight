import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Bot, Key, Cpu, CheckCircle2, Moon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useConfigStore } from '../stores/configStore'
import type { AIProvider } from '../types'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { aiConfig, updateAIConfig, saveConfig, monitoringConfig, updateSilentHours, loadMonitoringConfig } = useConfigStore()
  const [provider, setProvider] = useState<AIProvider>(aiConfig.provider)
  const [apiKey, setApiKey] = useState(aiConfig.apiKey)
  const [model, setModel] = useState(aiConfig.model)
  const [baseUrl, setBaseUrl] = useState(aiConfig.baseUrl || '')
  const [errors, setErrors] = useState<{ apiKey?: string }>({})

  useEffect(() => {
    if (open) {
      setProvider(aiConfig.provider)
      setApiKey(aiConfig.apiKey)
      setModel(aiConfig.model)
      setBaseUrl(aiConfig.baseUrl || '')
      setErrors({})
      loadMonitoringConfig()
    }
  }, [open, aiConfig, loadMonitoringConfig])

  const validateForm = (): boolean => {
    const newErrors: { apiKey?: string } = {}

    if (!apiKey || apiKey.trim() === '') {
      newErrors.apiKey = 'API Key 不能为空'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      toast.error('请检查表单输入')
      return
    }

    updateAIConfig({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim() || getDefaultModel(provider),
      baseUrl: baseUrl.trim() || (provider === 'minimax' ? 'https://api.minimaxi.com/v1' : undefined)
    })
    saveConfig()
    toast.success('设置已保存')
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const getDefaultModel = (provider: AIProvider): string => {
    switch (provider) {
      case 'openai':
        return 'gpt-4'
      case 'claude':
        return 'claude-3-sonnet-20240229'
      case 'minimax':
        return 'MiniMax-M2.7-highspeed'
      default:
        return 'gpt-4'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleCancel}>
        <DialogHeader>
          <DialogTitle>AI 设置</DialogTitle>
          <DialogDescription>
            配置 AI 服务提供商以启用智能摘要功能
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">AI 提供商</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProvider('openai')
                  if (!model) setModel('gpt-4')
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  provider === 'openai'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Bot className="h-5 w-5" />
                <span className="text-sm font-medium">OpenAI</span>
                {provider === 'openai' && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setProvider('claude')
                  if (!model) setModel('claude-3-sonnet-20240229')
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  provider === 'claude'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Bot className="h-5 w-5" />
                <span className="text-sm font-medium">Claude</span>
                {provider === 'claude' && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setProvider('minimax')
                  if (!model) setModel('MiniMax-M2.7-highspeed')
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  provider === 'minimax'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Bot className="h-5 w-5" />
                <span className="text-sm font-medium">MiniMax</span>
                {provider === 'minimax' && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="apiKey"
                type="password"
                placeholder="输入你的 API Key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  if (errors.apiKey) {
                    setErrors({})
                  }
                }}
                className={`pl-10 ${errors.apiKey ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.apiKey && (
              <p className="text-xs text-destructive mt-1">{errors.apiKey}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">模型名称</Label>
            <div className="relative">
              <Cpu className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="model"
                type="text"
                placeholder={`例如: ${getDefaultModel(provider)}`}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {provider === 'openai'
                ? '推荐使用 gpt-4 以获得更好的分析效果'
                : provider === 'claude'
                ? '推荐使用 claude-3-sonnet-20240229'
                : '推荐使用 MiniMax-M2.7-highspeed'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">API Base URL (可选)</Label>
            <Input
              id="baseUrl"
              type="text"
              placeholder={
                provider === 'openai'
                  ? 'https://api.openai.com/v1'
                  : provider === 'claude'
                  ? 'https://api.anthropic.com/v1'
                  : 'https://api.minimaxi.com/v1'
              }
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              如需使用代理或自定义 API 端点，请在此填写
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-4 w-4" />
              <Label className="text-base font-medium">静默时段</Label>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              在静默时段内，关键词匹配不会触发桌面通知
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="silentEnabled"
                  checked={monitoringConfig.silentHours.enabled}
                  onChange={(e) => updateSilentHours({ enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="silentEnabled" className="text-sm font-normal cursor-pointer">
                  启用静默时段
                </Label>
              </div>

              {monitoringConfig.silentHours.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="silentStart">开始时间</Label>
                      <Input
                        id="silentStart"
                        type="time"
                        value={monitoringConfig.silentHours.start}
                        onChange={(e) => updateSilentHours({ start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="silentEnd">结束时间</Label>
                      <Input
                        id="silentEnd"
                        type="time"
                        value={monitoringConfig.silentHours.end}
                        onChange={(e) => updateSilentHours({ end: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="weekendsOnly"
                      checked={monitoringConfig.silentHours.weekendsOnly}
                      onChange={(e) => updateSilentHours({ weekendsOnly: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="weekendsOnly" className="text-sm font-normal cursor-pointer">
                      仅周末生效
                    </Label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSave}>保存设置</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
