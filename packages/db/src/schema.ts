import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const developerProfiles = sqliteTable('developer_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  stack: text('stack', { mode: 'json' }).notNull().$type<string[]>().default([]),
  hardRules: text('hard_rules', { mode: 'json' }).notNull().$type<string[]>().default([]),
  patterns: text('patterns', { mode: 'json' }).notNull().$type<string[]>().default([]),
  defaultFailureConditions: text('default_failure_conditions', { mode: 'json' }).notNull().$type<string[]>().default([]),
  promptLanguage: text('prompt_language').notNull().default('en'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  goal: text('goal').notNull(),
  constraints: text('constraints').notNull(),
  format: text('format').notNull(),
  failureConditions: text('failure_conditions').notNull(),
  fullPrompt: text('full_prompt').notNull(),
  language: text('language').notNull().default('en'),
  profileId: text('profile_id').references(() => developerProfiles.id),
  embedding: blob('embedding'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const promptTags = sqliteTable('prompt_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  promptId: text('prompt_id').notNull().references(() => prompts.id),
  tag: text('tag').notNull(),
});

export const runnerSessions = sqliteTable('runner_sessions', {
  id: text('id').primaryKey(),
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
