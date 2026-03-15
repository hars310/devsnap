# devsnap

**Capture and diff your dev environment.**

One command snapshots your full environment — runtimes, packages, env keys, git state, open ports. Any two snapshots can be diffed to show exactly what changed. Share diffs via a link.

> Built as a portfolio project demonstrating CLI tooling, REST API design, semantic diff engines, and full-stack deployment.

---

## Demo

> 📸 _Add a screenshot or GIF of the dashboard here before publishing_

---

## Quick Install

```bash
npm install -g @harshcode/devsnap
```

Requires Node 18+. Works on macOS, Linux, and Windows.

---

## Quickstart

```bash
# 1. Register and get your API key
curl -X POST https://your-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com"}'

# 2. Authenticate the CLI
devsnap auth --key YOUR_API_KEY

# 3. Take a snapshot before making a change
devsnap capture --tag "before"

# 4. Make your change (install something, switch branches, etc.)
# ...then take another snapshot
devsnap capture --tag "after"

# 5. Diff them
devsnap diff <id1> <id2>
```

---

## Architecture

```
┌─────────────────────────┐
│     Developer Machine   │
│  ┌───────────────────┐  │
│  │   devsnap CLI     │  │
│  │  (npm package)    │  │
│  └────────┬──────────┘  │
└───────────┼─────────────┘
            │ POST /api/snapshots
            │ GET  /api/diff
            ▼
┌─────────────────────────┐
│   Backend (Railway)     │
│   Express + Prisma      │
│   PostgreSQL (JSONB)    │
└───────────┬─────────────┘
            │ REST API
            ▼
┌─────────────────────────┐
│   Dashboard (Vercel)    │
│   React + Tailwind      │
│   Snapshot list & diff  │
└─────────────────────────┘
```

---

## What Gets Captured

Every snapshot is a full picture of your environment at that moment.

| Collector | What it captures |
|-----------|-----------------|
| **Runtimes** | Node, npm, Python, pip, Go, Rust, Java, Ruby versions |
| **npm packages** | All globally installed npm packages |
| **pip packages** | All globally installed pip packages |
| **Env keys** | Environment variable key names only — values are never stored |
| **Git** | Current branch, dirty flag, last 5 commits |
| **Ports** | All TCP LISTEN ports on your machine |
| **System** | OS, architecture, CPU cores, memory, shell |

---

## Example Snapshot

```json
{
  "system": {
    "os": "win32",
    "os_version": "10.0.22631",
    "arch": "x64",
    "hostname": "DESKTOP-ABC123",
    "cpu_cores": 8,
    "memory_gb": 16,
    "shell": null
  },
  "runtimes": {
    "node": "22.0.0",
    "npm": "10.5.0",
    "python": "3.11.7",
    "pip": "23.3.1",
    "go": null,
    "rust": "1.76.0",
    "java": null,
    "ruby": null
  },
  "packages": {
    "npm_global": ["typescript@5.4.2", "nodemon@3.1.0", "prisma@5.9.1"],
    "pip_global": ["requests==2.31.0", "black==24.1.1"]
  },
  "env_keys": ["DATABASE_URL", "NODE_ENV", "PORT", "OPENAI_API_KEY"],
  "git": {
    "branch": "main",
    "dirty": false,
    "commits": [
      {
        "hash": "a3f9b12",
        "message": "fix: increase payment timeout",
        "author": "Harsh Kumar",
        "ago": "2 hours ago"
      }
    ]
  },
  "ports": [3000, 5432],
  "captured_at": "2025-03-15T10:23:45Z"
}
```

---

## Example Diff Output

