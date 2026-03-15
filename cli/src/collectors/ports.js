import { execSync } from 'child_process';

const isWin = process.platform === 'win32';

function parsePorts(raw, platform) {
  if (platform === 'win32') {
    // netstat -ano output on Windows:
    //   TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    1234
    //   TCP    [::]:3000       [::]:0       LISTENING    1234
    return raw
      .split('\n')
      .filter(line => /LISTENING/i.test(line))
      .map(line => {
        // Match both IPv4 (0.0.0.0:PORT) and IPv6 ([::]:PORT)
        const match = line.match(/[:\]](\d{2,5})\s+/);
        return match ? Number(match[1]) : null;
      })
      .filter(p => p && p > 0 && p < 65536);
  }

  // macOS / Linux: match ":PORT " or ":PORT(" patterns
  return raw
    .split('\n')
    .map(line => line.match(/:([0-9]{2,5})\s*($|\()/)?.[1])
    .filter(Boolean)
    .map(Number)
    .filter(p => p > 0 && p < 65536);
}

export async function collectPorts() {
  try {
    let raw;

    if (isWin) {
      // Windows: netstat -ano shows all TCP connections with state
      raw = execSync('netstat -ano', {
        encoding: 'utf8',
        timeout: 5000,
        shell: 'cmd.exe',
      });
    } else if (process.platform === 'darwin') {
      // macOS: lsof is reliable
      raw = execSync('lsof -iTCP -sTCP:LISTEN -nP', {
        encoding: 'utf8',
        timeout: 5000,
      });
    } else {
      // Linux: try ss first, fall back to netstat
      try {
        raw = execSync('ss -tlnp', { encoding: 'utf8', timeout: 5000 });
      } catch {
        raw = execSync('netstat -tlnp', { encoding: 'utf8', timeout: 5000 });
      }
    }

    const ports = [...new Set(parsePorts(raw, process.platform))].sort((a, b) => a - b);
    return ports;
  } catch {
    return [];
  }
}