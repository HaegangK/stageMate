import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError, commonError } from '../utils/error';

interface JwtPayload {
  id: number;
  is_admin?: boolean;
}

function getSecretKey(): string {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }
  return secretKey;
}

const authByToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(
      createError(
        commonError.NO_ACCESS_TOKEN.name,
        commonError.NO_ACCESS_TOKEN.message,
        401
      )
    );
  }

  try {
    const secretKey = getSecretKey();
    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    req.user = decoded;
    next();
  } catch (err) {
    next(
      createError(
        commonError.INVALID_TOKEN.name,
        commonError.INVALID_TOKEN.message,
        401
      )
    );
  }
};

export default authByToken;