# ChatSight

微信聊天记录分析工具，支持 AI 智能摘要

## 功能特性

- 📱 **会话管理** - 自动加载微信会话列表，支持群聊/私聊分类
- 💬 **聊天记录** - 查看任意会话的完整聊天记录
- 🤖 **AI 摘要** - 支持 OpenAI、Claude、MiniMax AI 智能分析聊天内容
- 🎨 **现代化 UI** - 简洁美观的界面设计

## 系统要求

- macOS 10.15 (Catalina) 或更高版本
- 已安装 [wechat-cli](https://github.com/wechat-cli/wechat-cli) 工具

## 安装

### 方式一：直接下载（推荐）

1. 从 [Releases](https://github.com/ttfake92-lab/ChatSight/releases) 页面下载最新版本
2. 解压 `ChatSight-0.1.0-x64.zip`
3. 双击运行 `ChatSight.app`

### 方式二：Homebrew 安装

```bash
# 添加 Tap（如果有）
brew tap ttfake92-lab/tap

# 安装
brew install --cask chatsight
```

### 方式三：使用 GitHub CLI

```bash
# 安装 GitHub CLI（如果未安装）
brew install gh

# 授权登录
gh auth login

# 下载最新 Release
gh release download v0.1.0 -p '*.zip'

# 解压并安装
unzip "ChatSight-*-x64.zip"
open "ChatSight.app"
```

### 方式四：从源码构建

#### 前置要求
- Node.js 18+
- npm 9+
- Xcode Command Line Tools

#### 构建步骤

```bash
# 克隆仓库
git clone https://github.com/ttfake92-lab/ChatSight.git
cd ChatSight

# 安装依赖
npm install

# 开发模式运行（调试用）
npm run electron:dev

# 构建 macOS 应用
npm run electron:build

# 或者构建安装包（DMG）
npm run electron:build -- --mac dmg
```

构建完成后：
- 应用位于 `release/mac/ChatSight.app`
- DMG 安装包位于 `release/ChatSight-*-x64.dmg`
- ZIP 压缩包位于 `release/ChatSight-*-x64.zip`

### 方式五：仅构建 ZIP（不生成 DMG）

如果只需要 ZIP 压缩包：

```bash
npm run electron:build -- --mac zip
```

构建产物会输出到 `release/` 目录

## 前置要求

### 安装 wechat-cli

ChatSight 需要依赖 [wechat-cli](https://github.com/wechat-cli/wechat-cli) 来读取微信数据。

```bash
# 使用 npm 安装
npm install -g wechat-cli

# 或使用 pip 安装
pip install wechat-cli

# 初始化（首次使用需要）
wechat-cli init
```

**注意**：请确保 wechat-cli 已正确安装并完成初始化，否则应用无法读取聊天记录。

## 使用说明

### 1. 启动应用

运行 `ChatSight.app`，首次启动会显示主界面。

### 2. 配置 AI 服务（可选）

如果需要使用 AI 摘要功能，需要配置 AI API：

1. 点击右上角 ⚙️ 设置按钮
2. 选择 AI 提供商（支持 OpenAI / Claude / MiniMax）
3. 输入你的 API Key
4. 点击保存

### 3. 浏览会话

- 左侧面板显示所有微信会话
- 支持搜索过滤
- 点击会话查看聊天记录

### 4. AI 摘要分析

选择一个会话后，点击"生成摘要"按钮，AI 将自动分析聊天内容并生成：

- 今日概览（总消息数、活跃用户、活跃时段）
- 核心话题
- 重要观点
- 常见问题
- 待跟进事项
- 趋势洞察

## 配置说明

### 环境变量

可以通过 `.env` 文件配置默认参数：

```env
VITE_API_BASE_URL=https://api.minimaxi.com/v1
VITE_DEFAULT_MODEL=MiniMax-M2.7-highspeed
```

### AI 提供商配置

#### OpenAI

- API Endpoint: `https://api.openai.com/v1`
- 推荐模型: `gpt-4`

#### Claude

- API Endpoint: `https://api.anthropic.com/v1`
- 推荐模型: `claude-3-sonnet-20240229`

#### MiniMax

- API Endpoint: `https://api.minimaxi.com/v1`
- 推荐模型: `MiniMax-M2.7-highspeed`

## 常见问题

### Q: 提示"Electron API 未初始化"

这是因为你在浏览器中直接打开了网页。ChatSight 需要在 Electron 环境中运行。请下载编译好的应用，或使用 `npm run electron:dev` 启动。

### Q: 无法加载会话列表

1. 确保已安装 wechat-cli
2. 确保 wechat-cli 已完成初始化（运行 `wechat-cli init`）
3. 确保 wechat-cli 可以正常执行 `wechat-cli sessions` 命令

### Q: AI 摘要功能不工作

1. 检查是否已配置 API Key
2. 确认 API Key 有效且有足够配额
3. 检查网络连接是否正常

## 技术栈

- **前端**: React 18 + TypeScript + TailwindCSS
- **桌面框架**: Electron 28
- **状态管理**: Zustand
- **构建工具**: Vite + electron-builder

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run electron:dev

# 构建生产版本
npm run electron:build
```

## 版本历史

### v0.2.0 (2026-05-15)

- 🛡️ **API Key 安全加密** - 使用 Electron safeStorage 加密存储 API Key，防止 XSS 泄露
- 🧱 **Error Boundary** - 新增全局错误边界，组件崩溃不再白屏，提供降级 UI 和一键刷新
- ⚡ **请求取消机制** - AI 摘要生成支持 AbortController，切换会话自动取消未完成的请求
- 🔄 **PollingService 重构** - 模块级单例改为 Class + React Context，热重载状态正确重置
- 🔧 **构建系统优化** - 改用 esbuild 编译 Electron 主进程，解决 ESM/CJS 模块兼容问题

### v0.1.0 (2026-05-11)

- ✨ 初始版本发布
- 📱 会话列表加载
- 💬 聊天记录查看
- 🤖 AI 摘要功能（支持 OpenAI / Claude / MiniMax）
- 🔍 会话搜索过滤

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
