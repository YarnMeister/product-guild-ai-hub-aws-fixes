import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_EXPIRY = '7d';

// Lazy-initialize JWT_SECRET to avoid top-level throws that crash the
// serverless function before the handler's try/catch can run.
let _jwtSecret: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
  if (!_jwtSecret) {
    const value = process.env.JWT_SECRET;
    if (!value) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    _jwtSecret = new TextEncoder().encode(value);
  }
  return _jwtSecret;
}

export interface TokenPayload {
  userId: number;
  email: string;
  /** UUID of the user — present in tokens issued after the uuid migration */
  uuid?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId === 'number' && typeof payload.email === 'string') {
      return {
        userId: payload.userId,
        email: payload.email,
        // Include uuid if present (tokens issued after uuid migration)
        ...(typeof payload.uuid === 'string' ? { uuid: payload.uuid } : {}),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
