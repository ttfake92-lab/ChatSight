import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { MessageSquare } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'
import { formatNumber } from '../lib/dashboardUtils'

interface MessageTypeData {
  type: string
  count: number
}

interface MessageTypeChartProps {
  data?: MessageTypeData[]
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

const TYPE_LABELS: Record<string, string> = {
  text: '文字',
  image: '图片',
  video: '视频',
  voice: '语音',
  emoji: '表情',
  file: '文件',
  link: '链接',
  location: '位置',
}

export function MessageTypeChart({ data = [] }: MessageTypeChartProps) {
  const hasData = data && data.length > 0

  const chartData = data.map(item => ({
    name: TYPE_LABELS[item.type] || item.type,
    value: item.count,
    originalType: item.type
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          消息类型
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value) => [`${formatNumber(value as number)} 条`, '消息数']}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            暂无类型数据
          </div>
        )}
      </CardContent>
    </Card>
  )
}
