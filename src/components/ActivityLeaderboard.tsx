import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Users, Trophy } from 'lucide-react'
import { formatNumber } from '../lib/dashboardUtils'

interface MemberStats {
  name: string
  messageCount: number
}

interface ActivityLeaderboardProps {
  members?: MemberStats[]
  limit?: number
}

export function ActivityLeaderboard({ members = [], limit = 10 }: ActivityLeaderboardProps) {
  const sortedMembers = [...members]
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, limit)

  const hasData = sortedMembers.length > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          活跃排行
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-3">
            {sortedMembers.map((member, index) => (
              <div key={member.name} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === 0
                      ? 'bg-yellow-500/20 text-yellow-600'
                      : index === 1
                      ? 'bg-gray-400/20 text-gray-600'
                      : index === 2
                      ? 'bg-orange-400/20 text-orange-600'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
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
          <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
            <Users className="h-8 w-8 mb-2 opacity-50" />
            <span>暂无排行数据</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
