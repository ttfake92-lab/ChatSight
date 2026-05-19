import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  handleRetry = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-card rounded-lg shadow-lg border max-w-md w-full p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">出错了</h2>
            <p className="text-sm text-muted-foreground mb-4">
              应用遇到了意外错误，请尝试刷新页面恢复。
            </p>
            {this.state.error && (
              <div className="bg-muted rounded-md p-3 mb-6 text-left">
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button onClick={this.handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新页面
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
