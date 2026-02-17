import type { AutonomyLevel } from '@cpm/shared';

export interface LoopOptions {
  promptContract: string;
  autonomyLevel: AutonomyLevel;
  maxIterations: number;
  cooldownSeconds: number;
  workingDirectory: string;
}

export async function runRalphWiggumLoop(_options: LoopOptions): Promise<void> {
  // TODO: Implement the Ralph Wiggum loop:
  // 1. Iteration 1: cc gets the full Prompt Contract + instruction to create Tasks
  // 2. Iteration 2+: cc gets only "continue from your Tasks"
  // 3. Between iterations: cooldown, check for .claude/COMPLETE marker
  // 4. Stop condition: .claude/COMPLETE file exists OR max iterations reached
  throw new Error('Not implemented');
}
