# Wechat-Insight 实现计划（第一阶段：核心 MVP）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 Electron + React 的微信群消息智能分析桌面应用，实现会话列表、聊天记录查看、AI 摘要生成三大核心功能。

**Architecture:** 采用 Electron 桌面端架构，前端使用 React + TypeScript，通过 IPC 通信调用本地 wechat-cli 命令实现数据读取。状态管理使用 Zustand，AI 服务支持 OpenAI/Claude 双模型。

**Tech Stack:** 
- Electron (桌面端封装)
- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS + shadcn/ui
- Zustand (状态管理)
- Node.js child_process (wechat-cli 调用)

---

## 文件结构概览

```
chatsight/
├── electron/
│   ├── main.ts              # Electron 主进程
│   ├── preload.ts           # 预加载脚本（安全桥接）
│   └── wechat/
│       ├── executor.ts      # wechat-cli 执行封装
│       ├── parser.ts        # 结果解析器
│       └── types.ts         # 类型定义
├── src/
│   ├── main.tsx             # React 入口
│   ├── App.tsx              # 根组件
│   ├── components/          # UI 组件
│   │   ├── SessionList.tsx
│   │   ├── ChatHistory.tsx
│   │   ├── AISummary.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── stores/              # Zustand 状态管理
│   │   ├── sessionStore.ts
│   │   ├── messageStore.ts
│   │   └── configStore.ts
│   ├── services/            # 业务逻辑
│   │   ├── wechatService.ts
│   │   └── aiService.ts
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useSessions.ts
│   │   └── useChatHistory.ts
│   └── types/               # TypeScript 类型
│       └── index.ts
├── package.json
├── vite.config.ts
├── electron-builder.json
└── tsconfig.json
```

---

## Task 1: 项目初始化和基础配置

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `electron-builder.json`
- Create: `.env.example`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "chatsight",
  "version": "1.0.0",
  "description": "AI-Powered WeChat Intelligence - 微信群消息智能分析桌面端",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && electron-builder",
    "preview": "vite preview",
    "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "vite build && electron-builder"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.2",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.20",
    "@types/react": "^18.2.58",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "concurrently": "^8.2.2",
    "electron": "^28.2.3",
    "electron-builder": "^24.13.3",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.4",
    "vite-plugin-electron": "^0.28.4",
    "vite-plugin-electron-renderer": "^0.14.5",
    "wait-on": "^7.2.0"
  },
  "build": {
    "appId": "ai.wesight.chatsight",
    "productName": "Wechat-Insight",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*"
    ],
    "mac": {
      "target": "dmg",
      "category": "public.app-category.productivity"
    }
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "electron/**/*.ts"]
}
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron'
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

- [ ] **Step 5: 创建 electron-builder.json**

```json
{
  "appId": "ai.wesight.chatsight",
  "productName": "Wechat-Insight",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "dist-electron/**/*"
  ],
  "mac": {
    "target": "dmg",
    "category": "public.app-category.productivity"
  },
  "win": {
    "target": "nsis"
  },
  "linux": {
    "target": "AppImage"
  }
}
```

- [ ] **Step 6: 创建 .env.example**

```
# AI API Keys
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key

# Default AI Model
VITE_DEFAULT_AI_MODEL=gpt-4

# Application Config
VITE_APP_NAME=Wechat-Insight
```

- [ ] **Step 7: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 8: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 9: 创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wechat-Insight</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 10: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 11: 创建 src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 12: 创建 src/vite-env.d.ts**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_DEFAULT_AI_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 13: 安装依赖**

Run: `cd /Users/tangtao/Projects/Wechat-insight && npm install`
Expected: 安装所有依赖包

- [ ] **Step 14: 提交代码**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts electron-builder.json .env.example tailwind.config.js postcss.config.js index.html src/main.tsx src/index.css src/vite-env.d.ts
git commit -m "feat: 项目初始化和基础配置"
```

---

## Task 2: Electron 主进程和 wechat-cli 封装层

**Files:**
- Create: `electron/main.ts`
- Create: `electron/preload.ts`
- Create: `electron/wechat/types.ts`
- Create: `electron/wechat/executor.ts`
- Create: `electron/wechat/parser.ts`

- [ ] **Step 1: 创建 electron/main.ts**

```typescript
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { WeChatExecutor } from './wechat/executor'

let mainWindow: BrowserWindow | null = null

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  
  // 注册 wechat-cli IPC 处理器
  const wechatExecutor = new WeChatExecutor()
  
  ipcMain.handle('wechat:sessions', async (_, limit?: number) => {
    return await wechatExecutor.getSessions(limit)
  })
  
  ipcMain.handle('wechat:history', async (_, sessionName: string, limit?: number) => {
    return await wechatExecutor.getHistory(sessionName, limit)
  })
  
  ipcMain.handle('wechat:search', async (_, keyword: string, sessionName?: string) => {
    return await wechatExecutor.search(keyword, sessionName)
  })
  
  ipcMain.handle('wechat:stats', async (_, sessionName?: string) => {
    return await wechatExecutor.getStats(sessionName)
  })
  
  ipcMain.handle('wechat:contacts', async (_, query?: string) => {
    return await wechatExecutor.getContacts(query)
  })
  
  ipcMain.handle('wechat:init', async () => {
    return await wechatExecutor.init()
  })
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

