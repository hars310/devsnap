import { execSync } from 'child_process';
import os from 'os';
import path from 'path';

const isWin = process.platform === 'win32';

// Run a shell command and return stdout trimmed, or null on failure
function run(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'], // suppress stderr
      timeout: 5000,
      shell: isWin ? 'cmd.exe' : '/bin/sh',
    }).trim();
  } catch {
    return null;
  }
}

// On Windows, some runtimes install to user-specific paths not always in PATH.
// Try the command normally first, then try known Windows install locations.
function runWithFallback(cmd, fallbackPaths) {
  const result = run(cmd);
  if (result) return result;

  if (isWin) {
    for (const fallback of fallbackPaths) {
      const r = run(`"${fallback}" ${cmd.split(' ').slice(1).join(' ')}`);
      if (r) return r;
    }
  }

  return null;
}

function getRust() {
  const fallbacks = [
    path.join(os.homedir(), '.cargo', 'bin', 'rustc.exe'),
  ];
  const out = runWithFallback('rustc --version', fallbacks);
  return out?.split(' ')[1] ?? null;
}

function getPython() {
  // Windows: 'python3' often doesn't exist — try 'python' too
  const out = run('python3 --version') ?? run('python --version');
  return out?.split(' ')[1] ?? null;
}

function getPip() {
  const out = run('pip3 --version') ?? run('pip --version');
  return out?.split(' ')[1] ?? null;
}

function getGo() {
  const fallbacks = [
    'C:\\Program Files\\Go\\bin\\go.exe',
    path.join(os.homedir(), 'go', 'bin', 'go.exe'),
  ];
  const out = runWithFallback('go version', fallbacks);
  return out?.split(' ')[2]?.replace('go', '') ?? null;
}

function getJava() {
  // java -version writes to stderr, so we capture it via a wrapper
  try {
    const out = execSync('java -version 2>&1', {
      encoding: 'utf8',
      timeout: 5000,
      shell: isWin ? 'cmd.exe' : '/bin/sh',
    });
    return out?.match(/version "(.+?)"/)?.[1] ?? null;
  } catch (e) {
    // stderr is in e.stderr on some platforms
    const combined = (e.stdout ?? '') + (e.stderr ?? '');
    return combined?.match(/version "(.+?)"/)?.[1] ?? null;
  }
}

export async function collectRuntimes() {
  return {
    node:   run('node --version')?.replace('v', '') ?? null,
    npm:    run('npm --version') ?? null,
    python: getPython(),
    pip:    getPip(),
    go:     getGo(),
    rust:   getRust(),
    java:   getJava(),
    ruby:   run('ruby --version')?.split(' ')[1] ?? null,
  };
}