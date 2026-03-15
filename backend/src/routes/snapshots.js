import { Router } from 'express';
import { prisma } from '../db/client.js';
import { requireApiKey } from '../middleware/apiKey.js';

export const snapshotRoutes = Router();

// All snapshot routes require auth
snapshotRoutes.use(requireApiKey);

// POST /api/snapshots — save a new snapshot
snapshotRoutes.post('/', async (req, res) => {
  const { tag, note, data } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'data is required' });
  }

  const snapshot = await prisma.snapshot.create({
    data: {
      userId: req.user.id,
      tag: tag ?? null,
      note: note ?? null,
      data,
    },
  });

  res.status(201).json({
    id: snapshot.id,
    created_at: snapshot.createdAt,
  });
});

// GET /api/snapshots — list with optional filters
snapshotRoutes.get('/', async (req, res) => {
  const { tag, search, limit = 20, offset = 0 } = req.query;

  const where = { userId: req.user.id };

  if (tag) where.tag = tag;

  // Use Prisma contains for basic search; GIN index makes it fast at scale
  if (search) {
    where.note = { contains: search, mode: 'insensitive' };
  }

  const [snapshots, total] = await Promise.all([
    prisma.snapshot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 100),
      skip: Number(offset),
      select: {
        id: true,
        tag: true,
        note: true,
        createdAt: true,
        data: true, // needed to build summary — trimmed in response
      },
    }),
    prisma.snapshot.count({ where }),
  ]);

  // Build lightweight summary — don't send full data payload in list
  const result = snapshots.map(s => ({
    id: s.id,
    tag: s.tag,
    note: s.note,
    created_at: s.createdAt,
    summary: {
      os: s.data.system?.os ?? null,
      node: s.data.runtimes?.node ?? null,
      branch: s.data.git?.branch ?? null,
      ports_count: s.data.ports?.length ?? 0,
    },
  }));

  res.json({ snapshots: result, total });
});

// GET /api/snapshots/:id — full snapshot including data payload
snapshotRoutes.get('/:id', async (req, res) => {
  const snapshot = await prisma.snapshot.findUnique({
    where: { id: req.params.id },
  });

  if (!snapshot) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }

  if (snapshot.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not your snapshot' });
  }

  res.json({
    id: snapshot.id,
    tag: snapshot.tag,
    note: snapshot.note,
    data: snapshot.data,
    created_at: snapshot.createdAt,
  });
});

// DELETE /api/snapshots/:id — owner only
snapshotRoutes.delete('/:id', async (req, res) => {
  const snapshot = await prisma.snapshot.findUnique({
    where: { id: req.params.id },
  });

  if (!snapshot) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }

  if (snapshot.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not your snapshot' });
  }

  await prisma.snapshot.delete({ where: { id: req.params.id } });

  res.json({ deleted: true });
});