- [ ] **Step 2: 创建 electron/preload.ts**

```typescript
import { contextBridge, ipcRenderer } from 'electron'

export interface WeChatAPI {
  getSessions: (limit?: number) => Promise<any>
  getHistory: (sessionName: string, limit?: number) => Promise<any>
  search: (keyword: string, sessionName?: string) => Promise<any>
  getStats: (sessionName?: string) => Promise<any>
  getContacts: (query?: string) => Promise<any>
  init: () => Promise<any>
}

const wechatAPI: WeChatAPI = {
  getSessions: (limit?: number) => ipcRenderer.invoke('wechat:sessions', limit),
  getHistory: (sessionName: string, limit?: number) => ipcRenderer.invoke('wechat:history', sessionName, limit),
  search: (keyword: string, sessionName?: string) => ipcRenderer.invoke('wechat:search', keyword, sessionName),
  getStats: (sessionName?: string) => ipcRenderer.invoke('wechat:stats', sessionName),
  getContacts: (query?: string) => ipcRenderer.invoke('wechat:contacts', query),
  init: () => ipcRenderer.invoke('wechat:init'),
}

contextBridge.exposeInMainWorld('wechat', wechatAPI)
```

- [ ] **Step 3: 创建 electron/wechat/types.ts**

```typescript
export interface Session {
  id: string
  name: string
  type: 'private' | 'group'
  lastMessage: string
  lastMessageTime: string
  unreadCount?: number
}

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isSelf: boolean
}

export interface Contact {
  id: string
  name: string
  type: 'friend' | 'group'
  avatar?: string
}

export interface SearchResult {
  session: string
  messages: Message[]
}

export interface Stats {
  totalMessages: number
  totalMembers: number
  activeMembers: MemberStats[]
  messageTypes: {
    type: string
    count: number
  }[]
}

export interface MemberStats {
  name: string
  messageCount: number
}

export type WeChatError = 
  | { code: 'NOT_INITIALIZED'; message: string }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'EXECUTION_FAILED'; message: string }
  | { code: 'TIMEOUT'; message: string }
  | { code: 'PARSE_ERROR'; message: string }
```

- [ ] **Step 4: 创建 electron/wechat/executor.ts**

```typescript
import { spawn } from 'child_process'
import { WeChatParser } from './parser'
import type { Session, Message, SearchResult, Contact, Stats } from './types'

export class WeChatExecutor {
  private parser: WeChatParser
  private commandPrefix: string

  constructor() {
    this.parser = new WeChatParser()
    this.commandPrefix = 'wechat-cli'
  }

  private executeCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.commandPrefix, args, {
        timeout: 30000,
      })

      let stdout = ''
      let stderr = ''

      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim())
        } else {
          reject(new Error(stderr || `Command failed with code ${code}`))
        }
      })

      process.on('error', (error) => {
        reject(error)
      })
    })
  }

  async getSessions(limit: number = 20): Promise<Session[]> {
    try {
      const output = await this.executeCommand(['sessions', '--limit', String(limit)])
      return this.parser.parseSessions(output)
    } catch (error) {
      throw { code: 'EXECUTION_FAILED', message: (error as Error).message }
    }
  }

  async getHistory(sessionName: string, limit: number = 50): Promise<Message[]> {
    try {
      const output = await this.executeCommand(['history', sessionName, '--limit', String(limit)])
      return this.parser.parseHistory(output)
    } catch (error) {
      if ((error as Error).message.includes('NOT_FOUND')) {
        throw { code: 'NOT_FOUND', message: `未找到会话: ${sessionName}` }
      }
      throw { code: 'EXECUTION_FAILED', message: (error as Error).message }
    }
  }

  async search(keyword: string, sessionName?: string): Promise<SearchResult[]> {
    try {
      const args = ['search', keyword]
      if (sessionName) {
        args.push('--chat', sessionName)
      }
      const output = await this.executeCommand(args)
      return this.parser.parseSearchResults(output)
    } catch (error) {
      throw { code: 'EXECUTION_FAILED', message: (error as Error).message }
    }
  }

  async getStats(sessionName?: string): Promise<Stats> {
    try {
      const args = ['stats']
      if (sessionName) {
        args.push('--chat', sessionName)
      }
      const output = await this.executeCommand(args)
      return this.parser.parseStats(output)
    } catch (error) {
      throw { code: 'EXECUTION_FAILED', message: (error as Error).message }
    }
  }

  async getContacts(query?: string): Promise<Contact[]> {
    try {
      const args = ['contacts']
      if (query) {
        args.push('--query', query)
      }
      const output = await this.executeCommand(args)
      return this.parser.parseContacts(output)
    } catch (error) {
      throw { code: 'EXECUTION_FAILED', message: (error as Error).message }
    }
  }

  async init(): Promise<{ success: boolean; message: string }> {
    try {
      const output = await this.executeCommand(['init'])
      return { success: true, message: output }
    } catch (error) {
      throw { code: 'EXECUTION_FAILED', message: (error as Error).message }
    }
  }
}
```

