import OpenAI from 'openai';
import { sql } from './db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AnalysisResult {
  summary: string;
  outcome: string;
  sentiment: string;
  customerSatisfaction: number;
  topics: string[];
  keyInsights: string[];
  actionItems: string[];
  speakerAnalysis: {
    agent: { toneAssessment: string; effectivenessScore: number };
    user: { intentSummary: string; emotionalTone: string };
  };
  resolutionType: string;
  language: string;
  tags: string[];
}

interface ConversationMetadata {
  type: 'voice_call' | 'chat';
  agentName?: string;
  status?: string;
  callDuration?: number;
  channelType?: string;
  greetingMessage?: string;
}

/**
 * Check NeonDB cache for existing analysis
 */
export async function getAnalysis(
  id: string,
  messageCount: number,
): Promise<AnalysisResult | null> {
  if (!sql) return null;

  try {
    const rows = await sql`
      SELECT analysis, message_count
      FROM conversation_analysis
      WHERE id = ${id}
    `;

    if (rows.length === 0) return null;

    const row = rows[0];
    if (row.message_count !== messageCount) return null;

    return row.analysis as AnalysisResult;
  } catch (error) {
    console.error('[Analysis] Cache lookup failed:', error);
    return null;
  }
}

/**
 * Generate analysis using OpenAI
 */
export async function generateAnalysis(
  transcript: string,
  metadata: ConversationMetadata,
): Promise<AnalysisResult> {
  const prompt = `You are an expert conversation analyst. Analyze the following conversation and return a JSON object with these fields:

{
  "summary": "2-3 sentence summary of the conversation — what was discussed, what was resolved",
  "outcome": "resolved | unresolved | partial | escalated | dropped | no_answer",
  "sentiment": "positive | negative | neutral | mixed",
  "customerSatisfaction": number (1-5 scale, estimated from tone and resolution),
  "topics": ["topic1", "topic2"],
  "keyInsights": ["insight1", "insight2"],
  "actionItems": ["action1", "action2"],
  "speakerAnalysis": {
    "agent": { "toneAssessment": "friendly/professional/etc", "effectivenessScore": 1-5 },
    "user": { "intentSummary": "what the user wanted", "emotionalTone": "calm/frustrated/etc" }
  },
  "resolutionType": "voiceAgent | transfer | callback | selfService | none",
  "language": "detected language of conversation",
  "tags": ["tag1", "tag2"]
}

Return ONLY valid JSON, no markdown fences or extra text.

Conversation metadata:
- Type: ${metadata.type}
- Agent: ${metadata.agentName || 'Unknown'}
- Status: ${metadata.status || 'Unknown'}
- Duration: ${metadata.callDuration ?? 'N/A'} seconds
- Channel: ${metadata.channelType || 'Unknown'}
- Agent greeting: ${metadata.greetingMessage || 'N/A'}

Transcript:
${transcript}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  return JSON.parse(content) as AnalysisResult;
}

/**
 * Upsert analysis into NeonDB cache
 */
export async function saveAnalysis(
  id: string,
  type: string,
  analysis: AnalysisResult,
  messageCount: number,
): Promise<void> {
  if (!sql) return;

  try {
    await sql`
      INSERT INTO conversation_analysis (id, type, analysis, message_count, updated_at)
      VALUES (${id}, ${type}, ${JSON.stringify(analysis)}, ${messageCount}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        analysis = ${JSON.stringify(analysis)},
        message_count = ${messageCount},
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('[Analysis] Failed to save:', error);
  }
}
