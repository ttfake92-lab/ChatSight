import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ChatHistory } from './components/ChatHistory'
import { AISummary } from './components/AISummary'
import { SettingsDialog } from './components/SettingsDialog'
import { Toaster } from './components/ui/sonner'
import { useConfigStore } from './stores/configStore'
import { useSessionStore } from './stores/sessionStore'
import { useMessageStore } from './stores/messageStore'

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { loadConfig } = useConfigStore()
  const { fetchSessions } = useSessionStore()
  const { fetchHistory } = useMessageStore()
  const { selectedSession } = useSessionStore()

  useEffect(() => {
    loadConfig()
    fetchSessions()
  }, [loadConfig, fetchSessions])

  useEffect(() => {
    if (selectedSession) {
      fetchHistory(selectedSession.name)
    }
  }, [selectedSession, fetchHistory])

  const handleRefresh = async () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <div className="bg-card rounded-lg shadow-sm border h-full overflow-hidden">
                <AISummary />
              </div>
            </div>
          </main>
        </div>
      </div>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <Toaster />
    </div>
  )
}

export default App
