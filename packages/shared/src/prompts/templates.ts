export const CLAUDE_MD_HANDSHAKE =
  'Read CLAUDE.md and confirm you understand the project constraints before doing anything.';

export const CONTRACT_SECTIONS = ['GOAL', 'CONSTRAINTS', 'FORMAT', 'FAILURE CONDITIONS'] as const;

export type ContractSection = (typeof CONTRACT_SECTIONS)[number];
