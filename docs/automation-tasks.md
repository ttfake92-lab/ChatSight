# Automation Tasks

> 自动化任务入口配置
> 详细状态跟踪请查看 `docs/AUTOMATION_STATE.md`

---

## 自动化任务 Prompt

```
在 /Users/tangtao/Projects/ChatSight 里按 docs/superpowers/plans/2026-05-12-chatsight-full-implementation.md 推进项目。
先读取 AGENTS.md、docs/AUTOMATION_STATE.md、docs/superpowers/specs/2026-05-10-chatsight-design.md、当前 active issue 和当前 git status。
必须以 docs/AUTOMATION_STATE.md 里的 Current Active Task / Current Active Issue / Next Action 作为续跑锚点，不要每次从计划开头重新开始。
严格遵守顺序：先处理当前测试失败和 dirty worktree，再进入 Phase 1 实现。
每次只推进一个可验证小 slice；优先写测试，运行相关测试和 typecheck。
每次结束前必须更新 docs/AUTOMATION_STATE.md：写明完成了什么、当前 active task 是否完成、下一次从哪里继续、验证结果和 blocker。
不要 revert 用户未明确要求回退的改动。
结束时用中文汇报：完成了什么、改了哪些文件、验证结果、下一次应该从哪里继续。

## 执行配置

- **处理范围**: docs/automation-tasks.md 中标记的任务（优先高优先级）
- **执行方式**: 分析并直接实施代码
- **代码提交**: 自动 commit + push 到当前分支
- **状态更新**: 按进度更新 issue 状态
- **错误处理**: 重试 2-3 次，仍失败则跳过并记录到 blockers
```

---

## 依赖文件

- **Roadmap**: `docs/superpowers/plans/2026-05-12-chatsight-full-implementation.md`
- **PRD**: `docs/superpowers/specs/2026-05-10-chatsight-design.md`
- **AGENTS**: `AGENTS.md` (如存在)
- **状态文件**: `docs/AUTOMATION_STATE.md`

---

## 阶段概览

| Phase | 名称 | 目标 |
|-------|------|------|
| Phase 1 | 核心 MVP | 会话列表、聊天记录、AI 摘要 |
| Phase 2 | 监控告警 | 实时监控、关键词告警、桌面通知 |
| Phase 3 | 数据分析 | 消息统计、活跃度分析、数据看板 |
| Phase 4 | 高级功能 | 全文搜索、FAQ 提取、Skill 系统 |

---

## 验证命令

```bash
npm run build          # 编译检查
npm run electron:dev   # 开发模式运行
npx tsc --noEmit       # TypeScript 类型检查
```

---

## 说明

1. **状态跟踪**: 所有进度记录在 `docs/AUTOMATION_STATE.md`
2. **任务锚点**: 每次执行以上一个 `Next Action` 为起点
3. **验证优先**: 每次改动后运行测试和 typecheck
4. **自动提交**: 每次成功后自动 commit + push 到当前分支
5. **通知策略**: 每次执行完通知执行结果
