import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    loginId: string;
    firstName?: string | null;
    lastName?: string | null;
    status: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw createError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.account.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        loginId: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    if (!user) {
      throw createError('Invalid token.', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw createError('Account is locked.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('Access denied. User not authenticated.', 401);
      }

      // Check if user has required roles
      const userRoles = await prisma.accountRole.findMany({
        where: { accountId: req.user.id },
        include: { role: true },
      });

      const userRoleNames = userRoles.map((ur: any) => ur.role.name);

      const hasRequiredRole = roles.some(role => userRoleNames.includes(role));

      if (!hasRequiredRole) {
        throw createError('Access denied. Insufficient permissions.', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
