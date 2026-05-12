import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, ToggleLeft, ToggleRight, Trash2, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { useSkillStore } from '../stores/skillStore'

export function SkillManager() {
  const { skills, loadSkills, addSkill, updateSkill, deleteSkill } = useSkillStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillDesc, setNewSkillDesc] = useState('')

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
                  {skill.triggers.map((trigger, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary/10 rounded-full">
                      {trigger.type === 'keywords' && '关键词'}
                      {trigger.type === 'regex' && '正则'}
                      {trigger.type === 'member' && '成员'}
                    </span>
                  ))}
                  {skill.actions.map((action, idx) => (
                    <span key={idx} className="px-2 py-1 bg-secondary rounded-full">
                      {action.type === 'notify' && '通知'}
                      {action.type === 'log' && '日志'}
                      {action.type === 'ai_summary' && 'AI摘要'}
                      {action.type === 'export' && '导出'}
                    </span>
                  ))}
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
    </div>
  )
}
