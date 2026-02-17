import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import { getAnalysis, generateAnalysis, saveAnalysis } from './analysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const HAMSA_API_URL = process.env.HAMSA_API_URL || 'https://api.tryhamsa.com';
const HAMSA_API_KEY = process.env.HAMSA_API_KEY || '';
const HAMSA_PROJECT_ID = process.env.HAMSA_PROJECT_ID || '';

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const CHATKIT_WORKFLOW_ID = process.env.CHATKIT_WORKFLOW_ID!;
const DEMO_USER_ID = process.env.DEMO_USER_ID || 'demo-user';

app.use('/api', (_req, _res, next) => {
  const masked = OPENAI_API_KEY ? `...${OPENAI_API_KEY.slice(-4)}` : 'NOT SET';
  console.log(`[API] OPENAI_API_KEY: ${masked}`);
  next();
});

/**
 * POST /api/chatkit/session
 * Creates a ChatKit session and returns the client_secret to the frontend.
 */
app.post('/api/chatkit/session', async (_req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'chatkit_beta=v1',
      },
      body: JSON.stringify({
        workflow: { id: CHATKIT_WORKFLOW_ID },
        user: DEMO_USER_ID,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenAI session creation failed:', response.status, text);
      res.status(response.status).json({ error: text });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error creating ChatKit session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * POST /api/create-session
 * Alternative endpoint for ChatKit session creation (used by chatbot page).
 */
app.post('/api/create-session', async (req, res) => {
  try {
    const { workflow_id } = req.body;
    const workflowId = workflow_id || CHATKIT_WORKFLOW_ID;

    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'chatkit_beta=v1',
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: DEMO_USER_ID,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenAI session creation failed:', response.status, text);
      res.status(response.status).json({ error: text });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error creating ChatKit session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * GET /api/chatkit/threads
 * Proxies the ChatKit threads list for a given user.
 */
app.get('/api/chatkit/threads', async (req, res) => {
  try {
    const userId = (req.query.user as string) || DEMO_USER_ID;
    const url = `https://api.openai.com/v1/chatkit/threads?user=${encodeURIComponent(userId)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'chatkit_beta=v1',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenAI threads fetch failed:', response.status, text);
      res.status(response.status).json({ error: text });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching ChatKit threads:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

/**
 * GET /api/chatkit/threads/:threadId/messages
 * Fetches messages for a specific ChatKit thread.
 */
app.get('/api/chatkit/threads/:threadId/messages', async (req, res) => {
  try {
    const { threadId } = req.params;
    const url = `https://api.openai.com/v1/chatkit/threads/${encodeURIComponent(threadId)}/items`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'chatkit_beta=v1',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenAI thread items fetch failed:', response.status, text);
      res.status(response.status).json({ error: text });
      return;
    }

    const data = await response.json();
    res.json({ data: data.data || [] });
  } catch (error) {
    console.error('Error fetching ChatKit messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * GET /api/analysis/:id
 * Returns AI-generated analysis for a conversation (voice call or chat).
 * Caches results in NeonDB; regenerates if messageCount changes.
 */
app.get('/api/analysis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const type = (req.query.type as string) || 'voice_call';
    const messageCount = parseInt(req.query.messageCount as string, 10) || 0;

    // Check cache
    const cached = await getAnalysis(id, messageCount);
    if (cached) {
      res.json({ data: cached, cached: true });
      return;
    }

    let transcript = '';
    let metadata: {
      type: 'voice_call' | 'chat';
      agentName?: string;
      status?: string;
      callDuration?: number;
      channelType?: string;
      greetingMessage?: string;
    } = { type: type as 'voice_call' | 'chat' };

    if (type === 'voice_call') {
      // Fetch conversation details from Hamsa API
      const url = `${HAMSA_API_URL}/v1/voice-agents/conversation/${encodeURIComponent(id)}?projectId=${HAMSA_PROJECT_ID}&apiKey=${HAMSA_API_KEY}`;
      const response = await fetch(url, {
        headers: { Authorization: `Token ${HAMSA_API_KEY}` },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[Analysis] Hamsa API failed:', response.status, text);
        res.status(response.status).json({ error: 'Failed to fetch conversation details' });
        return;
      }

      const json = await response.json();
      const details = json.data || json;
      const agent = details.agentDetails || {};
      const job = details.jobResponse || {};

      metadata = {
        type: 'voice_call',
        agentName: agent.agentName,
        status: details.status,
        callDuration: details.callDuration,
        channelType: details.channelType,
        greetingMessage: agent.greetingMessage,
      };

      // Format transcription
      const transcription = job.transcription || [];
      transcript = transcription
        .map((entry: Record<string, unknown>) => {
          const speaker = Object.keys(entry).find((k) => k !== 'metadata') || 'unknown';
          const value = entry[speaker];
          const message =
            typeof value === 'string'
              ? value
              : Array.isArray(value)
                ? value
                    .map((item: any) =>
                      item?.function?.name
                        ? `${item.function.name}(${item.function.arguments ?? ''})`
                        : JSON.stringify(item),
                    )
                    .join('; ')
                : String(value ?? '');
          return `${speaker}: ${message}`;
        })
        .join('\n');
    } else {
      // Chat: fetch messages from ChatKit API
      const url = `https://api.openai.com/v1/chatkit/threads/${encodeURIComponent(id)}/items`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'chatkit_beta=v1',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[Analysis] ChatKit fetch failed:', response.status, text);
        res.status(response.status).json({ error: 'Failed to fetch chat messages' });
        return;
      }

      const json = await response.json();
      const items = json.data || [];
      const messages = items.filter(
        (m: any) =>
          m.type === 'chatkit.user_message' || m.type === 'chatkit.assistant_message',
      );

      metadata = { type: 'chat' };

      transcript = messages
        .map((m: any) => {
          const role = m.type === 'chatkit.assistant_message' ? 'Assistant' : 'User';
          const text = (m.content || []).map((c: any) => c.text).join('');
          return `${role}: ${text}`;
        })
        .join('\n');
    }

    if (!transcript.trim()) {
      res.status(400).json({ error: 'No transcript available for analysis' });
      return;
    }

    // Generate analysis via OpenAI
    const analysis = await generateAnalysis(transcript, metadata);

    // Cache in NeonDB
    await saveAnalysis(id, type, analysis, messageCount);

    res.json({ data: analysis, cached: false });
  } catch (error) {
    console.error('[Analysis] Error:', error);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const webDistPath = path.resolve(__dirname, '../../web/dist');
  app.use(express.static(webDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
