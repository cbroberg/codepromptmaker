import { info } from '../lib/display.mjs';

export function registerShow(program) {
  program
    .command('show')
    .description('Show prompt details')
    .argument('<id>', 'Prompt ID')
    .action((_id) => {
      info('cpm show — not yet implemented');
    });
}