- [ ] **Step 5: 创建 electron/wechat/parser.ts**

```typescript
import type { Session, Message, SearchResult, Contact, Stats } from './types'

export class WeChatParser {
  parseSessions(output: string): Session[] {
    try {
      const data = JSON.parse(output)
      if (Array.isArray(data)) {
        return data.map((item: any, index: number) => ({
          id: item.id || String(index),
          name: item.name || item.NickName || '未知会话',
          type: item.type || (item.IsGroup ? 'group' : 'private'),
          lastMessage: item.lastMessage || item.LastMessage || '',
          lastMessageTime: item.lastMessageTime || item.LastMessageTime || new Date().toISOString(),
          unreadCount: item.unreadCount || item.UnreadCount || 0,
        }))
      }
      return []
    } catch {
      return this.parseSessionsFromText(output)
    }
  }

  private parseSessionsFromText(output: string): Session[] {
    const sessions: Session[] = []
    const lines = output.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      const match = line.match(/^[\d\-]+\s+(.+?)\s+\|\s+(.+)$/)
      if (match) {
        sessions.push({
          id: String(sessions.length),
          name: match[1].trim(),
          type: 'group',
          lastMessage: match[2].trim(),
          lastMessageTime: new Date().toISOString(),
        })
      }
    }
    
    return sessions
  }

  parseHistory(output: string): Message[] {
    try {
      const data = JSON.parse(output)
      if (Array.isArray(data)) {
        return data.map((item: any, index: number) => ({
          id: item.id || String(index),
          sender: item.sender || item.Sender || '未知',
          content: item.content || item.Content || '',
          timestamp: item.timestamp || item.CreateTime || new Date().toISOString(),
          isSelf: item.isSelf || item.IsSelf || false,
        }))
      }
      return []
    } catch {
      return this.parseHistoryFromText(output)
    }
  }

  private parseHistoryFromText(output: string): Message[] {
    const messages: Message[] = []
    const lines = output.split('\n').filter(line => line.trim())
    
    const timeRegex = /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s*(.+?):\s*(.+)$/
    
    for (const line of lines) {
      const match = line.match(timeRegex)
      if (match) {
        const isSelf = match[2].includes('我') || match[2].includes('Self')
        messages.push({
          id: String(messages.length),
          sender: match[2].trim(),
          content: match[3].trim(),
          timestamp: match[1],
          isSelf,
        })
      }
    }
    
    return messages
  }

  parseSearchResults(output: string): SearchResult[] {
    try {
      const data = JSON.parse(output)
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          session: item.session || item.ChatName || '未知会话',
          messages: this.parseHistory(Array.isArray(item.messages) ? JSON.stringify(item.messages) : item.messages),
        }))
      }
      return []
    } catch {
      return []
    }
  }

  parseContacts(output: string): Contact[] {
    try {
      const data = JSON.parse(output)
      if (Array.isArray(data)) {
        return data.map((item: any, index: number) => ({
          id: item.id || String(index),
          name: item.name || item.NickName || '未知联系人',
          type: item.type || (item.IsGroup ? 'group' : 'friend'),
          avatar: item.avatar || item.HeadImgUrl || undefined,
        }))
      }
      return []
    } catch {
      return []
    }
  }

  parseStats(output: string): Stats {
    try {
      return JSON.parse(output)
    } catch {
      return {
        totalMessages: 0,
        totalMembers: 0,
        activeMembers: [],
        messageTypes: [],
      }
    }
  }
}
```

- [ ] **Step 6: 提交代码**

```bash
git add electron/main.ts electron/preload.ts electron/wechat/types.ts electron/wechat/executor.ts electron/wechat/parser.ts
git commit -m "feat: 实现 Electron 主进程和 wechat-cli 封装层"
```

---

## Task 3: 工具函数和类型定义

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/types/index.ts`

- [ ] **Step 1: 创建 src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}小时前`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
```

- [ ] **Step 2: 创建 src/types/index.ts**

```typescript
export interface Session {
  id: string
  name: string
  type: 'private' | 'group'
  lastMessage: string
  lastMessageTime: string
  unreadCount?: number
}

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isSelf: boolean
}

export interface AISummary {
  overview: {
    totalMessages: number
    activeUsers: number
    peakHours: string[]
    trend: string
  }
  topics: {
    topic: string
    heat: 'high' | 'medium' | 'low'
    count: number
  }[]
  keyPoints: {
    type: 'suggestion' | 'consensus' | 'dispute'
    content: string
    author?: string
  }[]
  faqs: {
    question: string
    answer?: string
  }[]
  actionItems: {
    content: string
    priority: 'high' | 'medium' | 'low'
    assignTo?: string
  }[]
  insights: {
    content: string
    type: 'opportunity' | 'risk' | 'trend'
  }[]
}

