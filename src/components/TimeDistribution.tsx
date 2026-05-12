import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Clock } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'

interface HourlyData {
  hour: number
  count: number
}

interface TimeDistributionProps {
  data?: HourlyData[]
}

export function TimeDistribution({ data = [] }: TimeDistributionProps) {
  const hasData = data && data.length > 0

  const formatHour = (hour: number) => {
    if (hour === 0) return '0点'
    if (hour === 12) return '12点'
    if (hour === 23) return '23点'
    if (hour % 6 === 0) return `${hour}点`
    return ''
  }

  const chartData = Array.from({ length: 24 }, (_, hour) => {
    const item = data.find(d => d.hour === hour)
    return {
      hour: hour,
      hourLabel: formatHour(hour),
      count: item?.count || 0
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          时段分布
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatHour(value)}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                  labelFormatter={(value) => `${value}:00`}
                  formatter={(value) => [`${value} 条`, '消息数']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.hour >= 9 && entry.hour <= 22
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            暂无时段数据
          </div>
        )}
      </CardContent>
    </Card>
  )
}
