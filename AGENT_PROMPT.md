# SBM Client Demo App - Build Instructions

## Overview

Build a React + Vite application for a client demo that has three main features:

1. **Voice Agent** - A web-based voice agent powered by the Hamsa Voice SDK
2. **Chatbot** - A text chatbot using OpenAI's ChatKit (React components)
3. **Call History** - A full call history page showing all past voice calls with transcription, outcome, and details (code already extracted in `src/features/call-history/`)

The app should be clean, modern, and demo-ready with a professional UI using **shadcn/ui** and **Tailwind CSS**.

---

## Tech Stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** for UI components
- **React Router v7** for routing
- **TanStack React Query** for server state management
- **Zustand** for client state (project store already in `src/stores/`)
- **react-i18next** for internationalization (English only is fine for demo)
- **Axios** for API calls
- **@hamsa-ai/voice-agents-sdk** for the voice agent
- **@openai/chatkit** for the chatbot UI

---

## Project Structure

```
src/
├── app/
│   ├── App.tsx                    # Root app with providers
│   ├── routes/
│   │   └── app/
│   │       ├── index.tsx          # Home/dashboard page
│   │       ├── voice-agent.tsx    # Voice agent page
│   │       ├── chatbot.tsx        # Chatbot page
│   │       └── call-history.tsx   # Already extracted (needs adaptation)
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── call-details/              # Already extracted (call detail drawer)
│   ├── data-table/                # Need to create (used by call history)
│   ├── layout/                    # App layout (sidebar, header)
│   └── seo/                       # Head component for page titles
├── features/
│   ├── call-history/              # Already extracted - full feature
│   ├── voice-agent/               # Voice agent feature
│   └── chatbot/                   # Chatbot feature
├── hooks/
│   ├── use-data-table.ts          # Table hook (needed by call history)
│   └── use-is-rtl.ts             # RTL detection hook
├── lib/
│   ├── api-client.ts             # Axios client for Hamsa API
│   ├── auth.ts                   # Simple auth (hardcoded project credentials for demo)
│   ├── i18n.ts                   # i18n setup
│   └── parsers.ts                # URL state parsers (for nuqs)
├── stores/
│   └── project.store.ts          # Already extracted
├── types/
│   └── logs.types.ts             # Already extracted
├── utils/
│   ├── cn.ts                     # className utility (clsx + tailwind-merge)
│   └── csv-export.ts             # Excel export utility
└── config/
    └── paths.ts                  # Route path definitions
```

---

## Feature 1: Voice Agent Page

### Pre-extracted Hook

A React hook is already extracted at `src/features/voice-agent/hooks/use-voice-agent.ts`. It wraps the Hamsa Voice SDK with React state management, mic mute controls, and event callbacks.

**Usage of the extracted hook:**
```tsx
import { useVoiceAgent } from '@/features/voice-agent/hooks/use-voice-agent';

function VoiceAgentPage() {
  const [transcriptions, setTranscriptions] = useState<{ speaker: string; text: string }[]>([]);

  const {
    status,       // 'idle' | 'connecting' | 'speaking' | 'listening'
    micMuted,     // boolean
    startAgent,   // () => Promise<void>
    stopAgent,    // () => void
    toggleMicMute, // () => void
    getJobId,     // () => string | null
  } = useVoiceAgent({
    agentId: import.meta.env.VITE_VOICE_AGENT_ID,
    onCallStarted: (jobId) => {
      console.log('Call started:', jobId);
      setTranscriptions([]);
    },
    onCallEnded: () => console.log('Call ended'),
    onTranscriptionReceived: (text) => {
      setTranscriptions(prev => [...prev, { speaker: 'User', text }]);
    },
    onAnswerReceived: (text) => {
      setTranscriptions(prev => [...prev, { speaker: 'Agent', text }]);
    },
    onError: (err) => console.error('Voice agent error:', err),
  });

  return (
    // Build UI using status, startAgent, stopAgent, etc.
  );
}
```

The hook reads the API key from the project store (`useProjectStore`) or accepts one via props. It connects to the Hamsa API URL from `VITE_HAMSA_API_URL` env var.

### SDK Package

```bash
npm install @hamsa-ai/voice-agents-sdk
```

### Voice Agent Page UI

The page should have a nice card-based UI with:
- Agent info section (name, description)
- Call controls (start/stop button with animated status indicator)
- Mic mute/unmute toggle button
- Live transcription panel that shows the conversation in real-time (user speech + agent responses)
- Status indicator showing: idle, connecting, listening, speaking

