import ora from 'ora';
import chalk from 'chalk';
import axios from 'axios';
import { readConfig } from '../config.js';
import { collectSystem } from '../collectors/system.js';
import { collectRuntimes } from '../collectors/runtimes.js';
import { collectPackages } from '../collectors/packages.js';
import { collectEnv } from '../collectors/env.js';
import { collectGit } from '../collectors/git.js';
import { collectPorts } from '../collectors/ports.js';

export async function captureCommand({ tag, note }) {
  const config = readConfig();

  if (!config.apiKey) {
    console.error(chalk.red('✗ Not authenticated.'));
    console.error(`  Run: ${chalk.cyan('devsnap auth --key YOUR_KEY')}`);
    console.error(`  Get a key by registering at your backend: POST /api/auth/register`);
    process.exit(1);
  }

  const spinner = ora('Capturing environment...').start();

  // Run all collectors in parallel — fast
  const [system, runtimes, packages, env_keys, git, ports] = await Promise.all([
    collectSystem(),
    collectRuntimes(),
    collectPackages(),
    collectEnv(),
    collectGit(),
    collectPorts(),
  ]);

  const payload = {
    system,
    runtimes,
    packages,
    env_keys,
    git,
    ports,
    captured_at: new Date().toISOString(),
  };

  spinner.text = 'Saving snapshot...';

  try {
    const res = await axios.post(`${config.backendUrl}/api/snapshots`, {
      tag: tag ?? null,
      note: note ?? null,
      data: payload,
    }, {
      headers: { 'x-api-key': config.apiKey },
    });

    spinner.succeed(
      `Snapshot saved: ${chalk.cyan(res.data.id.slice(0, 8))}` +
      (tag ? ` ${chalk.gray(`[${tag}]`)}` : '')
    );

    if (note) console.log(chalk.gray(`  Note: ${note}`));
    console.log(chalk.gray(`  Node: ${runtimes.node ?? 'n/a'}  |  Branch: ${git.branch ?? 'n/a'}  |  Ports: ${ports.length}`));
    console.log('');
    console.log(`Full ID: ${chalk.dim(res.data.id)}`);
  } catch (err) {
    const msg = err.response?.data?.error ?? err.message;
    spinner.fail(`Failed to save snapshot: ${msg}`);
    process.exit(1);
  }
}