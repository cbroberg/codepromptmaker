export const ALLOWED_TOOLS = [
  'Read',
  'Write',
  'Edit',
  'MultiEdit',
  'Bash(npm:*)',
  'Bash(npx:*)',
  'Bash(pnpm:*)',
  'Bash(node:*)',
  'Bash(git:*)',
  'Bash(cat:*)',
  'Bash(ls:*)',
  'Bash(find:*)',
  'Bash(grep:*)',
  'Bash(mkdir:*)',
  'TodoRead',
  'TodoWrite',
] as const;

export type AllowedTool = (typeof ALLOWED_TOOLS)[number];
