# @harshcode/devsnap

> Capture and diff your dev environment. One command. Shareable link.

Stop spending 45 minutes debugging the same environment issue your teammate hit last week. `devsnap` snapshots your full dev environment — runtimes, packages, env keys, git state, open ports — and lets you diff any two snapshots to see exactly what changed.

---

## Install

```bash
npm install -g @harshcode/devsnap
```

---

## Quickstart

```bash
# 1. Register and get an API key
# Go to your devsnap dashboard or run:
curl -X POST https://your-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com"}'

# 2. Save your API key
devsnap auth --key <your-api-key>

# 3. Capture your environment
devsnap capture --tag "before fix" --note "redis not connecting"

# ... make your changes ...

# 4. Capture again
devsnap capture --tag "after fix"

# 5. Diff the two snapshots
devsnap diff <id1> <id2>
```

---

## What Gets Captured

Every snapshot captures:

| Category | Details |
|---|---|
| **System** | OS, version, arch, hostname, CPU cores, memory, shell |
| **Runtimes** | Node, npm, Python, pip, Go, Rust, Java, Ruby versions |
| **Packages** | All globally installed npm and pip packages |
| **Env Keys** | Names of all environment variables (never values) |
| **Git** | Current branch, dirty state, last 5 commits |
| **Ports** | All listening ports (3000, 5432, 6379 etc.) |

> ⚠️ Environment variable **values** are never collected — only the key names. Your secrets are safe.

---

## Commands

### `devsnap auth`
Save your API key and backend URL to `~/.devsnap/config.json`.

```bash
devsnap auth --key <api-key>

# Point to a custom backend
devsnap auth --key <api-key> --url https://your-backend.up.railway.app
```

---

### `devsnap capture`
Snapshot your current environment and save it to the backend.

```bash
devsnap capture

# With a tag and note
devsnap capture --tag "broke here" --note "postgres stopped starting after update"
```

Output:
```
✔ Snapshot saved: a5b3c2d1 [broke here]
  Note: postgres stopped starting after update
  Node: 20.11.0  |  Branch: main  |  Ports: 3
Full ID: a5b3c2d1-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

### `devsnap list`
List your recent snapshots.

```bash
devsnap list

# Show more
devsnap list --limit 20
```

Output:
```
Snapshots (showing 2 of 2)
────────────────────────────────────────────────────────────
b2260546 [after fix] "testing diff"
  win32 · node 20.11.0 · main · 3 ports  3/15/2026, 9:00:15 AM

a5a01ba7 [broke here] "postgres not starting"
  win32 · node 20.11.0 · main · 2 ports  3/14/2026, 8:59:24 AM
```

---

### `devsnap diff <id1> <id2>`
Diff two snapshots — color output in terminal.

```bash
devsnap diff a5b3c2d1-xxxx-xxxx-xxxx-xxxxxxxxxxxx f7e2d891-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Output:
```
Comparing snapshots:
  A a5b3c2d1 [broke here]  3/14/2026, 9:00:00 AM
  B f7e2d891 [after fix]   3/15/2026, 10:23:00 AM

Runtimes
~ node: 18.17.0 → 20.11.0
+ go: 1.22.0

Environment Keys
+ DATABASE_URL
+ REDIS_URL
- OLD_DB_URL

npm Packages (global)
+ prisma@5.9.1
- prisma@4.0.0
~ typescript: 4.9.5 → 5.3.3

Open Ports
+ :6379

Git
~ branch: main → fix/payment-timeout
```

---

## CLI Reference

| Command | Flag | Description |
|---|---|---|
| `devsnap capture` | | Snapshot current environment |
| | `-t, --tag <tag>` | Label for this snapshot |
| | `-n, --note <note>` | Free-text note |
| `devsnap list` | | List recent snapshots |
| | `-l, --limit <n>` | Number to show (default: 10) |
| `devsnap diff <id1> <id2>` | | Diff two snapshots |
| `devsnap auth` | | Save API key |
| | `-k, --key <key>` | Your API key **(required)** |
| | `--url <url>` | Backend URL |

---

## Config File

Your API key and backend URL are stored at:

- **Mac/Linux:** `~/.devsnap/config.json`
- **Windows:** `C:\Users\<you>\.devsnap\config.json`

```json
{
  "apiKey": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "backendUrl": "https://your-backend.up.railway.app"
}
```

---

## Requirements

- Node.js 18 or higher
- A devsnap account (free) — register at your dashboard or via the API

---

## Tech Stack

- **commander** — argument parsing
- **chalk** — terminal colors
- **ora** — loading spinners
- **axios** — HTTP requests to backend

---

## Links

- **npm:** https://www.npmjs.com/package/@harshcode/devsnap
- **Dashboard:** https://your-vercel-url.vercel.app
- **GitHub:** https://github.com/hars310/devsnap

---

## License

MIT