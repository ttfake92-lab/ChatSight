import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, X, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useConfigStore } from '../stores/configStore'

export function KeywordConfig() {
  const { monitoringConfig, addKeyword, removeKeyword, updateKeyword, loadMonitoringConfig } = useConfigStore()
  const [newKeyword, setNewKeyword] = useState('')
  const [isRegex, setIsRegex] = useState(false)
  const [errors, setErrors] = useState<{ keyword?: string }>({})

  useEffect(() => {
    loadMonitoringConfig()
  }, [loadMonitoringConfig])

  const validateKeyword = (keyword: string): boolean => {
    if (!keyword || keyword.trim() === '') {
      setErrors({ keyword: '关键词不能为空' })
      return false
    }
    if (isRegex) {
      try {
        new RegExp(keyword)
      } catch {
        setErrors({ keyword: '正则表达式格式无效' })
        return false
      }
    }
    setErrors({})
    return true
  }

  const handleAddKeyword = () => {
    if (!validateKeyword(newKeyword)) {
      return
    }
    addKeyword({
      keyword: newKeyword.trim(),
      isRegex,
      enabled: true,
    })
    setNewKeyword('')
    setIsRegex(false)
    toast.success('关键词已添加')
  }

  const handleRemoveKeyword = (id: string) => {
    removeKeyword(id)
    toast.success('关键词已删除')
  }

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    updateKeyword(id, { enabled })
  }

  const handleToggleRegex = (id: string, isRegex: boolean) => {
    updateKeyword(id, { isRegex })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">关键词监控</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={isRegex ? '输入正则表达式...' : '输入关键词...'}
                value={newKeyword}
                onChange={(e) => {
                  setNewKeyword(e.target.value)
                  if (errors.keyword) setErrors({})
                }}
                className={errors.keyword ? 'border-destructive' : ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddKeyword()
                  }
                }}
              />
              {errors.keyword && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.keyword}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setIsRegex(!isRegex)}
              className={isRegex ? 'bg-primary/10' : ''}
              title={isRegex ? '正则表达式模式' : '普通关键词模式'}
            >
              .*
            </Button>
            <Button onClick={handleAddKeyword} disabled={!newKeyword.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {isRegex
              ? '使用正则表达式进行匹配，例如：竞品[一二三]号'
              : '设置关键词，消息包含时将触发通知'}
          </p>
        </div>

        {monitoringConfig.keywords.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">暂无关键词配置</p>
            <p className="text-xs mt-1">添加关键词开始监控消息</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>已配置的关键词</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {monitoringConfig.keywords.map((kw) => (
                <div
                  key={kw.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    kw.enabled ? 'bg-card' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleEnabled(kw.id, !kw.enabled)}
                      className="flex-shrink-0"
                      title={kw.enabled ? '点击禁用' : '点击启用'}
                    >
                      {kw.enabled ? (
                        <ToggleRight className="h-5 w-5 text-primary" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${!kw.enabled ? 'line-through' : ''}`}>
                        {kw.keyword}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {kw.isRegex ? '正则表达式' : '普通关键词'}
                      </p>
                    </div>
                    {kw.isRegex && (
                      <button
                        onClick={() => handleToggleRegex(kw.id, false)}
                        className="flex-shrink-0 text-xs px-2 py-1 rounded border hover:bg-muted"
                        title="点击切换为普通关键词"
                      >
                        .*
                      </button>
                    )}
                    {!kw.isRegex && (
                      <button
                        onClick={() => handleToggleRegex(kw.id, true)}
                        className="flex-shrink-0 text-xs px-2 py-1 rounded border border-dashed hover:bg-muted"
                        title="点击切换为正则表达式"
                      >
                        .*
                      </button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveKeyword(kw.id)}
                    className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
