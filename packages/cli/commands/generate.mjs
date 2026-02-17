import { info } from '../lib/display.mjs';

export function registerGenerate(program) {
  program
    .command('generate')
    .description('Generate a Prompt Contract from natural language')
    .argument('[description...]', 'Description of what you want to build')
    .action((_description) => {
      info('cpm generate — not yet implemented');
    });
}
