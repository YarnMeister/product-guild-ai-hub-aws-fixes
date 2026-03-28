import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/db';
import { users } from '../../src/db/schema';
import { hashPassword, createToken } from '../../src/lib/auth';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email domain (must be @rea-group.com)
    const emailDomainRegex = /^[^\s@]+@rea-group\.com$/i;
    if (!emailDomainRegex.test(email)) {
      return res.status(400).json({ error: 'Please check email address, only company emails accepted' });
    }

    // Validate password minimum length
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Normalize email to lowercase to prevent case-sensitive duplicates
    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate email
    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user with rank 1
    const [newUser] = await db.insert(users).values({
      name,
      email: normalizedEmail,
      passwordHash,
      currentRank: 1,
    }).returning({
      id: users.id,
      uuid: users.uuid,
      name: users.name,
      email: users.email,
      currentRank: users.currentRank,
      joinedAt: users.joinedAt,
    });

    // Generate JWT token — include both integer id (backward compat) and uuid (new authoritative ID)
    const token = await createToken({ userId: newUser.id, email: newUser.email, uuid: newUser.uuid });

    // Return token and user object
    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        uuid: newUser.uuid,
        name: newUser.name,
        email: newUser.email,
        currentRank: newUser.currentRank,
        joinedAt: newUser.joinedAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

