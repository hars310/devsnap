import { execSync } from 'child_process';
import path from 'path';

const isWin = process.platform === 'win32';

function run(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
      shell: isWin ? 'cmd.exe' : '/bin/sh',
    }).trim();
  } catch {
    return null;
  }
}

export async function collectPackages() {
  // npm list -g --parseable outputs one path per line like:
  //   /usr/local/lib/node_modules/typescript   (mac/linux)
  //   C:\Users\you\AppData\Roaming\npm\node_modules\typescript  (windows)
  // path.basename handles both separators correctly.
  // We also strip \r in case of Windows CRLF line endings.
  const npmRaw = run('npm list -g --depth=0 --parseable');
  const npmGlobal = (npmRaw ?? '')
    .split('\n')
    .slice(1)                              // skip first line (root node_modules path)
    .map(line => path.basename(line.trim().replace(/\r/g, '')))
    .filter(Boolean);

  // pip3 on Windows is usually just 'pip' — try both
  const pipRaw = run('pip3 list --format=freeze')
    ?? run('pip list --format=freeze');
  const pipGlobal = (pipRaw ?? '')
    .split('\n')
    .map(line => line.replace(/\r/g, '').trim())
    .filter(Boolean);

  return { npm_global: npmGlobal, pip_global: pipGlobal };
}