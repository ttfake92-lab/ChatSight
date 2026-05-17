/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_DEV_SERVER_PORT: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_DEFAULT_PROVIDER?: 'openai' | 'claude' | 'local'
  readonly VITE_DEFAULT_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
