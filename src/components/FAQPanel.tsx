import { useState, useEffect } from 'react'
import { MessageSquare, Download, Trash2, Plus, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import type { FAQItem, Message } from '../types'
import { faqService } from '../services/faqService'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface FAQPanelProps {
  sessionName: string
  messages: Message[]
}

export function FAQPanel({ sessionName, messages }: FAQPanelProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  useEffect(() => {
    const sessionFAQ = faqService.getSessionFAQs(sessionName)
    if (sessionFAQ) {
      setFaqs(sessionFAQ.faqs)
    }
  }, [sessionName])

  const handleExtractFAQs = async () => {
    if (messages.length === 0) {
      toast.info('当前会话没有消息，无法提取 FAQ')
      return
    }

    setIsExtracting(true)
    try {
      const extractedFAQs = await faqService.extractFAQsFromMessages(sessionName, messages)
      setFaqs(extractedFAQs)
      toast.success(`成功提取 ${extractedFAQs.length} 个 FAQ`)
    } catch (error) {
      console.error('提取 FAQ 失败:', error)
      toast.error(error instanceof Error ? error.message : '提取 FAQ 失败，请检查 AI 配置')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleAddFAQ = () => {
    if (!newQuestion.trim()) return

    const newFAQ: FAQItem = {
      id: `${Date.now()}-new`,
      question: newQuestion.trim(),
      answer: newAnswer.trim() || undefined,
      timestamp: new Date().toISOString(),
      sourceMessages: []
    }

    faqService.addFAQ(sessionName, newFAQ)
    setFaqs([...faqs, newFAQ])
    setNewQuestion('')
    setNewAnswer('')
    setShowAddDialog(false)
  }

  const handleEditFAQ = () => {
    if (!editingFAQ || !newQuestion.trim()) return

    faqService.updateFAQ(sessionName, editingFAQ.id, {
      question: newQuestion.trim(),
      answer: newAnswer.trim() || undefined
    })

    setFaqs(faqs.map(f => 
      f.id === editingFAQ.id 
        ? { ...f, question: newQuestion.trim(), answer: newAnswer.trim() || undefined }
        : f
    ))
    setEditingFAQ(null)
    setNewQuestion('')
    setNewAnswer('')
    setShowEditDialog(false)
  }

  const handleDeleteFAQ = (faqId: string) => {
    if (confirm('确定要删除这个 FAQ 吗？')) {
      faqService.deleteFAQ(sessionName, faqId)
      setFaqs(faqs.filter(f => f.id !== faqId))
    }
  }

  const handleExportJSON = () => {
    try {
      const content = faqService.exportToJSON(sessionName)
      const filename = `${sessionName}_faqs.json`
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success('导出 JSON 成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '导出失败')
    }
  }

  const handleExportMarkdown = () => {
    try {
      const content = faqService.exportToMarkdown(sessionName)
      const filename = `${sessionName}_faqs.md`
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success('导出 Markdown 成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '导出失败')
    }
  }

  const openEditDialog = (faq: FAQItem) => {
    setEditingFAQ(faq)
    setNewQuestion(faq.question)
    setNewAnswer(faq.answer || '')
    setShowEditDialog(true)
  }

  const openAddDialog = () => {
    setNewQuestion('')
    setNewAnswer('')
    setShowAddDialog(true)
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5" />
                常见问题
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                从聊天记录中自动提取常见问题
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {faqs.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportJSON}>
                  <Download className="w-4 h-4 mr-2" />
                  导出 JSON
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportMarkdown}>
                  <Download className="w-4 h-4 mr-2" />
                  导出 MD
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              添加
            </Button>
            <Button 
              size="sm" 
              onClick={handleExtractFAQs}
              disabled={isExtracting || messages.length === 0}
            >
              {isExtracting ? '提取中...' : '提取 FAQ'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {faqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p className="mb-2">还没有常见问题</p>
              <p className="text-xs text-muted-foreground mb-4">点击"提取 FAQ"从聊天记录中自动提取，或手动添加</p>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      >
                        <h3 className="text-base font-medium">{faq.question}</h3>
                        {expandedFAQ === faq.id && faq.answer && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {faq.answer}
                          </p>
                        )}
                        {expandedFAQ === faq.id && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(faq.timestamp).toLocaleString('zh-CN')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditDialog(faq); }}
                          className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteFAQ(faq.id); }}
                          className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialogs */}
      {(showAddDialog || showEditDialog) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{showAddDialog ? '添加 FAQ' : '编辑 FAQ'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                添加或编辑常见问题和答案
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>问题</Label>
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="输入问题..."
                />
              </div>
              <div className="space-y-2">
                <Label>答案</Label>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="输入答案（可选）..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </CardContent>
            <div className="px-6 pb-6 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowAddDialog(false); setShowEditDialog(false); setEditingFAQ(null); }}>
                取消
              </Button>
              <Button onClick={showAddDialog ? handleAddFAQ : handleEditFAQ}>
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
