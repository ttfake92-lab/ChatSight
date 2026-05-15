import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { formatNumber, getPeakHour, getTopMembers, calculateEngagementRate } from '../lib/dashboardUtils'
import { DashboardStats } from '../lib/dashboardUtils'
import { Loader2, MessageSquare, Users, TrendingUp, Clock, Activity } from 'lucide-react'

interface DashboardProps {
  stats?: DashboardStats
  isLoading?: boolean
  error?: string
  onRefresh?: () => void
}

export function Dashboard({ stats, isLoading, error, onRefresh }: DashboardProps) {
  const defaultStats: DashboardStats = {
    totalMessages: 0,
    totalMembers: 0,
    activeMembers: [],
    messageTypes: [],
    messageTrend: [],
    hourlyDistribution: []
  }

  const displayStats = stats || defaultStats
  const peakHour = getPeakHour(displayStats.hourlyDistribution)
  const topMembers = getTopMembers(displayStats.activeMembers, 5)
  const engagementRate = calculateEngagementRate(displayStats)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">数据看板</h2>
        <button
          onClick={onRefresh}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总消息数"
          value={formatNumber(displayStats.totalMessages)}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <StatCard
          title="活跃成员"
          value={formatNumber(displayStats.totalMembers)}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="峰值时段"
          value={peakHour !== null ? `${peakHour}:00` : '-'}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="人均消息"
          value={engagementRate > 0 ? engagementRate.toString() : '-'}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              消息趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayStats.messageTrend && displayStats.messageTrend.length > 0 ? (
              <MiniTrendChart data={displayStats.messageTrend} />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                暂无趋势数据
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              活跃排行
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topMembers.length > 0 ? (
              <div className="space-y-3">
                {topMembers.map((member, index) => (
                  <div key={member.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate">{member.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {formatNumber(member.messageCount)} 条
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                暂无排行数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              时段分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayStats.hourlyDistribution && displayStats.hourlyDistribution.length > 0 ? (
              <MiniHourlyChart data={displayStats.hourlyDistribution} />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                暂无时段数据
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              消息类型
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayStats.messageTypes.length > 0 ? (
              <div className="space-y-2">
                {displayStats.messageTypes.map((type) => (
                  <div key={type.type} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-muted-foreground capitalize">
                      {type.type}
                    </span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${Math.min(100, (type.count / Math.max(1, displayStats.totalMessages)) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm w-16 text-right">
                      {formatNumber(type.count)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                暂无类型数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MiniTrendChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data || data.length === 0) return null

  const maxCount = Math.max(...data.map(d => d.count))
  const width = 100
  const height = 100
  const padding = 10

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((d.count / maxCount) * (height - padding * 2))
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="h-40">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        {data.map((d, i) => {
          const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2)
          return (
            <circle
              key={i}
              cx={x}
              cy={height - padding - ((d.count / maxCount) * (height - padding * 2))}
              r="2"
              fill="currentColor"
              className="text-primary"
            />
          )
        })}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

function MiniHourlyChart({ data }: { data: { hour: number; count: number }[] }) {
  if (!data || data.length === 0) return null

  const maxCount = Math.max(...data.map(d => d.count))
  const width = 100
  const height = 100
  const padding = 5
  const barWidth = (width - padding * 2) / 24

  return (
    <div className="h-40">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {Array.from({ length: 24 }, (_, hour) => {
          const item = data.find(d => d.hour === hour)
          const count = item?.count || 0
          const barHeight = count > 0 ? (count / maxCount) * (height - padding * 2) : 0
          const x = padding + hour * barWidth
          const y = height - padding - barHeight

          return (
            <rect
              key={hour}
              x={x}
              y={y}
              width={barWidth - 1}
              height={barHeight}
              fill="currentColor"
              className="text-primary"
              rx="1"
            />
          )
        })}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>0:00</span>
        <span>12:00</span>
        <span>23:00</span>
      </div>
    </div>
  )
}
