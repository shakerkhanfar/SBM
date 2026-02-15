import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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

if (process.env.NODE_ENV === 'production') {
  const webDistPath = path.resolve(__dirname, '../../web/dist');
  app.use(express.static(webDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
