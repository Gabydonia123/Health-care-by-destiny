/**
 * Community Health Report System (CHRS) - Authentication & RBAC Middleware
 */

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../src/types';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'chrs_nigeria_jwt_super_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Generate a signed JWT token
 */
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Express middleware to verify JWT token from Authorization header
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists or session expired' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

/**
 * Express middleware to enforce Role-Based Access Control (RBAC)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(401).json({
        error: `Access restricted to [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
}
