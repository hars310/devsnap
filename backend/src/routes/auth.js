import { Router } from 'express';
import { prisma } from '../db/client.js';

export const authRoutes = Router();

// POST /api/auth/register
// Creates a new user and returns their API key.
// Called once during: devsnap auth --email you@example.com
authRoutes.post('/register', async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await prisma.user.create({
      data: { email: normalizedEmail },
    });

    return res.status(201).json({
      api_key: user.apiKey,
      email: user.email,
    });
  } catch (err) {
    // Prisma unique constraint violation code
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw err;
  }
});