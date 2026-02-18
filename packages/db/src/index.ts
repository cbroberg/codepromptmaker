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
  getProfileByUserId,
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
  updatePromptTitle,
  updatePromptRating,
  updatePromptNotes,
  findAllDistinctTags,
} from './queries/prompts';

// Queries — runner
export {
  insertRunnerSession,
  findRunnerSessionById,
  updateRunnerSession,
} from './queries/runner';

// Queries — API tokens
export {
  insertApiToken,
  findApiTokensByUserId,
  findApiTokenByHash,
  deleteApiToken,
  updateTokenLastUsed,
} from './queries/tokens';

// Queries — organizations
export {
  insertOrganization,
  findOrganizationById,
  findOrganizationBySlug,
  updateOrganization,
  deleteOrganization,
  insertOrgMember,
  findOrgsByUserId,
  findPersonalOrgByUserId,
  findMembersByOrgId,
  findMemberByOrgAndUser,
  removeOrgMember,
  findProjectsByOrgId,
  countProjectsByOrgId,
} from './queries/organizations';
