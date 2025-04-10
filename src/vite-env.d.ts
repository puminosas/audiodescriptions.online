/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string;
  readonly VITE_SUPABASE_DB_URL: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_GOOGLE_APPLICATION_CREDENTIALS_JSON: string;
  readonly VITE_GCS_BUCKET_NAME: string;
  readonly VITE_GCS_PROJECT_ID: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_FLASK_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add this to the global Window interface
declare global {
  interface Window {
    env?: Record<string, string>;
  }
}
