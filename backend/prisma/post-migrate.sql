-- Run these manually after: npx prisma migrate deploy
-- Prisma does not support GIN indexes natively.

-- Full-text search on note field (enables ?search= query param)
CREATE INDEX IF NOT EXISTS idx_snapshots_note_fts
  ON snapshots USING gin(to_tsvector('english', coalesce(note, '')));

-- Fast exact tag filtering (enables ?tag= query param)
CREATE INDEX IF NOT EXISTS idx_snapshots_tag ON snapshots(tag);
