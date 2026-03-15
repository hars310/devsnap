#!/usr/bin/env node

import { program } from 'commander';
import { createRequire } from 'module';
import { captureCommand } from './commands/capture.js';
import { diffCommand } from './commands/diff.js';
import { listCommand } from './commands/list.js';
import { authCommand } from './commands/auth.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

program
  .name('devsnap')
  .description('Capture and diff your dev environment')
  .version(version);

program.command('capture')
  .description('Snapshot current environment')
  .option('-t, --tag <tag>', 'Label for this snapshot (e.g. "broke here")')
  .option('-n, --note <note>', 'Free-text note')
  .action(captureCommand);

program.command('list')
  .description('List recent snapshots')
  .option('-l, --limit <n>', 'Number to show', '10')
  .action(listCommand);

program.command('diff <id1> <id2>')
  .description('Diff two snapshots by ID')
  .action(diffCommand);

program.command('auth')
  .description('Save your API key')
  .requiredOption('-k, --key <key>', 'Your devsnap API key')
  .option('--url <url>', 'Backend URL', 'https://devsnap-production.up.railway.app')
  .action(authCommand);

program.parse();