/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_PROJECT_ID: string;
  readonly VITE_VOICE_AGENT_ID: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_CHATKIT_API_URL: string;
  readonly VITE_CHATKIT_API_DOMAIN_KEY: string;
  readonly VITE_CHATKIT_WORKFLOW_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
