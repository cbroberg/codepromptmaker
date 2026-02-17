import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || 'sqlite.db';

const sqlite = new Database(DATABASE_URL);
sqlite.pragma('journal_mode = WAL');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS developer_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stack TEXT NOT NULL DEFAULT '[]',
    hard_rules TEXT NOT NULL DEFAULT '[]',
    patterns TEXT NOT NULL DEFAULT '[]',
    default_failure_conditions TEXT NOT NULL DEFAULT '[]',
    prompt_language TEXT NOT NULL DEFAULT 'en',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    goal TEXT NOT NULL,
    constraints TEXT NOT NULL,
    format TEXT NOT NULL,
    failure_conditions TEXT NOT NULL,
    full_prompt TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    profile_id TEXT REFERENCES developer_profiles(id),
    embedding BLOB,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prompt_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id TEXT NOT NULL REFERENCES prompts(id),
    tag TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS runner_sessions (
    id TEXT PRIMARY KEY,
    prompt_id TEXT NOT NULL REFERENCES prompts(id),
    status TEXT NOT NULL DEFAULT 'pending',
    autonomy_level TEXT NOT NULL DEFAULT 'supervised',
    current_iteration INTEGER NOT NULL DEFAULT 0,
    max_iterations INTEGER NOT NULL DEFAULT 10,
    cooldown_seconds INTEGER NOT NULL DEFAULT 10,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    error TEXT
  );
`);

export const db = drizzle(sqlite, { schema });
