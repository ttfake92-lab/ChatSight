# ChatSight 完整实现计划书

> **执行方式**: AI Agent 自动执行
> **计划版本**: v1.0
> **更新时间**: 2026-05-12
> **覆盖范围**: 全部四个阶段

---

## 执行原则

1. **逐阶段执行**: 按阶段顺序推进，每个阶段完成后验证再进入下一阶段
2. **验证驱动**: 每个任务完成后必须运行验证命令确认功能正常
3. **最小改动**: 只修改必要的文件，不做无关重构
4. **实时检查**: 每次修改后运行 `npm run build` 确认无编译错误

---

## 第一阶段：核心 MVP（已完成基础结构）

**目标**: 快速验证产品核心价值
**状态**: 基础结构已创建，需验证完整性和完善

### 1.1 项目初始化与构建配置

- [ ] **Task 1.1.1: 添加 package.json type 字段**
  - 修改 `package.json` 添加 `"type": "module"`
  - 验证: 运行 `npm run build` 无警告

- [ ] **Task 1.1.2: 创建 electron-builder.json**
  - 创建打包配置文件，设置 appId、productName、构建目标
  - 验证: 运行 `npm run electron:build:dir` 生成可执行文件

### 1.2 会话列表模块

- [ ] **Task 1.2.1: 验证 SessionList 组件**
  - 检查 `src/components/Sidebar.tsx` 是否实现会话列表
  - 检查是否支持搜索功能
  - 验证: 选择会话后右侧面板应显示聊天记录

- [ ] **Task 1.2.2: 完善 sessionStore**
  - 检查 `src/stores/sessionStore.ts` 是否正确调用 `window.electronAPI.wechat.getSessions`
  - 验证: 启动应用后应自动加载会话列表

### 1.3 聊天记录模块

- [ ] **Task 1.3.1: 验证 ChatHistory 组件**
  - 检查 `src/components/ChatHistory.tsx` 是否实现消息展示
  - 检查消息气泡样式是否区分自己/他人
  - 验证: 选择会话后应显示消息列表

- [ ] **Task 1.3.2: 完善 messageStore**
  - 检查 `src/stores/messageStore.ts` 是否正确调用 `window.electronAPI.wechat.getHistory`
  - 验证: 应支持加载更多历史消息

### 1.4 AI 摘要模块

- [ ] **Task 1.4.1: 验证 AISummary 组件**
  - 检查 `src/components/AISummary.tsx` 是否实现摘要生成
  - 检查是否支持 OpenAI/Claude 双模型
  - 验证: 配置 API Key 后点击生成摘要应返回结构化结果

- [ ] **Task 1.4.2: 完善 SettingsDialog**
  - 检查 `src/components/SettingsDialog.tsx` 是否实现 AI 配置保存
  - 验证: 保存配置后应持久化到 localStorage

### 1.5 第一阶段验收

- [ ] `npm run build` 编译成功
- [ ] `npm run electron:dev` 能启动应用
- [ ] 会话列表正确加载最近会话
- [ ] 点击会话显示对应聊天记录
- [ ] AI 摘要能正确生成并展示
- [ ] 错误提示友好（wechat-cli 未初始化时显示引导）

---

## 第二阶段：监控告警

**目标**: 实现实时监控能力

### 2.1 实时消息监控

- [ ] **Task 2.1.1: 添加 new-messages IPC 处理器**
  - 修改 `electron/main.ts` 添加 `wechat:new-messages` handler
  - 修改 `electron/preload.ts` 暴露 `getNewMessages` 方法
  - 验证: 调用 `window.electronAPI.wechat.getNewMessages()` 返回新消息

- [ ] **Task 2.1.2: 创建轮询服务**
  - 创建 `src/services/pollingService.ts`
  - 实现定时轮询机制（默认 30 秒间隔）
  - 实现增量消息获取逻辑
  - 验证: 监控新消息时控制台应打印新增消息

### 2.2 关键词监控配置