export type AIProvider = 'openai' | 'claude' | 'local'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model: string
  baseUrl?: string
}

export type WeChatError = 
  | { code: 'NOT_INITIALIZED'; message: string }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'EXECUTION_FAILED'; message: string }
  | { code: 'TIMEOUT'; message: string }
  | { code: 'PARSE_ERROR'; message: string }

export type AIError =
  | { code: 'INVALID_KEY'; message: string }
  | { code: 'QUOTA_EXCEEDED'; message: string }
  | { code: 'NETWORK_ERROR'; message: string }
  | { code: 'RATE_LIMIT'; message: string }
```

- [ ] **Step 3: 创建 src/vite-env.d.ts（如果不存在）**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_DEFAULT_AI_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  wechat: import('../electron/preload').WeChatAPI
}
```

- [ ] **Step 4: 提交代码**

```bash
git add src/lib/utils.ts src/types/index.ts src/vite-env.d.ts
git commit -m "feat: 添加工具函数和类型定义"
```

---

## Task 4: Zustand 状态管理

**Files:**
- Create: `src/stores/sessionStore.ts`
- Create: `src/stores/messageStore.ts`
- Create: `src/stores/configStore.ts`

- [ ] **Step 1: 创建 src/stores/sessionStore.ts**

```typescript
import { create } from 'zustand'
import type { Session } from '@/types'

interface SessionState {
  sessions: Session[]
  selectedSession: Session | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  setSessions: (sessions: Session[]) => void
  setSelectedSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  fetchSessions: (limit?: number) => Promise<void>
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  selectedSession: null,
  isLoading: false,
  error: null,
  searchQuery: '',

  setSessions: (sessions) => set({ sessions }),
  
  setSelectedSession: (session) => set({ selectedSession: session }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchSessions: async (limit = 20) => {
    set({ isLoading: true, error: null })
    try {
      const sessions = await window.wechat.getSessions(limit)
      set({ sessions, isLoading: false })
    } catch (error: any) {
      set({ error: error.message || '获取会话列表失败', isLoading: false })
    }
  },
}))
```

- [ ] **Step 2: 创建 src/stores/messageStore.ts**

```typescript
import { create } from 'zustand'
import type { Message } from '@/types'

interface MessageState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  setMessages: (messages: Message[]) => void
  appendMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setHasMore: (hasMore: boolean) => void
  fetchHistory: (sessionName: string, limit?: number) => Promise<void>
  clearMessages: () => void
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  hasMore: true,

  setMessages: (messages) => set({ messages }),
  
  appendMessages: (newMessages) => set((state) => ({ 
    messages: [...state.messages, ...newMessages] 
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setHasMore: (hasMore) => set({ hasMore }),

  fetchHistory: async (sessionName: string, limit = 50) => {
    set({ isLoading: true, error: null })
    try {
      const messages = await window.wechat.getHistory(sessionName, limit)
      set({ messages, isLoading: false, hasMore: messages.length >= limit })
    } catch (error: any) {
      set({ error: error.message || '获取聊天记录失败', isLoading: false })
    }
  },

  clearMessages: () => set({ messages: [], hasMore: true }),
}))
```

- [ ] **Step 3: 创建 src/stores/configStore.ts**

```typescript
import { create } from 'zustand'
import type { AIConfig, AIProvider } from '@/types'

interface ConfigState {
  aiConfig: AIConfig
  isConfigured: boolean
  updateAIConfig: (config: Partial<AIConfig>) => void
  setConfigured: (configured: boolean) => void
  loadConfig: () => void
  saveConfig: () => void
}

const DEFAULT_CONFIG: AIConfig = {
  provider: 'openai',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-4',
  baseUrl: undefined,
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  aiConfig: DEFAULT_CONFIG,
  isConfigured: !!import.meta.env.VITE_OPENAI_API_KEY,

  updateAIConfig: (config) => {
    set((state) => ({
      aiConfig: { ...state.aiConfig, ...config },
    }))
    get().saveConfig()
  },

  setConfigured: (configured) => set({ isConfigured: configured }),

  loadConfig: () => {
    const saved = localStorage.getItem('chatsight-config')
    if (saved) {
      try {
        const config = JSON.parse(saved)
        set({ 
          aiConfig: { ...DEFAULT_CONFIG, ...config },
          isConfigured: !!config.apiKey,
        })
      } catch {
        console.error('Failed to load config')
      }
    }
  },

  saveConfig: () => {
    const { aiConfig } = get()
    localStorage.setItem('chatsight-config', JSON.stringify(aiConfig))
    set({ isConfigured: !!aiConfig.apiKey })
  },
}))
```

