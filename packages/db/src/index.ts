// Connection
export { db } from './connection';

// Schema
export * from './schema';

// Queries — profiles
export {
  insertProfile,
  updateProfile,
  findProfileById,
  findAllProfiles,
  getFirstProfile,
} from './queries/profiles';

// Queries — prompts
export {
  insertPrompt,
  insertPromptWithTags,
  findPromptById,
  findAllPrompts,
  findTagsByPromptId,
  deletePrompt,
  updatePromptEmbedding,
  findAllPromptsWithEmbeddings,
  findPromptsWithoutEmbeddings,
  findPromptsByIds,
} from './queries/prompts';

// Queries — runner
export {
  insertRunnerSession,
  findRunnerSessionById,
  updateRunnerSession,
} from './queries/runner';
