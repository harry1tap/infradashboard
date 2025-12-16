interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_N8N_MCP_URL: string
  readonly VITE_N8N_MCP_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