- [ ] **Step 4: 提交代码**

```bash
git add src/stores/sessionStore.ts src/stores/messageStore.ts src/stores/configStore.ts
git commit -m "feat: 实现 Zustand 状态管理"
```

---

## Task 5: AI 服务层

**Files:**
- Create: `src/services/aiService.ts`
- Create: `src/lib/prompts.ts`

- [ ] **Step 1: 创建 src/lib/prompts.ts**

```typescript
import type { Message } from '@/types'

export const SUMMARY_PROMPT_TEMPLATE = `## 角色设定
你是一位专业的微信群运营分析师，擅长从聊天记录中提取有价值的信息。

## 分析维度

请对以下微信群聊天记录进行全面分析，输出结构化的分析报告：

### 1. 📊 今日概览
- 群内总消息数量
- 参与讨论的人数
- 讨论的活跃时段
- 与昨日相比的变化趋势

### 2. 🔥 核心话题
- 排名前 3 的热门话题
- 每个话题的讨论热度（高/中/低）
- 话题之间的关联性

### 3. 💡 重要观点
- 用户提出的关键建议或反馈
- 达成的共识
- 存在的分歧或争议点

### 4. ❓ 常见问题（FAQ）
- 用户提问频率最高的问题
- 对应的解答或解决方案

### 5. ⚠️ 待跟进事项
- 需要群主/管理员回复的问题
- 需要后续处理的事项
- 涉及的重要决策点

### 6. 📈 趋势洞察
- 用户关注点的变化趋势
- 潜在的机会或风险提示

## 输出要求
- 使用中文输出
- 结构清晰，分点明确
- 重点信息用 emoji 标注
- 控制总字数在 500 字以内

## 聊天记录内容：
{messages}

## 输出格式：
请按以下 JSON 格式输出：
{
  "overview": {
    "totalMessages": 数字,
    "activeUsers": 数字,
    "peakHours": ["时间段1", "时间段2"],
    "trend": "变化趋势描述"
  },
  "topics": [
    {
      "topic": "话题名称",
      "heat": "high|medium|low",
      "count": 消息数量
    }
  ],
  "keyPoints": [
    {
      "type": "suggestion|consensus|dispute",
      "content": "观点内容",
      "author": "提出者（可选）"
    }
  ],
  "faqs": [
    {
      "question": "问题",
      "answer": "解答（可选）"
    }
  ],
  "actionItems": [
    {
      "content": "事项内容",
      "priority": "high|medium|low",
      "assignTo": "负责人（可选）"
    }
  ],
  "insights": [
    {
      "content": "洞察内容",
      "type": "opportunity|risk|trend"
    }
  ]
}`

export function buildSummaryPrompt(messages: Message[]): string {
  const formattedMessages = messages
    .map(m => `[${m.timestamp}] ${m.sender}: ${m.content}`)
    .join('\n')
  
  return SUMMARY_PROMPT_TEMPLATE.replace('{messages}', formattedMessages)
}
```

- [ ] **Step 2: 创建 src/services/aiService.ts**

```typescript
import type { AIConfig, AISummary, Message } from '@/types'
import { buildSummaryPrompt } from '@/lib/prompts'

class AIService {
  private config: AIConfig | null = null

  setConfig(config: AIConfig) {
    this.config = config
  }

  private getHeaders(): HeadersInit {
    if (!this.config) throw new Error('AI 配置未设置')
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.config.provider === 'openai') {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    } else if (this.config.provider === 'claude') {
      headers['x-api-key'] = this.config.apiKey
      headers['anthropic-version'] = '2023-06-01'
    }

    return headers
  }

  private getEndpoint(): string {
    if (!this.config) throw new Error('AI 配置未设置')
    
    if (this.config.baseUrl) {
      return this.config.baseUrl
    }

    if (this.config.provider === 'openai') {
      return 'https://api.openai.com/v1'
    } else if (this.config.provider === 'claude') {
      return 'https://api.anthropic.com/v1'
    }

    throw new Error('不支持的 AI 提供商')
  }

  async generateSummary(messages: Message[]): Promise<AISummary> {
    if (!this.config) {
      throw { code: 'INVALID_KEY', message: '请先配置 AI API Key' }
    }

    const prompt = buildSummaryPrompt(messages)

    try {
      if (this.config.provider === 'openai') {
        return await this.callOpenAI(prompt)
      } else if (this.config.provider === 'claude') {
        return await this.callClaude(prompt)
      }
      
      throw new Error('不支持的 AI 提供商')
    } catch (error: any) {
      if (error.code) throw error
      throw { code: 'NETWORK_ERROR', message: error.message }
    }
  }

  private async callOpenAI(prompt: string): Promise<AISummary> {
    const endpoint = `${this.getEndpoint()}/chat/completions`
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.config!.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的微信群运营分析师。请严格按照指定的 JSON 格式输出分析结果，不要添加任何额外的解释或说明。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      if (response.status === 401) {
        throw { code: 'INVALID_KEY', message: 'API Key 无效' }
      } else if (response.status === 429) {
        throw { code: 'RATE_LIMIT', message: '请求过于频繁，请稍后重试' }
      }
      throw { code: 'EXECUTION_FAILED', message: error.error?.message || 'API 调用失败' }
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (!content) {
      throw { code: 'EXECUTION_FAILED', message: '未获取到有效响应' }
    }

    return this.parseSummaryResponse(content)
  }

  private async callClaude(prompt: string): Promise<AISummary> {
    const endpoint = `${this.getEndpoint()}/messages`
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.config!.model || 'claude-3-sonnet-20240229',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      if (response.status === 401) {
        throw { code: 'INVALID_KEY', message: 'API Key 无效' }
      } else if (response.status === 429) {
        throw { code: 'RATE_LIMIT', message: '请求过于频繁，请稍后重试' }
      }
      throw { code: 'EXECUTION_FAILED', message: error.error?.message || 'API 调用失败' }
    }

    const data = await response.json()
    const content = data.content?.[0]?.text
    
    if (!content) {
      throw { code: 'EXECUTION_FAILED', message: '未获取到有效响应' }
    }

    return this.parseSummaryResponse(content)
  }

  private parseSummaryResponse(content: string): AISummary {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('无法解析响应内容')
      }
      return JSON.parse(jsonMatch[0])
    } catch {
      return {
        overview: {
          totalMessages: 0,
          activeUsers: 0,
          peakHours: [],
          trend: '解析失败',
        },
        topics: [],
        keyPoints: [],
        faqs: [],
        actionItems: [],
        insights: [],
      }
    }
  }
}

export const aiService = new AIService()
```