- [ ] **Task 2.2.1: 创建关键词配置界面**
  - 创建 `src/components/KeywordConfig.tsx`
  - 支持添加/删除关键词
  - 支持正则表达式开关
  - 验证: 保存关键词配置后应持久化

- [ ] **Task 2.2.2: 实现关键词匹配引擎**
  - 创建 `src/lib/keywordMatcher.ts`
  - 实现普通关键词匹配
  - 实现正则表达式匹配
  - 实现 AND/OR 组合逻辑
  - 验证: 配置关键词后能正确识别匹配消息

### 2.3 桌面通知

- [ ] **Task 2.3.1: 集成 Electron Notification API**
  - 修改 `electron/main.ts` 添加通知 handler
  - 创建 `src/services/notificationService.ts`
  - 验证: 调用通知 API 后桌面显示原生通知

- [ ] **Task 2.3.2: 实现通知管理组件**
  - 创建 `src/components/NotificationPanel.tsx`
  - 显示历史通知列表
  - 支持一键清空通知
  - 验证: 触发关键词后应显示通知，点击应跳转对应会话

### 2.4 静默时段

- [ ] **Task 2.4.1: 实现静默时段配置**
  - 在 `src/components/SettingsDialog.tsx` 添加静默时段设置
  - 支持设置开始/结束时间
  - 支持工作日/周末区分
  - 验证: 静默时段内不触发通知

### 2.5 第二阶段验收

- [ ] 能正确获取实时新消息
- [ ] 关键词监控能正确匹配消息
- [ ] 桌面通知正常弹出
- [ ] 静默时段功能正常

---

## 第三阶段：数据分析

**目标**: 提供数据驱动决策支持

### 3.1 消息统计分析

- [ ] **Task 3.1.1: 验证现有统计功能**
  - 检查 `electron/wechat/executor.ts` 中 `getStats` 方法
  - 检查 `electron/wechat/parser.ts` 中统计解析逻辑
  - 验证: 调用 `window.electronAPI.wechat.getStats()` 返回统计数据

- [ ] **Task 3.1.2: 完善统计数据结构**
  - 确保返回消息量趋势、活跃时段、发言排行等数据
  - 验证: 返回数据结构包含所有必需字段

### 3.2 数据看板组件

- [ ] **Task 3.2.1: 创建 Dashboard 组件**
  - 创建 `src/components/Dashboard.tsx`
  - 实现概览卡片（总消息数、活跃人数、峰值时段）
  - 实现趋势图表区域
  - 验证: 能正确展示统计数据

- [ ] **Task 3.2.2: 创建趋势图表组件**
  - 创建 `src/components/TrendChart.tsx`
  - 使用 recharts 或 chart.js 实现折线图
  - 显示近 7 天/30 天消息趋势
  - 验证: 图表正确渲染数据

### 3.3 活跃度分析

- [ ] **Task 3.3.1: 创建发言排行组件**
  - 创建 `src/components/ActivityLeaderboard.tsx`
  - 显示 Top N 活跃用户
  - 显示每用户消息数量
  - 验证: 正确展示排行数据

- [ ] **Task 3.3.2: 创建时段分布组件**
  - 创建 `src/components/TimeDistribution.tsx`
  - 显示 24 小时活跃分布
  - 使用柱状图或热力图展示
  - 验证: 正确展示时段分布

### 3.4 消息类型统计

- [ ] **Task 3.4.1: 实现消息类型分类**
  - 扩展 `electron/wechat/parser.ts` 解析消息类型
  - 区分文字/图片/链接/表情等
  - 验证: 统计数据包含消息类型分布

- [ ] **Task 3.4.2: 创建类型分布组件**
  - 创建 `src/components/MessageTypeChart.tsx`
  - 使用饼图或环形图展示
  - 验证: 正确展示各类型占比

### 3.5 第三阶段验收

- [ ] Dashboard 能展示统计数据
- [ ] 趋势图表正确渲染
- [ ] 发言排行功能正常
- [ ] 时段分布可视化完成
- [ ] 消息类型统计可用

