import type { VercelRequest, VercelResponse } from '../_types';
import { db } from '../../src/db';
import { users } from '../../src/db/schema';
import { verifyToken, getTokenFromHeader } from '../../src/lib/auth';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = getTokenFromHeader(authHeader || null);

    if (!token) {
      return res.status(401).json({ user: null });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return res.status(401).json({ user: null });
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        currentRank: users.currentRank,
        joinedAt: users.joinedAt,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({ user: null });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

