import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('[DB] NEON_DATABASE_URL not set — database features disabled');
}

export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

export async function initDatabase() {
  if (!sql) {
    console.warn('[DB] Skipping table creation — no database connection');
    return;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS conversation_analysis (
        id            TEXT PRIMARY KEY,
        type          TEXT NOT NULL,
        analysis      JSONB NOT NULL,
        message_count INTEGER NOT NULL DEFAULT 0,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('[DB] conversation_analysis table ready');
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error);
  }
}
