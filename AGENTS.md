# 行为准则

旨在减少大语言模型常见编码错误的行为准则。按需与项目特定说明合并使用。

**权衡取舍：** 这些准则偏向谨慎而非速度。对于简单任务，可自行判断。

## 1. 先思考，再编码

**不要臆断。不要掩饰困惑。把权衡取舍摆到明面上。**

开始实现之前：

- 明确陈述你的假设。如果不确定，就询问。
- 如果存在多种解读，把它们都列出来——不要默不作声地选择一种。
- 如果存在更简单的方法，就说出来。在理由充分时坚持己见。
- 如果有不清楚的地方，停下来。指出让你困惑的点。然后询问。

## 2. 简单至上

**用最少的代码解决问题。不写任何推测性代码。**

- 不添加要求之外的功能。
- 不为仅使用一次的代码创建抽象。
- 不添加未被要求的"灵活性"或"可配置性"。
- 不为不可能出现的场景做错误处理。
- 如果你写了 200 行代码，但 50 行就能搞定，那就重写。

扪心自问："资深工程师会觉得这过于复杂吗？"如果答案是肯定的，就简化它。

## 3. 外科手术式修改

**只动必须动的地方。只收拾自己造成的烂摊子。**

编辑现有代码时：

- 不要"顺手改善"相邻的代码、注释或格式。
- 不要重构那些没出问题的部分。
- 匹配现有的代码风格，即使你更倾向于另一种写法。
- 如果你发现了无关的无效代码，提出来就行——不要直接删除。

当你的改动造成了孤立代码时：

- 移除因**你**的改动而变得不再使用的导入、变量或函数。
- 除非被要求，否则不要删除原本就存在的无效代码。

检验标准：每一处被改动的行，都应能直接追溯到用户的需求。

## 4. 目标驱动的执行

**定义成功标准。循环验证直至通过。**

将任务转化为可验证的目标：

- "添加验证功能" → "为无效输入编写测试，然后让测试通过"
- "修复这个 bug" → "编写一个能复现该 bug 的测试，然后让测试通过"
- "重构 X" → "确保测试在重构前后都能通过"

对于多步骤任务，陈述一个简要的计划：

```
1. [步骤] → 验证：[检查点]
2. [步骤] → 验证：[检查点]
3. [步骤] → 验证：[检查点]
```

强有力的成功标准能让你独立地进行循环迭代。薄弱的标准（比如"把它搞出来就行"）则需要不断地澄清。

***

**当满足以下情况时，这些准则才算奏效：** 差异对比中的不必要改动更少了，因过度复杂化导致的重写更少了，以及澄清性质的问题是在实现之前、而非在犯错之后才提出的。

---

## 项目特定约定（ChatSight）

### Electron 构建流程

本项目使用 **esbuild** 编译 Electron 主进程和 preload 脚本，而非 `vite-plugin-electron`。

- **主进程入口**: `dist-electron/main.cjs`（CJS 格式）
- **Preload 脚本**: `dist-electron/preload.cjs`（CJS 格式）
- **构建命令**: `npm run electron:build-main`
  - 使用 esbuild 将 `electron/main.ts` 和 `electron/preload.ts` 分别打包为 CJS
  - `--external:electron` 排除 electron 模块
- **开发启动**: `npm run electron:dev`
  - 先执行 `electron:build-main`
  - 然后并行启动 Vite dev server（port 5180）和 Electron
  - **必须** 前缀 `ELECTRON_RUN_AS_NODE=` 环境变量（置空），防止 VSCode 继承该变量导致 `require('electron')` 返回二进制路径

**为什么不用 vite-plugin-electron**: 该插件在 `package.json` `"type": "module"` 时会将 preload 编译为 ESM（`import` 语法），但 Electron 通过 `require()` 加载 preload，导致模块系统不匹配。esbuild 直接编译为 CJS 规避了这个问题。

### IPC 通信规范

所有 IPC 调用通过 `window.electronAPI` 暴露：

- `window.electronAPI.wechat.*` — wechat-cli 相关（sessions, history, search, stats, contacts, new-messages）
- `window.electronAPI.notification.show()` — 桌面通知
- `window.electronAPI.safeStorage.encrypt/decrypt()` — API Key 加密（使用 Electron safeStorage）

返回格式统一为 `{ data?, error?, code? }`。调用方需检查 `result.error`。

### API Key 安全存储

`src/stores/configStore.ts` 的 `loadConfig`/`saveConfig` 已改为 **async**，通过 IPC 调用 `safeStorage.encrypt/decrypt`：

- 保存时：明文 apiKey → IPC encrypt → base64 密文 → localStorage
- 读取时：localStorage 密文 → IPC decrypt → 明文 apiKey
- 向后兼容：解密失败时保持原值（视为明文旧数据）

### 新增文件位置

- 全局 React Context: `src/contexts/`（如 `PollingContext.tsx`）
- Error Boundary: `src/components/ErrorBoundary.tsx`
- 服务类: `src/services/`（保持单例模式，但优先通过 Context 注入）
