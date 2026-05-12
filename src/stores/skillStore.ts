import { create } from 'zustand'
import type { Skill } from '../types'

const SKILLS_KEY = 'chatsight-skills'

const getDefaultSkills = (): Skill[] => [
  {
    id: 'skill-default-competitor',
    name: '竞品监控',
    description: '监控竞品相关讨论',
    enabled: false,
    triggers: [
      { type: 'keywords', keywords: ['竞品', '对比', '替代'] },
    ],
    actions: [
      { type: 'notify', title: '发现竞品讨论' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

interface SkillState {
  skills: Skill[]
  loadSkills: () => void
  saveSkills: () => void
  addSkill: (skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSkill: (id: string, updates: Partial<Skill>) => void
  deleteSkill: (id: string) => void
}

export const useSkillStore = create<SkillState>((set, get) => ({
  skills: [],

  loadSkills: () => {
    try {
      const stored = localStorage.getItem(SKILLS_KEY)
      if (stored) {
        set({ skills: JSON.parse(stored) as Skill[] })
      } else {
        set({ skills: getDefaultSkills() })
      }
    } catch {
      set({ skills: getDefaultSkills() })
    }
  },

  saveSkills: () => {
    try {
      const { skills } = get()
      localStorage.setItem(SKILLS_KEY, JSON.stringify(skills))
    } catch (err) {
      console.error('保存 Skills 失败')
    }
  },

  addSkill: (skill) => {
    const newSkill: Skill = {
      ...skill,
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    set((state) => ({
      skills: [...state.skills, newSkill]
    }))
    get().saveSkills()
  },

  updateSkill: (id, updates) => {
    set((state) => ({
      skills: state.skills.map(skill => 
        skill.id === id ? { ...skill, ...updates, updatedAt: new Date().toISOString() } : skill
      )
    }))
    get().saveSkills()
  },

  deleteSkill: (id) => {
    set((state) => ({
      skills: state.skills.filter(skill => skill.id !== id)
    }))
    get().saveSkills()
  }
}))
