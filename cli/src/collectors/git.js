import { execSync } from 'child_process';

const isWin = process.platform === 'win32';

function run(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'], // stderr suppressed — no 2>/dev/null needed
      timeout: 5000,
      shell: isWin ? 'cmd.exe' : '/bin/sh',
    }).trim();
  } catch {
    return null;
  }
}

export async function collectGit() {
  const branch = run('git rev-parse --abbrev-ref HEAD');
  if (!branch) return { branch: null, dirty: null, commits: [] };

  const dirty = (run('git status --porcelain')?.length ?? 0) > 0;

  // Use a separator unlikely to appear in commit messages.
  // Removed shell quoting around format string — Windows cmd doesn't handle it the same way.
  const SEP = '|||';
  const logRaw = run(`git log --format=%h${SEP}%s${SEP}%an${SEP}%ar -5`);

  const commits = (logRaw ?? '').split('\n').filter(Boolean).map(line => {
    const [hash, message, author, ago] = line.split(SEP);
    return { hash, message, author, ago };
  });

  return { branch, dirty, commits };
}