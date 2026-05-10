import type { Message } from '../types'

export const SUMMARY_PROMPT_TEMPLATE = `你是一位专业的微信群运营分析师，擅长从群聊消息中提取有价值的信息和洞察。

请分析以下微信群聊天记录，生成一份结构化的摘要报告。

## 分析维度

1. **今日概览** 📊
   - 消息总数
   - 活跃用户数
   - 高峰时段
   - 整体趋势（增长/下降/平稳）

2. **核心话题** 🔥
   - 列出最热门的话题
   - 每个话题的热度等级（高/中/低）
   - 相关消息数量

3. **重要观点** 💡
   - 建设性建议
   - 达成的共识
   - 存在的争议或分歧

4. **常见问题** ❓
   - 重复出现的问题
   - 已有答案的问题
   - 待解答的问题

5. **待跟进事项** 📋
   - 明确的任务或行动项
   - 优先级（高/中/低）
   - 负责人（如有）

6. **趋势洞察** 📈
   - 发现的机会
   - 潜在风险
   - 未来趋势预测

## 输出格式要求

请严格按照以下 JSON 格式输出，不要包含任何其他内容：

{
  "overview": {
    "totalMessages": 数字,
    "activeUsers": 数字,
    "peakHours": ["时间1", "时间2"],
    "trend": "增长/下降/平稳"
  },
  "topics": [
    {
      "topic": "话题名称",
      "heat": "high/medium/low",
      "count": 数字
    }
  ],
  "keyPoints": [
    {
      "type": "suggestion/consensus/dispute",
      "content": "观点内容",
      "author": "发言者（可选）"
    }
  ],
  "faqs": [
    {
      "question": "问题",
      "answer": "答案（可选）"
    }
  ],
  "actionItems": [
    {
      "content": "待办事项",
      "priority": "high/medium/low",
      "assignTo": "负责人（可选）"
    }
  ],
  "insights": [
    {
      "content": "洞察内容",
      "type": "opportunity/risk/trend"
    }
  ]
}

## 重要提示

1. 所有内容必须使用中文
2. 关键信息使用 emoji 标注（已在维度标题中使用）
3. 总字数控制在 500 字以内
4. JSON 格式必须严格正确，可以被 JSON.parse 解析
5. 如果某些维度没有相关信息，返回空数组或适当的默认值
6. 只输出 JSON，不要输出任何解释或说明文字

## 待分析的聊天记录

{ messages }

请开始分析并输出 JSON 格式的摘要报告。`

export function buildSummaryPrompt(messages: Message[]): string {
  const formattedMessages = messages.map(msg => {
    const time = new Date(msg.timestamp).toLocaleString('zh-CN')
    const sender = msg.isSelf ? '我' : msg.sender
    return `[${time}] ${sender}: ${msg.content}`
  }).join('\n\n')

  return SUMMARY_PROMPT_TEMPLATE.replace('{ messages }', formattedMessages)
}

export function buildCustomPrompt(
  messages: Message[],
  customInstructions: string
): string {
  const basePrompt = buildSummaryPrompt(messages)
  return `${basePrompt}\n\n## 自定义分析要求\n\n${customInstructions}\n\n请在上述基础上，结合自定义要求生成分析报告。`
}
