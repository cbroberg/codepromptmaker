export type RunnerStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export type AutonomyLevel = 'single' | 'supervised' | 'full';

export interface RunnerSession {
  id: string;
  promptId: string;
  status: RunnerStatus;
  autonomyLevel: AutonomyLevel;
  currentIteration: number;
  maxIterations: number;
  cooldownSeconds: number;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

export interface StartRunnerInput {
  promptId: string;
  autonomyLevel?: AutonomyLevel;
  maxIterations?: number;
  cooldownSeconds?: number;
}

export interface RunnerProgress {
  sessionId: string;
  iteration: number;
  status: RunnerStatus;
  message: string;
}