```
Comparing snapshots:
  A a3f9b12c [before]  3/15/2025, 10:20:00 AM
  B e6d8ee8f [after]   3/15/2025, 10:25:00 AM

Runtimes
  ■ node: 22.0.0
  ■ npm: 10.5.0
~ rust: null → 1.76.0

npm Packages (global)
+ nodemon@3.1.0
+ typescript@5.4.2

pip Packages (global)
  No changes.

Open Ports
  No changes.

Git
  Branch unchanged: main

System
  No changes.
```

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `devsnap capture` | Snapshot current environment |
| `devsnap capture --tag <tag>` | Snapshot with a label (e.g. `"broke here"`) |
| `devsnap capture --note <note>` | Snapshot with a free-text note |
| `devsnap list` | List your 10 most recent snapshots |
| `devsnap list --limit <n>` | List up to n snapshots |
| `devsnap diff <id1> <id2>` | Diff two snapshots by ID |
| `devsnap auth --key <key>` | Save your API key locally |
| `devsnap auth --key <key> --url <url>` | Save API key + custom backend URL |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| CLI | Node.js, Commander, Chalk, Ora, Axios |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL with JSONB snapshot storage |
| Frontend | React, Vite, Tailwind CSS, React Router |
| CLI deploy | npm registry |
| Backend deploy | Railway |
| Frontend deploy | Vercel |

---

## Local Development

### Prerequisites

- Node 18+
- PostgreSQL running locally
- npm

### Backend

```bash
cd backend
npm install

# Create .env
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/devsnap"' > .env
echo 'PORT=3001' >> .env

# Run migrations
npx prisma migrate deploy
npx prisma generate

# Start
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Create .env
echo 'VITE_API_URL=http://localhost:3001' > .env

# Start
npm run dev
```

### CLI (local testing)

```bash
cd cli
npm install

# Run directly without installing globally
node src/index.js auth --key YOUR_KEY --url http://localhost:3001
node src/index.js capture --tag "test"
node src/index.js list
```

---

## Deployment

| Service | Platform | Docs |
|---------|----------|------|
| Backend | Railway | Point root to `backend/`, add PostgreSQL plugin, set `PORT=3001`, run `npx prisma migrate deploy` |
| Frontend | Vercel | Point root to `frontend/`, set `VITE_API_URL` env var |
| CLI | npm | `npm publish --access public` from `cli/` |

---

## Live Links

- 🌐 **Dashboard:** [devsnap-frontend.vercel.app](https://devsnap-frontend.vercel.app)
- 📦 **npm:** [npmjs.com/package/@harshcode/devsnap](https://www.npmjs.com/package/@harshcode/devsnap)
- 💻 **GitHub:** [github.com/hars310/devsnap](https://github.com/hars310/devsnap)

---

## Project Structure

```
devsnap/
├── cli/                          # Published to npm as @harshcode/devsnap
│   └── src/
│       ├── index.js              # Entry point + command router
│       ├── commands/             # capture, diff, list, auth
│       └── collectors/           # system, runtimes, packages, env, git, ports
│
├── backend/                      # Deployed on Railway
│   └── src/
│       ├── index.js              # Express app
│       ├── routes/               # snapshots, diff, auth
│       ├── middleware/           # API key validation
│       ├── lib/diff.js           # Semantic diff engine
│       └── db/client.js          # Prisma singleton
│
└── frontend/                     # Deployed on Vercel
    └── src/
        ├── pages/                # Dashboard, SnapshotDetail, DiffView, HomePage
        └── components/           # SnapshotCard, DiffTable, SearchBar
```

---

## Why JSONB?

Snapshot payloads are schema-flexible by design. Adding a new collector (e.g. Docker containers, Homebrew packages) requires no database migration — new fields land in the JSON column automatically. PostgreSQL JSONB gives the storage flexibility of a document store with the query power of a relational database. A GIN index on the `note` field enables full-text search.

## How the Diff Works

The diff engine is custom-written rather than using a generic JSON diff library. For runtimes it does a key-by-key comparison returning `{ a, b, changed }` per runtime. For packages it parses `name@version` strings, builds a name-keyed map for each side, then computes added/removed/changed separately — "changed" means the same package name exists on both sides but with a different version. This structured output is what makes the dashboard useful: instead of a wall of red/green lines, you see "Rust was installed, nodemon was added, DATABASE_URL env key appeared."

---

_Built by [Harsh Kumar](https://github.com/hars310)_