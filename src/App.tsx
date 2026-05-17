import { useEffect, useState, useRef } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ChatHistory } from './components/ChatHistory'
import { AISummary } from './components/AISummary'
import { FAQPanel } from './components/FAQPanel'
import { SkillManager } from './components/SkillManager'
import { SettingsDialog } from './components/SettingsDialog'
import { Button } from './components/ui/button'
import { useConfigStore } from './stores/configStore'
import { useSessionStore } from './stores/sessionStore'
import { useMessageStore } from './stores/messageStore'
import { useSkillStore } from './stores/skillStore'
import { useInitStore } from './stores/initStore'
import { useSummaryStore } from './stores/summaryStore'
import { useSystemTheme } from './hooks/useSystemTheme'
import { usePolling } from './contexts/PollingContext'
import { SkillManager as SkillManagerService } from './services/skillManager'
import { Sparkles, MessageSquare, Settings, RefreshCw } from 'lucide-react'
import type { Message } from './types'

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'summary' | 'faq' | 'skills'>('summary')
  const skillManagerRef = useRef<SkillManagerService | null>(null)
  const pollingService = usePolling()

  useSystemTheme()

  const { loadConfig } = useConfigStore()
  const { fetchSessions } = useSessionStore()
  const { fetchHistory, messages, appendMessages } = useMessageStore()
  const { selectedSession } = useSessionStore()
  const { skills, loadSkills } = useSkillStore()
  const { status: initStatus, error: initError, fetchStatus, retry } = useInitStore()
  const { loadSummaries } = useSummaryStore()

  useEffect(() => {
    loadConfig()
    loadSkills()
    loadSummaries()
    fetchStatus()
  }, [loadConfig, loadSkills, loadSummaries, fetchStatus])

  useEffect(() => {
    if (initStatus === 'ready') {
      fetchSessions()
    }
  }, [initStatus, fetchSessions])

  useEffect(() => {
    if (!skillManagerRef.current) {
      skillManagerRef.current = new SkillManagerService()
    }
    skillManagerRef.current.setSkills(skills)
  }, [skills])

  useEffect(() => {
    if (initStatus !== 'ready') return

    const handleNewMessages = (newMessages: Message[]) => {
      appendMessages(newMessages)
      if (selectedSession && skillManagerRef.current) {
        newMessages.forEach(msg => {
          skillManagerRef.current!.processMessage(msg, selectedSession.name)
        })
      }
    }

    pollingService.startPolling({ onMessages: handleNewMessages })

    return () => {
      pollingService.stopPolling()
    }
  }, [initStatus, selectedSession, appendMessages, pollingService])

  useEffect(() => {
    if (initStatus === 'ready' && selectedSession) {
      fetchHistory(selectedSession.name)
    }
  }, [initStatus, selectedSession, fetchHistory])

  const handleRefresh = async () => {
    if (initStatus !== 'ready') return
    setIsRefreshing(true)
    try {
      await fetchSessions()
      if (selectedSession) {
        await fetchHistory(selectedSession.name)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  if (initStatus === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold mb-2">初始化失败</h1>
          <p className="text-muted-foreground mb-4">{initError || '未知错误'}</p>
          <Button onClick={retry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>
        </div>
      </div>
    )
  }

  if (initStatus === 'initializing' || initStatus === 'idle') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在初始化...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onRefresh={handleRefresh}
        onSettings={() => setShowSettings(true)}
        isRefreshing={isRefreshing}
      />
      <div className="container mx-auto max-w-7xl py-6 px-4">
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          <aside className="w-80 flex-shrink-0">
            <div className="bg-card rounded-lg shadow-sm border h-full overflow-hidden">
              <Sidebar />
            </div>
          </aside>

          <main className="flex-1 flex gap-6 min-w-0">
            <div className="flex-1 bg-card rounded-lg shadow-sm border overflow-hidden">
              <ChatHistory />
            </div>

            <div className="w-96 flex-shrink-0">
              <div className="bg-card rounded-lg shadow-sm border h-full overflow-hidden flex flex-col">
                {/* Tab buttons */}
                <div className="flex border-b">
                  <Button
                    variant={activeTab === 'summary' ? 'default' : 'ghost'}
                    className="flex-1 rounded-none"
                    onClick={() => setActiveTab('summary')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI 摘要
                  </Button>
                  <Button
                    variant={activeTab === 'faq' ? 'default' : 'ghost'}
                    className="flex-1 rounded-none"
                    onClick={() => setActiveTab('faq')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    FAQ
                  </Button>
                  <Button
                    variant={activeTab === 'skills' ? 'default' : 'ghost'}
                    className="flex-1 rounded-none"
                    onClick={() => setActiveTab('skills')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Skills
                  </Button>
                </div>
                {/* Tab content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'summary' ? (
                    <AISummary />
                  ) : activeTab === 'faq' ? (
                    selectedSession ? (
                      <FAQPanel sessionName={selectedSession.name} messages={messages} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        请选择一个会话
                      </div>
                    )
                  ) : (
                    <div className="p-4 overflow-y-auto h-full">
                      <SkillManager />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}

export default App
