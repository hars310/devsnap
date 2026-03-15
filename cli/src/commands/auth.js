import chalk from 'chalk';
import { writeConfig, readConfig } from '../config.js';

export async function authCommand({ key, url }) {
  const existing = readConfig();

  writeConfig({
    ...existing,
    apiKey: key,
    backendUrl: url,
  });

  console.log(chalk.green('✓ API key saved successfully.'));
  console.log(chalk.gray(`  Key: ${key.slice(0, 8)}...`));
  console.log(chalk.gray(`  Backend: ${url}`));
  console.log('');
  console.log(`Run ${chalk.cyan('devsnap capture')} to take your first snapshot.`);
}