### Hamsa Voice Agents SDK Reference

The SDK package is `@hamsa-ai/voice-agents-sdk`. Import:
```typescript
import { HamsaVoiceAgent } from '@hamsa-ai/voice-agents-sdk';
```

Initialize:
```typescript
const agent = new HamsaVoiceAgent(API_KEY, {
  API_URL: 'https://api.tryhamsa.com', // optional, defaults to production
});
```

Start a call:
```typescript
agent.start({
  agentId: 'YOUR_AGENT_ID',
  params: { name: 'John' },     // optional template params
  voiceEnablement: true,
  userId: 'user-123',           // optional user tracking
});
```

Key events:
```typescript
agent.on('callStarted', ({ jobId }) => { /* call started */ });
agent.on('callEnded', () => { /* call ended */ });
agent.on('speaking', () => { /* agent is speaking */ });
agent.on('listening', () => { /* agent is listening */ });
agent.on('agentStateChanged', (state) => { /* idle|initializing|listening|thinking|speaking */ });
agent.on('transcriptionReceived', (text) => { /* user speech text */ });
agent.on('answerReceived', (text) => { /* agent response text */ });
agent.on('error', (e) => { /* error */ });
agent.on('closed', () => { /* connection closed */ });
agent.on('micMuted', () => { /* mic muted */ });
agent.on('micUnmuted', () => { /* mic unmuted */ });
```

Controls:
```typescript
agent.end();                    // End the call
agent.pause();                  // Pause the conversation
agent.resume();                 // Resume
agent.setMicMuted(true/false);  // Mute/unmute mic
agent.isMicMuted();             // Check mute state
agent.setVolume(0.8);           // Set volume (0-1)
agent.getJobId();               // Get current call/job ID
agent.getOutputVolume();        // Get agent voice level
agent.getInputVolume();         // Get user mic level
```

TypeScript types available:
```typescript
import {
  HamsaVoiceAgent,
  AgentState,         // 'idle' | 'initializing' | 'listening' | 'thinking' | 'speaking'
  CallStartedData,    // { jobId: string }
  DTMFDigit,
} from '@hamsa-ai/voice-agents-sdk';
```

---

## Feature 2: Chatbot Page

Use **OpenAI's ChatKit** React components for the chatbot.

```bash
npm install @openai/chatkit
```

The chatbot page should:
- Use ChatKit's `<Thread />`, `<ThreadMessage />`, and `<Composer />` components
- Connect to an OpenAI-compatible API endpoint for chat completions
- Have a clean, modern chat interface
- Support markdown rendering in responses

Refer to the ChatKit documentation for component usage. The basic structure is:
```tsx
import { Thread, ThreadMessage, Composer } from '@openai/chatkit';

// Use the components to build a chat interface
```

---

## Feature 3: Call History Page (Already Extracted)

The call history code is already in `src/features/call-history/` and `src/components/call-details/`. You need to:

1. **Create the missing dependencies** that the extracted code imports:
   - `@/components/ui/*` - Install shadcn/ui components: Badge, Button, Card, Dialog, DropdownMenu, Tabs, Calendar, Select, Tooltip, Skeleton, Avatar, Input
   - `@/components/ui/copy-button` - Create a simple copy-to-clipboard button component
   - `@/components/ui/relative-time-card` - Create a component that shows relative time (e.g., "5 minutes ago")
   - `@/components/data-table/` - Create DataTable, DataTableToolbar, DataTableColumnHeader components using @tanstack/react-table
   - `@/hooks/use-data-table` - Create a hook wrapping @tanstack/react-table with URL state sync
   - `@/hooks/use-is-rtl` - Simple hook: `() => document.dir === 'rtl'` (return false for demo)
   - `@/lib/api-client` - Axios instance pointed at the Hamsa API (see below)
   - `@/lib/auth` - Export a `useUser()` hook that returns `{ data: { id: 'demo-user' } }`
   - `@/lib/i18n` - i18next setup loading `public/locales/en/call-history.json`
   - `@/lib/parsers` - Export `getSortingStateParser` for nuqs URL state
   - `@/utils/cn` - `clsx` + `tailwind-merge` utility
   - `@/utils/csv-export` - `exportToExcel` function using xlsx or similar
   - `@/config/paths` - Route paths config with `paths.app.calls.getHref(id)`
   - `@/components/livekit` - LiveKitListenerRoom component (can be a stub/placeholder for demo)
   - `@/analytics` - Export `trackCustomEvent` and `EVENTS` (can be no-ops for demo)
   - `@/features/agents/hooks/use-agents-query` - `useAgentsForDropdown` hook (can return mock data or fetch from API)
   - `@/components/seo` - Simple `<Head>` component that sets document title