- [ ] **Step 3: 提交代码**

```bash
git add src/services/aiService.ts src/lib/prompts.ts
git commit -m "feat: 实现 AI 服务层（支持 OpenAI 和 Claude）"
```

---

## Task 6: React 组件 - 基础 UI

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/sonner.tsx` (Toast 通知)
- Create: `src/components/Header.tsx`
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: 创建 src/components/ui/button.tsx**

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

- [ ] **Step 2: 创建 src/components/ui/card.tsx**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

- [ ] **Step 3: 创建 src/components/ui/input.tsx**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 4: 创建 src/components/ui/sonner.tsx**

```tsx
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
```

- [ ] **Step 5: 创建 src/components/Header.tsx**

```tsx
import { Settings, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

interface HeaderProps {
  onRefresh?: () => void
  onSettings?: () => void
  isRefreshing?: boolean
}

export function Header({ onRefresh, onSettings, isRefreshing }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">W</span>
          </div>
          <h1 className="text-xl font-semibold">Wechat-Insight</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
          {onSettings && (
            <Button variant="ghost" size="icon" onClick={onSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 6: 创建 src/components/Sidebar.tsx**

```tsx
import { Input } from './ui/input'
import { useSessionStore } from '@/stores/sessionStore'
import { cn, formatTime, truncateText } from '@/lib/utils'
import { Search, Users } from 'lucide-react'

export function Sidebar() {
  const { 
    sessions, 
    selectedSession, 
    searchQuery, 
    setSearchQuery,
    setSelectedSession,
    fetchSessions,
    isLoading 
  } = useSessionStore()

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <aside className="w-80 border-r bg-muted/40 flex flex-col">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索会话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading && sessions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            加载中...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? '未找到匹配的会话' : '暂无会话'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors hover:bg-accent",
                  selectedSession?.id === session.id && "bg-accent"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                    session.type === 'group' ? 'bg-primary/10' : 'bg-secondary'
                  )}>
                    {session.type === 'group' ? (
                      <Users className="h-5 w-5 text-primary" />
                    ) : (
                      <span className="text-sm font-medium">
                        {session.name[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium truncate">
                        {session.name}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(session.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {truncateText(session.lastMessage, 40)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
```

- [ ] **Step 7: 提交代码**

```bash
git add src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/input.tsx src/components/ui/sonner.tsx src/components/Header.tsx src/components/Sidebar.tsx
git commit -m "feat: 实现基础 UI 组件"
```

---

## Task 7: React 组件 - 会话详情和消息列表

**Files:**
- Create: `src/components/ChatHistory.tsx`

- [ ] **Step 1: 创建 src/components/ChatHistory.tsx**

```tsx
import { useEffect } from 'react'
import { useMessageStore } from '@/stores/messageStore'
import { useSessionStore } from '@/stores/sessionStore'
import { cn, formatTime } from '@/lib/utils'
import { Button } from './ui/button'
import { MessageSquare } from 'lucide-react'

export function ChatHistory() {
  const { selectedSession } = useSessionStore()
  const { messages, isLoading, error, fetchHistory, clearMessages } = useMessageStore()

  useEffect(() => {
    if (selectedSession) {
      fetchHistory(selectedSession.name)
    } else {
      clearMessages()
    }
  }, [selectedSession, fetchHistory, clearMessages])

  if (!selectedSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-muted-foreground">
            选择一个会话开始
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            从左侧列表选择会话查看聊天记录
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b p-4">
        <h2 className="font-semibold text-lg">{selectedSession.name}</h2>
        <p className="text-sm text-muted-foreground">
          {selectedSession.type === 'group' ? '群聊' : '私聊'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-2">加载消息中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fetchHistory(selectedSession.name)}
            >
              重试
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">暂无消息记录</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isSelf ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3",
                  message.isSelf
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {!message.isSelf && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {message.sender}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p
                  className={cn(
                    "text-xs mt-1 opacity-70",
                    message.isSelf ? "text-right" : "text-left"
                  )}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/components/ChatHistory.tsx
git commit -m "feat: 实现聊天记录组件"
```

---

## Task 8: React 组件 - AI 摘要

**Files:**
- Create: `src/components/AISummary.tsx`

- [ ] **Step 1: 创建 src/components/AISummary.tsx**

```tsx
import { useState } from 'react'
import { useMessageStore } from '@/stores/messageStore'
import { useConfigStore } from '@/stores/configStore'
import { aiService } from '@/services/aiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import type { AISummary as AISummaryType } from '@/types'
import { 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  AlertCircle,
  Lightbulb,
  HelpCircle,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

export function AISummary() {
  const { messages } = useMessageStore()
  const { aiConfig } = useConfigStore()
  const [summary, setSummary] = useState<AISummaryType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateSummary = async () => {
    if (messages.length === 0) {
      toast.error('请先选择一个会话并加载消息')
      return
    }

    if (!aiConfig.apiKey) {
      toast.error('请先配置 AI API Key')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      aiService.setConfig(aiConfig)
      const result = await aiService.generateSummary(messages)
      setSummary(result)
      toast.success('摘要生成成功！')
    } catch (err: any) {
      setError(err.message || '生成摘要失败')
      toast.error(err.message || '生成摘要失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-96 border-l bg-muted/40 flex flex-col">
      <div className="border-b p-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI 摘要
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          使用 AI 分析群聊内容
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!summary && !isLoading && !error && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium mb-2">生成 AI 摘要</h3>
            <p className="text-sm text-muted-foreground mb-4">
              点击下方按钮，AI 将分析当前会话并生成摘要
            </p>
            <Button 
              onClick={handleGenerateSummary}
              disabled={messages.length === 0 || !aiConfig.apiKey}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              生成摘要
            </Button>
            {!aiConfig.apiKey && (
              <p className="text-xs text-destructive mt-2">
                请先在设置中配置 AI API Key
              </p>
            )}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-2">AI 正在分析中...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={handleGenerateSummary}>
              重试
            </Button>
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  今日概览
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">消息总数</span>
                    <span className="font-medium">{summary.overview.totalMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">活跃用户</span>
                    <span className="font-medium">{summary.overview.activeUsers}</span>
                  </div>
                  {summary.overview.peakHours.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">活跃时段</span>
                      <span className="font-medium">{summary.overview.peakHours.join(', ')}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">趋势：</span>
                    <span>{summary.overview.trend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {summary.topics.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    核心话题
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summary.topics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          topic.heat === 'high' ? 'bg-red-100 text-red-700' :
                          topic.heat === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {topic.heat}
                        </span>
                        <span className="text-sm">{topic.topic}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {topic.count} 条
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {summary.keyPoints.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    重要观点
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summary.keyPoints.map((point, index) => (
                      <div key={index} className="text-sm">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          point.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                          point.type === 'consensus' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {point.type === 'suggestion' ? '建议' :
                           point.type === 'consensus' ? '共识' : '争议'}
                        </span>
                        <p className="mt-1">{point.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {summary.faqs.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    常见问题
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.faqs.map((faq, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">Q: {faq.question}</p>
                        {faq.answer && (
                          <p className="text-muted-foreground mt-1">A: {faq.answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {summary.actionItems.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    待跟进事项
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summary.actionItems.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm">{item.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              item.priority === 'high' ? 'bg-red-100 text-red-700' :
                              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {item.priority === 'high' ? '高' :
                               item.priority === 'medium' ? '中' : '低'}
                            </span>
                            {item.assignTo && (
                              <span className="text-xs text-muted-foreground">
                                @{item.assignTo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {summary.insights.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    趋势洞察
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summary.insights.map((insight, index) => (
                      <div key={index} className="text-sm">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          insight.type === 'opportunity' ? 'bg-green-100 text-green-700' :
                          insight.type === 'risk' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {insight.type === 'opportunity' ? '机会' :
                           insight.type === 'risk' ? '风险' : '趋势'}
                        </span>
                        <p className="mt-1">{insight.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
               variant="outline"
               className="w-full"
               onClick={handleGenerateSummary}
             >
               重新生成
             </Button>
           </div>
         )}
       </div>
     </div>
   )
 }

- [ ] **Step 2: 提交代码**

```bash
git add src/components/AISummary.tsx
git commit -m "feat: 实现 AI 摘要组件"
```

---

## Task 9: 主应用组件和集成

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 src/App.tsx**

```tsx
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ChatHistory } from './components/ChatHistory'
import { AISummary } from './components/AISummary'
import { useSessionStore } from './stores/sessionStore'
import { useConfigStore } from './stores/configStore'
import { SettingsDialog } from './components/SettingsDialog'

function App() {
  const { fetchSessions, isLoading: sessionsLoading } = useSessionStore()
  const { loadConfig } = useConfigStore()
  const [showSettings, setShowSettings] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadConfig()
    fetchSessions()
  }, [loadConfig, fetchSessions])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchSessions()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        onRefresh={handleRefresh}
        onSettings={() => setShowSettings(true)}
        isRefreshing={isRefreshing}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ChatHistory />
        <AISummary />
      </div>

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <Toaster position="top-right" />
    </div>
  )
}

export default App

- [ ] **Step 2: 创建 src/components/SettingsDialog.tsx**

```tsx
import { useState } from 'react'
import { useConfigStore } from '@/stores/configStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import type { AIProvider } from '@/types'
import { toast } from 'sonner'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { aiConfig, updateAIConfig } = useConfigStore()
  const [provider, setProvider] = useState<AIProvider>(aiConfig.provider)
  const [apiKey, setApiKey] = useState(aiConfig.apiKey)
  const [model, setModel] = useState(aiConfig.model)

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('请输入 API Key')
      return
    }

    updateAIConfig({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim() || (provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet-20240229'),
    })

    toast.success('设置已保存')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI 设置</DialogTitle>
          <DialogDescription>
            配置 AI 模型以生成群聊摘要
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">AI 提供商</Label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="openai">OpenAI (GPT)</option>
              <option value="claude">Anthropic (Claude)</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">模型</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet-20240229'}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: 创建 src/components/ui/label.tsx**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
```

- [ ] **Step 4: 创建 src/components/ui/dialog.tsx**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Dialog = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      className
    )}
    {...props}
  />
))
Dialog.displayName = "Dialog"

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
    <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200">
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    </div>
  </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
}
```

- [ ] **Step 5: 添加 sonner 依赖到 package.json**

在 dependencies 中添加：
```json
"sonner": "^1.4.0"
```

- [ ] **Step 6: 提交代码**

```bash
git add src/App.tsx src/components/SettingsDialog.tsx src/components/ui/label.tsx src/components/ui/dialog.tsx
git commit -m "feat: 集成主应用组件和设置对话框"
```

---

## Task 10: 启动和测试

- [ ] **Step 1: 安装 sonner 依赖**

Run: `cd /Users/tangtao/Projects/Wechat-insight && npm install sonner`

- [ ] **Step 2: 验证项目结构**

Run: `ls -la src/components src/stores src/services`

Expected:
```
src/components/
  Header.tsx
  Sidebar.tsx
  ChatHistory.tsx
  AISummary.tsx
  SettingsDialog.tsx
  ui/
    button.tsx
    card.tsx
    input.tsx
    dialog.tsx
    label.tsx
    sonner.tsx

