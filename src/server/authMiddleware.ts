import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-verifact-jwt-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    // Optional auth - proceed without user
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = db.getUserById(decoded.id);
    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    // Invalid token, but allow request to continue as unauthenticated
    next();
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}
