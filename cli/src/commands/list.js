import chalk from 'chalk';
import axios from 'axios';
import { readConfig } from '../config.js';

export async function listCommand({ limit }) {
  const config = readConfig();

  if (!config.apiKey) {
    console.error(chalk.red('✗ Not authenticated.'));
    console.error(`  Run: ${chalk.cyan('devsnap auth --key YOUR_KEY')}`);
    process.exit(1);
  }

  try {
    const res = await axios.get(`${config.backendUrl}/api/snapshots`, {
      params: { limit },
      headers: { 'x-api-key': config.apiKey },
    });

    const { snapshots, total } = res.data;

    if (snapshots.length === 0) {
      console.log(chalk.gray('No snapshots yet. Run: devsnap capture'));
      return;
    }

    console.log('');
    console.log(chalk.bold(`Snapshots (showing ${snapshots.length} of ${total})`));
    console.log(chalk.gray('─'.repeat(60)));

    for (const s of snapshots) {
      const date = new Date(s.created_at).toLocaleString();
      const id = chalk.cyan(s.id.slice(0, 8));
      const tag = s.tag ? chalk.yellow(`[${s.tag}]`) : '';
      const note = s.note ? chalk.gray(`"${s.note}"`) : '';
      const meta = chalk.dim(
        `${s.summary.os ?? '?'} · node ${s.summary.node ?? 'n/a'} · ${s.summary.branch ?? 'no git'} · ${s.summary.ports_count} ports`
      );

      console.log(`${id} ${tag} ${note}`);
      console.log(`  ${meta}  ${chalk.dim(date)}`);
      console.log('');
    }

    console.log(chalk.gray(`To diff two snapshots: devsnap diff <id1> <id2>`));
  } catch (err) {
    const msg = err.response?.data?.error ?? err.message;
    console.error(chalk.red(`✗ Failed to fetch snapshots: ${msg}`));
    process.exit(1);
  }
}