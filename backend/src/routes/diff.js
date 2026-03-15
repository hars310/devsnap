import { Router } from 'express';
import { prisma } from '../db/client.js';
import { requireApiKey } from '../middleware/apiKey.js';
import { diffSnapshots } from '../lib/diff.js';

export const diffRoutes = Router();

diffRoutes.use(requireApiKey);

// GET /api/diff?a=<id1>&b=<id2>
// Both snapshots must belong to the authenticated user.
diffRoutes.get('/', async (req, res) => {
  const { a, b } = req.query;

  if (!a || !b) {
    return res.status(400).json({ error: 'Query params a and b (snapshot IDs) are required' });
  }

  if (a === b) {
    return res.status(400).json({ error: 'Snapshot IDs must be different' });
  }

  const [snapA, snapB] = await Promise.all([
    prisma.snapshot.findUnique({ where: { id: a } }),
    prisma.snapshot.findUnique({ where: { id: b } }),
  ]);

  if (!snapA) return res.status(404).json({ error: `Snapshot not found: ${a}` });
  if (!snapB) return res.status(404).json({ error: `Snapshot not found: ${b}` });

  // Ownership check — both must belong to the requesting user
  if (snapA.userId !== req.user.id || snapB.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not your snapshot' });
  }

  const diff = diffSnapshots(snapA, snapB);

  res.json({
    snapshot_a: {
      id: snapA.id,
      tag: snapA.tag,
      created_at: snapA.createdAt,
    },
    snapshot_b: {
      id: snapB.id,
      tag: snapB.tag,
      created_at: snapB.createdAt,
    },
    diff,
  });
});