2. **The call-details-drawer.tsx has already been modified** to remove the Logs tab. It only shows: Overview, Conversation, and Outcome tabs.

3. **The project store** needs to be initialized with a project ID and API key on app load so the API calls work.

---

## API Configuration

The app connects to the Hamsa API. Create an API client at `src/lib/api-client.ts`:

- **Base URL**: `https://api.hamsa.ai` (or from environment variable `VITE_API_URL`)
- **Authentication**: Use HTTP-only cookies (set `withCredentials: true`) OR use a Bearer token from environment variable `VITE_API_KEY`
- The API wraps responses in `{ success: boolean, message: string, data: T }` - the client should unwrap this

For the demo, the simplest approach is to use API key auth:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.hamsa.ai',
  headers: {
    'x-api-key': import.meta.env.VITE_API_KEY,
  },
});
```

---

## Environment Variables

Create a `.env` file:
```
VITE_API_URL=https://api.hamsa.ai
VITE_API_KEY=your_hamsa_api_key
VITE_PROJECT_ID=your_project_id
VITE_VOICE_AGENT_ID=your_voice_agent_id
VITE_OPENAI_API_KEY=your_openai_api_key
```

---

## App Layout

Create a simple app layout with:
- **Sidebar** with navigation links:
  - Home (dashboard)
  - Voice Agent
  - Chatbot
  - Call History
- **Header** with app name "SBM Demo"
- **Main content area** where pages render

The sidebar should be collapsible and the layout should be responsive.

---

## Home/Dashboard Page

A simple landing page with:
- Welcome message
- Three cards linking to the three features (Voice Agent, Chatbot, Call History)
- Each card with a brief description and icon

---

## NPM Dependencies to Install

```bash
# Core
npm install react react-dom react-router
npm install -D vite @vitejs/plugin-react typescript

# UI
npm install tailwindcss @tailwindcss/vite
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# shadcn/ui (install via CLI, then add components)
npx shadcn@latest init

# State & Data
npm install @tanstack/react-query @tanstack/react-table
npm install zustand
npm install axios
npm install nuqs

# i18n
npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend

# Voice & Chat
npm install @hamsa-ai/voice-sdk
npm install @openai/chatkit

# Utilities
npm install sonner           # Toast notifications
npm install react-day-picker # Calendar component (used by date range filter)
npm install react-scroll-to-bottom # Auto-scroll in conversation tab
npm install xlsx             # Excel export
```

---

## Key Implementation Notes

1. **For the demo, hardcode credentials**: Initialize the project store on app mount with the project ID and API key from env vars. No login page needed.

2. **The call history feature uses `nuqs`** for URL state management (filters, pagination, sorting are synced to URL query params).

3. **The `useUser()` hook** from `@/lib/auth` is used by the conversation details hook. For demo, just return a hardcoded user object: `{ data: { id: 'demo-user' } }`.

4. **The project store's `TransformedProject` type** needs to be defined. It's: `{ value: string; label: string }` where `value` is the project ID.

5. **The call history table uses `@/config/paths`** for navigation. Define it as:
   ```typescript
   export const paths = {
     app: {
       calls: {
         getHref: (id: string) => `/app/call-history/${id}`,
       },
     },
   };
   ```

6. **LiveKit components** (`LiveKitListenerRoom`) can be stubbed out for the demo since it requires a LiveKit server. Just show a placeholder message.

7. **Analytics** (`trackCustomEvent`, `EVENTS`) can be no-op functions for the demo.

8. **The `useAgentsForDropdown` hook** in the export dialog's agent filter needs to return a list of voice agents. Either fetch from `/v1/voice-agents` or return mock data.

---

## Priority Order

1. Set up the Vite + React project with Tailwind and shadcn/ui
2. Create the app layout with sidebar navigation
3. Build the Voice Agent page (most impressive for demo)
4. Build the Chatbot page
5. Wire up the Call History page (most code already exists, just needs dependencies)
6. Polish and test
