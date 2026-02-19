import { sqliteTable, text, integer, blob, primaryKey } from 'drizzle-orm/sqlite-core';

// ─── Auth.js tables (required by @auth/drizzle-adapter) ─────────────────────

export const users = sqliteTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  plan: text('plan').notNull().default('free'),
});

export const accounts = sqliteTable('account', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => [
  primaryKey({ columns: [table.provider, table.providerAccountId] }),
]);

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

export const verificationTokens = sqliteTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.identifier, table.token] }),
]);

// ─── CPM: API Tokens ────────────────────────────────────────────────────────

export const apiTokens = sqliteTable('api_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  name: text('name').notNull(),
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull(),
});

// ─── CPM: Developer Profiles ────────────────────────────────────────────────

export const developerProfiles = sqliteTable('developer_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('local'),
  name: text('name').notNull(),
  stack: text('stack', { mode: 'json' }).notNull().$type<string[]>().default([]),
  hardRules: text('hard_rules', { mode: 'json' }).notNull().$type<string[]>().default([]),
  patterns: text('patterns', { mode: 'json' }).notNull().$type<string[]>().default([]),
  defaultFailureConditions: text('default_failure_conditions', { mode: 'json' }).notNull().$type<string[]>().default([]),
  promptLanguage: text('prompt_language').notNull().default('en'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ─── CPM: Prompts ───────────────────────────────────────────────────────────

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('local'),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  goal: text('goal').notNull(),
  constraints: text('constraints').notNull(),
  format: text('format').notNull(),
  failureConditions: text('failure_conditions').notNull(),
  fullPrompt: text('full_prompt').notNull(),
  language: text('language').notNull().default('en'),
  profileId: text('profile_id').references(() => developerProfiles.id),
  rating: integer('rating'),
  notes: text('notes'),
  embedding: blob('embedding'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const promptTags = sqliteTable('prompt_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  promptId: text('prompt_id').notNull().references(() => prompts.id),
  tag: text('tag').notNull(),
});

// ─── CPM: Runner Sessions ───────────────────────────────────────────────────

export const runnerSessions = sqliteTable('runner_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('local'),
  promptId: text('prompt_id').notNull().references(() => prompts.id),
  status: text('status').notNull().default('pending'),
  autonomyLevel: text('autonomy_level').notNull().default('supervised'),
  currentIteration: integer('current_iteration').notNull().default(0),
  maxIterations: integer('max_iterations').notNull().default(10),
  cooldownSeconds: integer('cooldown_seconds').notNull().default(10),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  error: text('error'),
});

// ─── CPM: Organizations ────────────────────────────────────────────────────

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull().default('free'),
  isPersonal: integer('is_personal', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const organizationMembers = sqliteTable('organization_members', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'),
  createdAt: text('created_at').notNull(),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  machineSize: text('machine_size').notNull().default('free'),
  region: text('region').notNull().default('iad'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
