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

  -- Auth.js tables
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    emailVerified INTEGER,
    image TEXT,
    plan TEXT NOT NULL DEFAULT 'free'
  );

  CREATE TABLE IF NOT EXISTS account (
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    PRIMARY KEY (provider, providerAccountId)
  );

  CREATE TABLE IF NOT EXISTS session (
    sessionToken TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verificationToken (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires INTEGER NOT NULL,
    PRIMARY KEY (identifier, token)
  );

  -- CPM: API Tokens
  CREATE TABLE IF NOT EXISTS api_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    last_used_at TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL
  );

  -- CPM: Organizations
  CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free',
    is_personal INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS organization_members (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Migrations for columns added after initial schema
try { sqlite.exec('ALTER TABLE prompts ADD COLUMN rating INTEGER'); } catch { /* column exists */ }
try { sqlite.exec('ALTER TABLE prompts ADD COLUMN notes TEXT'); } catch { /* column exists */ }

// v3 migrations: add user_id to existing tables
try { sqlite.exec("ALTER TABLE developer_profiles ADD COLUMN user_id TEXT NOT NULL DEFAULT 'local'"); } catch { /* column exists */ }
try { sqlite.exec("ALTER TABLE prompts ADD COLUMN user_id TEXT NOT NULL DEFAULT 'local'"); } catch { /* column exists */ }
try { sqlite.exec("ALTER TABLE runner_sessions ADD COLUMN user_id TEXT NOT NULL DEFAULT 'local'"); } catch { /* column exists */ }

export const db = drizzle(sqlite, { schema });
