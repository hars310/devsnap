# devsnap — Backend

> REST API for devsnap — the dev environment snapshot & diff tool.

Built with Node.js, Express 4, Prisma 5, and PostgreSQL 15. Stores environment snapshots as JSONB and provides a semantic diff engine to compare any two snapshots.

---

## Tech Stack

| | |
|---|---|
| **Runtime** | Node.js 20 |
| **Framework** | Express 4 |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL 15 (JSONB for snapshot storage) |
| **Auth** | API key via `x-api-key` header |
| **Deployment** | Railway |

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15 running locally **or** Docker Desktop

### 1. Clone and install
```bash
cd backend
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://devsnap_user:yourpassword@localhost:5432/devsnap"
PORT=3001
```

### 3. Start Postgres via Docker (recommended)
```bash
docker run --name devsnap-postgres \
  -e POSTGRES_USER=devsnap_user \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=devsnap \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Run migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run GIN indexes
```bash
# Mac/Linux
psql $DATABASE_URL < prisma/post-migrate.sql

# Windows PowerShell
Get-Content prisma\post-migrate.sql | docker exec -i devsnap-postgres psql -U devsnap_user -d devsnap
```

### 6. Start the server
```bash
npm run dev
```

Server runs at `http://localhost:3001`

### 7. Test
```bash
curl http://localhost:3001/health
# {"ok":true}
```

---

## API Reference

All endpoints except `POST /api/auth/register` require the header:
```
x-api-key: <your-api-key>
```

All responses are JSON. All errors return `{ "error": "string" }`.

---

### Auth

#### `POST /api/auth/register`
Create a new user and get an API key.

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com"}'
```

```json
{
  "api_key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "email": "you@example.com"
}
```

---

### Snapshots

#### `POST /api/snapshots`
Save a new snapshot (called by CLI after capture).

```json
{
  "tag": "broke here",
  "note": "postgres not starting",
  "data": { }
}
```

Response `201`:
```json
{
  "id": "uuid",
  "created_at": "2026-03-15T10:23:45Z"
}
```

---

#### `GET /api/snapshots`
List snapshots with optional filters.

```
GET /api/snapshots?tag=broke+here
GET /api/snapshots?search=postgres
GET /api/snapshots?limit=20&offset=0
```

---

#### `GET /api/snapshots/:id`
Get a single snapshot with full data payload.

---

#### `DELETE /api/snapshots/:id`
Delete a snapshot. Owner only.

---

### Diff

#### `GET /api/diff?a=<id1>&b=<id2>`
Semantic diff between two snapshots. Both must belong to the authenticated user.

```json
{
  "snapshot_a": { "id": "...", "tag": "broke here", "created_at": "..." },
  "snapshot_b": { "id": "...", "tag": "fixed", "created_at": "..." },
  "diff": {
    "runtimes": {
      "node": { "a": "18.17.0", "b": "20.11.0", "changed": true }
    },
    "env_keys": {
      "added": ["DATABASE_URL"],
      "removed": ["OLD_DB_URL"]
    },
    "packages": {
      "npm_global": { "added": [], "removed": [], "changed": [] },
      "pip_global": { "added": [], "removed": [], "changed": [] }
    },
    "ports": { "added": [6379], "removed": [] },
    "git": { "branch_changed": true, "branch_a": "main", "branch_b": "fix/x" },
    "system": {},
    "has_changes": true
  }
}
```

---

## Project Structure

```
backend/
├── .env.example
├── package.json
├── prisma/
│   ├── schema.prisma         ← User + Snapshot models
│   └── post-migrate.sql      ← GIN indexes (run manually after migrate)
└── src/
    ├── index.js              ← Express app entry point
    ├── db/
    │   └── client.js         ← Prisma singleton
    ├── middleware/
    │   └── apiKey.js         ← x-api-key validation
    ├── routes/
    │   ├── auth.js           ← POST /api/auth/register
    │   ├── snapshots.js      ← CRUD routes
    │   └── diff.js           ← GET /api/diff
    └── lib/
        └── diff.js           ← Semantic diff engine
```

---

## Database Schema

```prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  apiKey    String     @unique @default(uuid())
  createdAt DateTime   @default(now())
  snapshots Snapshot[]
}

model Snapshot {
  id        String   @id @default(uuid())
  userId    String
  tag       String?
  note      String?
  data      Json     // JSONB — full environment payload
  createdAt DateTime @default(now())
}
```

---

## Prisma Commands

```bash
npx prisma generate        # regenerate client after schema changes
npx prisma migrate dev     # create and apply a new migration (dev)
npx prisma migrate deploy  # apply migrations in production (Railway)
npx prisma studio          # open browser GUI to browse DB
```

---

## Deployment (Railway)

1. Push repo to GitHub
2. Go to **railway.app** → New Project → Deploy from GitHub
3. Set root directory to `backend/`
4. Add **PostgreSQL** plugin — Railway auto-sets `DATABASE_URL`
5. Set environment variable: `PORT=3001`
6. After deploy, run migrations:
```bash
railway run npx prisma migrate deploy
```
7. Run GIN indexes:
```bash
railway run psql $DATABASE_URL < prisma/post-migrate.sql
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Port to run the server on (default: 3001) |

---

## Links

- **CLI:** https://www.npmjs.com/package/@harshcode/devsnap
- **Frontend:** https://your-vercel-url.vercel.app
- **GitHub:** https://github.com/hars310/devsnap