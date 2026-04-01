import type { VercelRequest, VercelResponse } from '../_types';
import { db } from '../../src/db';
import { users } from '../../src/db/schema';
import { verifyPassword, createToken } from '../../src/lib/auth';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase().trim();

    // Look up user by email
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    // If user not found, return generic error (don't reveal whether email exists)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password against stored hash
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login timestamp
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Generate JWT token — include both integer id (backward compat) and uuid (new authoritative ID)
    const token = await createToken({ userId: user.id, email: user.email, uuid: user.uuid });

    // Return token and user object (exclude sensitive fields)
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        currentRank: user.currentRank,
        joinedAt: user.joinedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

