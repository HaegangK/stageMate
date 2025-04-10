import { Request, Response, NextFunction } from 'express';
import pool from '../config/dataBase';
import { createError } from '../utils/error';

  export const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw createError('Unauthorized', '유저 정보가 없습니다.', 401);
      }
  
      const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
      const isAdmin = result.rows[0]?.is_admin;

      if (!isAdmin) {
        throw createError('Unauthorized', '관리자 권한이 없습니다.', 403);
      }
  
      next();
    } catch (error) {
      next(error);
    }
  };

