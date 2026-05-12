import type { Skill, SkillTrigger, SkillAction, SkillExecutionContext, Message } from '../types'
import { matchSingleKeyword } from '../lib/keywordMatcher'

export class SkillManager {
  private skills: Skill[] = []

  constructor(skills: Skill[] = []) {
    this.skills = skills
  }

  setSkills(skills: Skill[]) {
    this.skills = skills
  }

  getSkills(): Skill[] {
    return [...this.skills]
  }

  getEnabledSkills(): Skill[] {
    return this.skills.filter(skill => skill.enabled)
  }

  checkTrigger(trigger: SkillTrigger, context: SkillExecutionContext): boolean {
    if (!context.message) return false

    switch (trigger.type) {
      case 'keywords':
        if (!trigger.keywords) return false
        return trigger.keywords.some(keyword => 
          matchSingleKeyword(context.message!.content, { id: 'temp', keyword, isRegex: false, enabled: true }))
      case 'regex':
        if (!trigger.pattern) return false
        try {
          const regex = new RegExp(trigger.pattern, 'i')
          return regex.test(context.message.content)
        } catch {
          return false
        }
      case 'member':
        if (!trigger.member) return false
        return context.message.sender.toLowerCase().includes(trigger.member.toLowerCase())
      case 'time':
        // Time trigger to be implemented later
        return false
      default:
        return false
    }
  }

  checkSkillTriggers(skill: Skill, context: SkillExecutionContext): boolean {
    if (!skill.enabled) return false
    return skill.triggers.some(trigger => this.checkTrigger(trigger, context))
  }

  async executeAction(action: SkillAction, context: SkillExecutionContext): Promise<void> {
    switch (action.type) {
      case 'notify':
        if (window.electronAPI?.notification?.show) {
          window.electronAPI.notification.show({
            title: action.title || 'Skill Triggered',
            body: action.message || context.message?.content || 'New message matched your skill'
          })
        }
        break
      case 'log':
        console.log('[Skill Action]', action, context)
        break
      case 'ai_summary':
        // AI summary action to be implemented later
        console.log('[Skill Action] AI Summary', action, context)
        break
      case 'export':
        // Export action to be implemented later
        console.log('[Skill Action] Export', action, context)
        break
    }
  }

  async executeSkillActions(skill: Skill, context: SkillExecutionContext): Promise<void> {
    for (const action of skill.actions) {
      await this.executeAction(action, context)
    }
  }

  async processMessage(message: Message, sessionName: string): Promise<void> {
    const context: SkillExecutionContext = {
      message,
      sessionName,
      timestamp: message.timestamp
    }

    const enabledSkills = this.getEnabledSkills()
    for (const skill of enabledSkills) {
      if (this.checkSkillTriggers(skill, context)) {
        await this.executeSkillActions(skill, context)
      }
    }
  }
}

export default SkillManager
