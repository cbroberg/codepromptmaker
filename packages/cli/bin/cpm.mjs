#!/usr/bin/env node

import { Command } from 'commander';
import { registerGenerate } from '../commands/generate.mjs';
import { registerList } from '../commands/list.mjs';
import { registerShow } from '../commands/show.mjs';
import { registerCopy } from '../commands/copy.mjs';
import { registerRun } from '../commands/run.mjs';
import { registerStatus } from '../commands/status.mjs';

const program = new Command();

program
  .name('cpm')
  .description('CodePromptMaker — Transform descriptions into Prompt Contracts for Claude Code')
  .version('0.1.0');

registerGenerate(program);
registerList(program);
registerShow(program);
registerCopy(program);
registerRun(program);
registerStatus(program);

program.parse();
