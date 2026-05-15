import React, { createContext, useContext, useRef } from 'react'
import { PollingService } from '../services/pollingService'

const PollingContext = createContext<PollingService | null>(null)

export function PollingProvider({ children }: { children: React.ReactNode }) {
  const serviceRef = useRef(new PollingService())
  return (
    <PollingContext.Provider value={serviceRef.current}>
      {children}
    </PollingContext.Provider>
  )
}

export function usePolling(): PollingService {
  const context = useContext(PollingContext)
  if (!context) {
    throw new Error('usePolling must be used within a PollingProvider')
  }
  return context
}
