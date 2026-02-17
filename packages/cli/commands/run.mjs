import { info } from '../lib/display.mjs';

export function registerRun(program) {
  program
    .command('run')
    .description('Launch cc runner loop (Ralph Wiggum)')
    .argument('<id>', 'Prompt ID')
    .option('--autonomy <level>', 'Autonomy level: single, supervised, full', 'supervised')
    .option('--max-iterations <n>', 'Maximum iterations', '10')
    .option('--cooldown <seconds>', 'Cooldown between iterations', '10')
    .option('--dir <path>', 'Target directory for runner', '.')
    .action((_id, _options) => {
      info('cpm run — not yet implemented');
    });
}