---

## 第四阶段：高级功能

**目标**: 满足高阶用户定制化需求

### 4.1 全文搜索

- [ ] **Task 4.1.1: 验证搜索功能**
  - 检查 `electron/main.ts` 中 `wechat:search` handler
  - 检查 `electron/preload.ts` 中 `search` 方法
  - 验证: `window.electronAPI.wechat.search("关键词")` 返回搜索结果

- [ ] **Task 4.1.2: 创建搜索界面**
  - 修改 `src/components/Sidebar.tsx` 搜索框功能
  - 支持按会话筛选搜索结果
  - 高亮匹配关键词
  - 验证: 搜索结果正确显示

### 4.2 FAQ 提取

- [ ] **Task 4.2.1: 创建 FAQ 提取服务**
  - 创建 `src/services/faqService.ts`
  - 实现问答对自动识别逻辑
  - 利用 AI 辅助提取 FAQ
  - 验证: 能从聊天记录中提取问答对

- [ ] **Task 4.2.2: 创建 FAQ 展示组件**
  - 创建 `src/components/FAQPanel.tsx`
  - 展示提取的 FAQ 列表
  - 支持 FAQ 导出（JSON/Markdown）
  - 验证: 正确展示 FAQ 数据

### 4.3 Skill 系统

- [ ] **Task 4.3.1: 设计 Skill 配置格式**
  - 创建 `src/types/skill.ts` 定义 Skill 类型
  - 设计 YAML 配置格式
  - 验证: 能解析 Skill 配置文件

- [ ] **Task 4.3.2: 创建 Skill 管理器**
  - 创建 `src/services/skillManager.ts`
  - 实现 Skill 加载/解析/执行逻辑
  - 实现 Trigger 条件匹配
  - 实现 Action 执行机制
  - 验证: Skill 能正确响应触发条件

- [ ] **Task 4.3.3: 创建 Skill 配置界面**
  - 创建 `src/components/SkillManager.tsx`
  - 支持创建/编辑/删除 Skill
  - 支持启用/禁用 Skill
  - 验证: 能持久化 Skill 配置

- [ ] **Task 4.3.4: 实现内置 Actions**
  - 实现 `notify` action（桌面通知）
  - 实现 `ai_summary` action（AI 摘要）
  - 实现 `export` action（数据导出）
  - 验证: Actions 能正确执行

### 4.5 第四阶段验收

- [ ] 全文搜索功能正常
- [ ] FAQ 提取可用
- [ ] Skill 系统完整运行
- [ ] 至少一个自定义 Skill 能正常工作

---

## 附录：验证命令速查

```bash
# 编译检查
npm run build

# 开发模式运行
npm run electron:dev

# 构建打包
npm run electron:build

# TypeScript 类型检查
npx tsc --noEmit
```

---

## 附录：关键文件路径

| 模块 | 文件路径 |
|------|----------|
| Electron 主进程 | `electron/main.ts` |
| 预加载脚本 | `electron/preload.ts` |
| wechat-cli 封装 | `electron/wechat/executor.ts` |
| 结果解析器 | `electron/wechat/parser.ts` |
| 类型定义 | `electron/wechat/types.ts` |
| React 入口 | `src/main.tsx` |
| 根组件 | `src/App.tsx` |
| 会话列表 | `src/components/Sidebar.tsx` |
| 聊天记录 | `src/components/ChatHistory.tsx` |
| AI 摘要 | `src/components/AISummary.tsx` |
| 设置对话框 | `src/components/SettingsDialog.tsx` |
| 会话状态 | `src/stores/sessionStore.ts` |
| 消息状态 | `src/stores/messageStore.ts` |
| 配置状态 | `src/stores/configStore.ts` |
| AI 服务 | `src/services/aiService.ts` |
| 提示词模板 | `src/lib/prompts.ts` |
| 工具函数 | `src/lib/utils.ts` |

---

*计划书创建时间: 2026-05-12*
*执行状态: 待执行*
