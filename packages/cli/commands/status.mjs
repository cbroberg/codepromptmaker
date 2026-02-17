import { info } from '../lib/display.mjs';

export function registerStatus(program) {
  program
    .command('status')
    .description('Show active runner status')
    .action(() => {
      info('cpm status — not yet implemented');
    });
}