src/stores/
  sessionStore.ts
  messageStore.ts
  configStore.ts

src/services/
  aiService.ts
```

- [ ] **Step 3: 启动开发服务器**

Run: `npm run electron:dev`

Expected:
- Vite 开发服务器启动在 http://localhost:5173
- Electron 应用窗口打开
- 控制台无报错

- [ ] **Step 4: 测试基础功能**

1. 检查应用是否正常启动
2. 验证会话列表是否加载
3. 测试选择会话功能
4. 验证聊天记录显示
5. 测试设置对话框

- [ ] **Step 5: 测试 AI 摘要功能**

1. 配置 AI API Key
2. 选择一个会话
3. 点击"生成摘要"按钮
4. 验证摘要结果展示

- [ ] **Step 6: 提交所有代码**

```bash
git add .
git commit -m "feat: 完成第一阶段 MVP 开发"
```

---

## 验收检查清单

- [ ] 项目初始化成功，所有依赖安装完成
- [ ] Electron 主进程和 wechat-cli 封装层工作正常
- [ ] 会话列表正确展示最近会话
- [ ] 聊天记录正确显示消息内容
- [ ] AI 摘要正确生成并展示
- [ ] 设置对话框可以保存 AI 配置
- [ ] 错误处理完善，用户体验流畅
- [ ] 代码提交到 Git 仓库

---

**计划完成！文件已保存至 `docs/superpowers/plans/2026-05-10-chatsight-implementation.md`**

**两种执行方式：**

**1. Subagent-Driven (推荐)** - 我会为每个任务启动一个子代理，逐个完成任务并审查，快速迭代

**2. Inline Execution** - 在当前会话中批量执行任务，适合熟悉代码的开发者

**你选择哪种方式？**