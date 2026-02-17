import { info } from '../lib/display.mjs';

export function registerCopy(program) {
  program
    .command('copy')
    .description('Copy prompt to clipboard')
    .argument('<id>', 'Prompt ID')
    .action((_id) => {
      info('cpm copy — not yet implemented');
    });
}
