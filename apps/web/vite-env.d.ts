/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_PROJECT_ID: string;
  readonly VITE_VOICE_AGENT_ID: string;
  readonly VITE_CHATKIT_WORKFLOW_ID: string;
  readonly VITE_API_URL_CHATKIT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
