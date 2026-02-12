import { ChatKit, useChatKit } from '@openai/chatkit-react';

const CHATKIT_WORKFLOW_ID = import.meta.env.VITE_CHATKIT_WORKFLOW_ID;
const API_BASE = import.meta.env.VITE_API_URL_CHATKIT || '/api';

export default function ChatbotPage() {
  const chatkit = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch(`${API_BASE}/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflow_id: CHATKIT_WORKFLOW_ID }),
        });

        if (!res.ok) {
          throw new Error(`Failed to create session: ${res.status}`);
        }

        const data = await res.json();
        return data.client_secret?.value ?? data.client_secret;
      },
    },
    composer: {
      attachments: { enabled: false },
    },
  });

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chatbot</h1>
          <p className="mt-1 text-muted-foreground">
            Chat with an AI assistant.
          </p>
        </div>

        <div className="relative flex h-[calc(100vh-12rem)] w-full rounded-2xl flex-col overflow-hidden border bg-card shadow-sm">
          <ChatKit control={chatkit.control} className="block h-full w-full" />
        </div>
      </div>
    </>
  );
}
