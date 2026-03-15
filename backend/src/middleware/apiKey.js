import { prisma } from '../db/client.js';

export async function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];

  if (!key) {
    return res.status(401).json({ error: 'Missing x-api-key header' });
  }

  const user = await prisma.user.findUnique({ where: { apiKey: key } });

  if (!user) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.user = user;
  next();
}