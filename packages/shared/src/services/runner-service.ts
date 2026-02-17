import type { RunnerSession, StartRunnerInput, RunnerProgress } from '../types/index';

export async function startRunner(_input: StartRunnerInput): Promise<RunnerSession> {
  // TODO: Create runner session and start loop
  throw new Error('Not implemented');
}

export async function getRunnerStatus(_sessionId: string): Promise<RunnerProgress | null> {
  // TODO: Fetch runner progress
  throw new Error('Not implemented');
}

export async function stopRunner(_sessionId: string): Promise<void> {
  // TODO: Stop runner session
  throw new Error('Not implemented');
}
