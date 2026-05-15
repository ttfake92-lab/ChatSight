import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PollingProvider } from './contexts/PollingContext'
import './index.css'
import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <PollingProvider>
        <App />
      </PollingProvider>
    </ErrorBoundary>
    <Toaster />
  </React.StrictMode>,
)
