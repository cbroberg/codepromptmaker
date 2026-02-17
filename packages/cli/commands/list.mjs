import { info } from '../lib/display.mjs';

export function registerList(program) {
  program
    .command('list')
    .alias('ls')
    .description('List prompts from the database')
    .action(() => {
      info('cpm list — not yet implemented');
    });
}
