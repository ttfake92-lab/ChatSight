import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, ToggleLeft, ToggleRight, Trash2, Settings, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { useSkillStore } from '../stores/skillStore'
import type { Skill, SkillTrigger, SkillAction } from '../types'

export function SkillManager() {
  const { skills, loadSkills, addSkill, updateSkill, deleteSkill } = useSkillStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillDesc, setNewSkillDesc] = useState('')
  const [activeTab, setActiveTab] = useState<'general' | 'triggers' | 'actions'>('general')

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  const handleCreateSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('请输入 Skill 名称')
      return
    }
    addSkill({
      name: newSkillName.trim(),
      description: newSkillDesc.trim(),
      enabled: true,
      triggers: [],
      actions: []
    })
    setNewSkillName('')
    setNewSkillDesc('')
    setIsCreateDialogOpen(false)
    toast.success('Skill 已创建')
  }

  const handleToggleSkill = (id: string, enabled: boolean) => {
    updateSkill(id, { enabled })
    toast.success(enabled ? 'Skill 已启用' : 'Skill 已禁用')
  }

  const handleDeleteSkill = (id: string) => {
    deleteSkill(id)
    toast.success('Skill 已删除')
  }

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill({ ...skill })
    setIsEditDialogOpen(true)
    setActiveTab('general')
  }

  const handleSaveEdit = () => {
    if (!editingSkill || !editingSkill.name.trim()) {
      toast.error('请输入 Skill 名称')
      return
    }
    updateSkill(editingSkill.id, {
      name: editingSkill.name,
      description: editingSkill.description,
      triggers: editingSkill.triggers,
      actions: editingSkill.actions
    })
    setIsEditDialogOpen(false)
    setEditingSkill(null)
    toast.success('Skill 已保存')
  }

  const addTrigger = () => {
    if (!editingSkill) return
    setEditingSkill({
      ...editingSkill,
      triggers: [...editingSkill.triggers, { type: 'keywords', keywords: [] }]
    })
  }

  const removeTrigger = (index: number) => {
    if (!editingSkill) return
    setEditingSkill({
      ...editingSkill,
      triggers: editingSkill.triggers.filter((_, i) => i !== index)
    })
  }

  const updateTrigger = (index: number, trigger: SkillTrigger) => {
    if (!editingSkill) return
    const newTriggers = [...editingSkill.triggers]
    newTriggers[index] = trigger
    setEditingSkill({ ...editingSkill, triggers: newTriggers })
  }

  const addAction = () => {
    if (!editingSkill) return
    setEditingSkill({
      ...editingSkill,
      actions: [...editingSkill.actions, { type: 'notify', title: '新消息提醒' }]
    })
  }

  const removeAction = (index: number) => {
    if (!editingSkill) return
    setEditingSkill({
      ...editingSkill,
      actions: editingSkill.actions.filter((_, i) => i !== index)
    })
  }

  const updateAction = (index: number, action: SkillAction) => {
    if (!editingSkill) return
    const newActions = [...editingSkill.actions]
    newActions[index] = action
    setEditingSkill({ ...editingSkill, actions: newActions })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Skill 管理</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新建 Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无自定义 Skills</p>
          <p className="text-sm mt-1">创建 Skill 实现自动化监控和响应</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {skills.map((skill) => (
            <Card key={skill.id} className={!skill.enabled ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{skill.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSkill(skill)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <button onClick={() => handleToggleSkill(skill.id, !skill.enabled)}>
                      {skill.enabled ? (
                        <ToggleRight className="h-5 w-5 text-primary" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSkill(skill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-xs">
                  {skill.triggers.length > 0 ? (
                    skill.triggers.map((trigger, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {trigger.type === 'keywords' && `关键词: ${trigger.keywords?.join(', ')}`}
                        {trigger.type === 'regex' && `正则: ${trigger.pattern}`}
                        {trigger.type === 'member' && `成员: ${trigger.member}`}
                        {trigger.type === 'time' && `时间: ${trigger.time}`}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">未配置触发器</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs mt-2">
                  {skill.actions.length > 0 ? (
                    skill.actions.map((action, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-800">
                        {action.type === 'notify' && `通知: ${action.title}`}
                        {action.type === 'log' && `日志`}
                        {action.type === 'ai_summary' && `AI摘要: ${action.template}`}
                        {action.type === 'export' && `导出: ${action.format}`}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">未配置动作</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建 Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>名称</Label>
              <Input
                placeholder="Skill 名称"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                placeholder="Skill 描述"
                value={newSkillDesc}
                onChange={(e) => setNewSkillDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSkill}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑 Skill</DialogTitle>
          </DialogHeader>
          {editingSkill && (
            <>
              <div className="flex gap-2 mb-4 border-b">
                <button
                  className={`px-4 py-2 ${activeTab === 'general' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('general')}
                >
                  基本信息
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'triggers' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('triggers')}
                >
                  触发器
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'actions' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('actions')}
                >
                  动作
                </button>
              </div>

              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>名称</Label>
                    <Input
                      value={editingSkill.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>描述</Label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                      value={editingSkill.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'triggers' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>触发器配置</Label>
                    <Button variant="default" size="sm" onClick={addTrigger}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加触发器
                    </Button>
                  </div>
                  {editingSkill.triggers.length === 0 ? (
                    <p className="text-muted-foreground text-sm">暂无触发器，点击上方按钮添加</p>
                  ) : (
                    editingSkill.triggers.map((trigger, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-4">
                                <Label>类型</Label>
                                <select
                                  className="px-3 py-2 border rounded-md"
                                  value={trigger.type}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const val = e.target.value as any
                                    const newTrigger: SkillTrigger = {
                                      type: val,
                                      keywords: val === 'keywords' ? [] : undefined,
                                      pattern: val === 'regex' ? '' : undefined,
                                      member: val === 'member' ? '' : undefined,
                                      time: val === 'time' ? '' : undefined
                                    }
                                    updateTrigger(idx, newTrigger)
                                  }}
                                >
                                  <option value="keywords">关键词</option>
                                  <option value="regex">正则表达式</option>
                                  <option value="member">成员</option>
                                  <option value="time">时间</option>
                                </select>
                              </div>
                              {trigger.type === 'keywords' && (
                                <div className="space-y-2">
                                  <Label>关键词 (逗号分隔)</Label>
                                  <Input
                                    placeholder="竞品, 替代, 对比"
                                    value={trigger.keywords?.join(', ') || ''}
                                    onChange={(e) => {
                                      const keywords = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                      updateTrigger(idx, { ...trigger, keywords })
                                    }}
                                  />
                                </div>
                              )}
                              {trigger.type === 'regex' && (
                                <div className="space-y-2">
                                  <Label>正则表达式</Label>
                                  <Input
                                    placeholder="\\b[A-Z]{3}\\b"
                                    value={trigger.pattern || ''}
                                    onChange={(e) => updateTrigger(idx, { ...trigger, pattern: e.target.value })}
                                  />
                                </div>
                              )}
                              {trigger.type === 'member' && (
                                <div className="space-y-2">
                                  <Label>成员名称</Label>
                                  <Input
                                    placeholder="张三"
                                    value={trigger.member || ''}
                                    onChange={(e) => updateTrigger(idx, { ...trigger, member: e.target.value })}
                                  />
                                </div>
                              )}
                              {trigger.type === 'time' && (
                                <div className="space-y-2">
                                  <Label>时间 (HH:MM)</Label>
                                  <Input
                                    placeholder="09:00"
                                    value={trigger.time || ''}
                                    onChange={(e) => updateTrigger(idx, { ...trigger, time: e.target.value })}
                                  />
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive ml-4"
                              onClick={() => removeTrigger(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>动作配置</Label>
                    <Button variant="default" size="sm" onClick={addAction}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加动作
                    </Button>
                  </div>
                  {editingSkill.actions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">暂无动作，点击上方按钮添加</p>
                  ) : (
                    editingSkill.actions.map((action, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-4">
                                <Label>类型</Label>
                                <select
                                  className="px-3 py-2 border rounded-md"
                                  value={action.type}
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const val = e.target.value as any
                                    const newAction: SkillAction = {
                                      type: val,
                                      title: val === 'notify' ? '通知' : undefined,
                                      template: val === 'ai_summary' ? 'default' : undefined,
                                      format: val === 'export' ? 'json' : undefined,
                                      message: val === 'log' ? undefined : undefined
                                    }
                                    updateAction(idx, newAction)
                                  }}
                                >
                                  <option value="notify">通知</option>
                                  <option value="log">日志</option>
                                  <option value="ai_summary">AI摘要</option>
                                  <option value="export">导出</option>
                                </select>
                              </div>
                              {action.type === 'notify' && (
                                <div className="space-y-2">
                                  <Label>通知标题</Label>
                                  <Input
                                    placeholder="新消息提醒"
                                    value={action.title || ''}
                                    onChange={(e) => updateAction(idx, { ...action, title: e.target.value })}
                                  />
                                </div>
                              )}
                              {action.type === 'ai_summary' && (
                                <div className="space-y-2">
                                  <Label>摘要模板</Label>
                                  <Input
                                    placeholder="default"
                                    value={action.template || ''}
                                    onChange={(e) => updateAction(idx, { ...action, template: e.target.value })}
                                  />
                                </div>
                              )}
                              {action.type === 'export' && (
                                <div className="space-y-2">
                                  <Label>导出格式</Label>
                                  <select
                                    className="px-3 py-2 border rounded-md"
                                    value={action.format || 'json'}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateAction(idx, { ...action, format: e.target.value as any })}
                                  >
                                    <option value="json">JSON</option>
                                    <option value="markdown">Markdown</option>
                                  </select>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive ml-4"
                              onClick={() => removeAction(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
