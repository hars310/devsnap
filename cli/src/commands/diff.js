import chalk from 'chalk';
import axios from 'axios';
import { readConfig } from '../config.js';

// Color helpers
const added   = str => chalk.green(`+ ${str}`);
const removed = str => chalk.red(`- ${str}`);
const changed = (label, a, b) => chalk.yellow(`~ ${label}: `) + chalk.red(a) + chalk.gray(' → ') + chalk.green(b);
const unchanged = str => chalk.dim(`  ${str}`);
const section = title => {
  console.log('');
  console.log(chalk.bold.underline(title));
};

function printRuntimes(runtimes) {
  section('Runtimes');
  let anyChange = false;
  for (const [key, val] of Object.entries(runtimes)) {
    if (val.changed) {
      anyChange = true;
      if (val.a === null) console.log(added(`${key}: ${val.b}`));
      else if (val.b === null) console.log(removed(`${key}: ${val.a}`));
      else console.log(changed(key, val.a, val.b));
    } else if (val.a !== null) {
      console.log(unchanged(`${key}: ${val.a}`));
    }
  }
  if (!anyChange) console.log(chalk.dim('  No changes.'));
}

function printEnvKeys(env_keys) {
  section('Environment Keys');
  if (env_keys.added.length === 0 && env_keys.removed.length === 0) {
    console.log(chalk.dim('  No changes.'));
    return;
  }
  for (const k of env_keys.added)   console.log(added(k));
  for (const k of env_keys.removed) console.log(removed(k));
}

function printPackages(packages) {
  section('npm Packages (global)');
  const npm = packages.npm_global;
  if (!npm.added.length && !npm.removed.length && !npm.changed.length) {
    console.log(chalk.dim('  No changes.'));
  } else {
    for (const p of npm.added)   console.log(added(p));
    for (const p of npm.removed) console.log(removed(p));
    for (const p of npm.changed) console.log(changed(p.name, p.from, p.to));
  }

  section('pip Packages (global)');
  const pip = packages.pip_global;
  if (!pip.added.length && !pip.removed.length && !pip.changed.length) {
    console.log(chalk.dim('  No changes.'));
  } else {
    for (const p of pip.added)   console.log(added(p));
    for (const p of pip.removed) console.log(removed(p));
    for (const p of pip.changed) console.log(changed(p.name, p.from, p.to));
  }
}

function printPorts(ports) {
  section('Open Ports');
  if (ports.added.length === 0 && ports.removed.length === 0) {
    console.log(chalk.dim('  No changes.'));
    return;
  }
  for (const p of ports.added)   console.log(added(`:${p}`));
  for (const p of ports.removed) console.log(removed(`:${p}`));
}

function printGit(git) {
  section('Git');
  if (!git.branch_changed) {
    console.log(chalk.dim(`  Branch unchanged: ${git.branch_a}`));
  } else {
    console.log(changed('branch', git.branch_a ?? 'n/a', git.branch_b ?? 'n/a'));
  }
}

function printSystem(system) {
  section('System');
  let anyChange = false;
  for (const [key, val] of Object.entries(system)) {
    if (val.changed) {
      anyChange = true;
      console.log(changed(key, val.a ?? 'n/a', val.b ?? 'n/a'));
    }
  }
  if (!anyChange) console.log(chalk.dim('  No changes.'));
}

export async function diffCommand(id1, id2) {
  const config = readConfig();

  if (!config.apiKey) {
    console.error(chalk.red('✗ Not authenticated.'));
    console.error(`  Run: ${chalk.cyan('devsnap auth --key YOUR_KEY')}`);
    process.exit(1);
  }

  try {
    const res = await axios.get(`${config.backendUrl}/api/diff`, {
      params: { a: id1, b: id2 },
      headers: { 'x-api-key': config.apiKey },
    });

    const { snapshot_a, snapshot_b, diff } = res.data;

    const dateA = new Date(snapshot_a.created_at).toLocaleString();
    const dateB = new Date(snapshot_b.created_at).toLocaleString();

    console.log('');
    console.log(chalk.bold('Comparing snapshots:'));
    console.log(`  ${chalk.red('A')} ${chalk.cyan(snapshot_a.id.slice(0, 8))} ${snapshot_a.tag ? chalk.yellow(`[${snapshot_a.tag}]`) : ''} ${chalk.dim(dateA)}`);
    console.log(`  ${chalk.green('B')} ${chalk.cyan(snapshot_b.id.slice(0, 8))} ${snapshot_b.tag ? chalk.yellow(`[${snapshot_b.tag}]`) : ''} ${chalk.dim(dateB)}`);

    if (!diff.has_changes) {
      console.log('');
      console.log(chalk.green('✓ No differences found between these snapshots.'));
      return;
    }

    printRuntimes(diff.runtimes);
    printEnvKeys(diff.env_keys);
    printPackages(diff.packages);
    printPorts(diff.ports);
    printGit(diff.git);
    printSystem(diff.system);

    console.log('');
  } catch (err) {
    const msg = err.response?.data?.error ?? err.message;
    console.error(chalk.red(`✗ Diff failed: ${msg}`));
    process.exit(1);
  }
}