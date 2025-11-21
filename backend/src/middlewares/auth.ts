// backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import db from '../utils/db';

export const requireAuth = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const decoded = verifyToken(token);
      
      // 🔧 التصحيح: استخدام users
      const user = await db('users')
        .where({ user_id: decoded.sub })
        .first();

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (!user.is_active) {
        return res.status(401).json({ success: false, message: 'User is inactive' });
      }

      // إضافة معلومات المستخدم إلى request
      req.user = {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        customer_id: user.customer_id
      };

      // التحقق من الصلاحيات إذا كانت مطلوبة
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
};