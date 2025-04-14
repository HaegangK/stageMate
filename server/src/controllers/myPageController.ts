import { Request, Response, NextFunction } from 'express';
import * as myPageService from '../services/myPageService';
import { getUserInfo } from '../services/authService';
import { createError } from '../utils/error';

interface UserRequest extends Request {
  user?: {
    id: number;
  };
}

interface MulterRequest extends UserRequest {
    file?: Express.Multer.File & { 
        location?: string;
        key?: string;
    };
}

export const getUserInfoController = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
    }

    const userInfo = await myPageService.getUserInfo(userId);
    res.status(200).json(userInfo);
  } catch (error) {
    next(error);
  }
};

export const updateUserInfo = async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
    }

    const { username } = req.body;
    const profileImage = req.file?.location;

    if (!username) {
      throw createError('BadRequest', '사용자 이름은 필수입니다.', 400);
    }

    const updatedUser = await myPageService.updateUserInfo(userId, username, profileImage);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
    }

    await myPageService.deleteUser(userId);
    res.status(200).json({ message: '사용자가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
};

export const updateWalletAddress = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
    }

    const { walletAddress } = req.body;
    if (!walletAddress) {
      throw createError('BadRequest', '지갑 주소가 필요합니다.', 400);
    }

    const updatedUser = await myPageService.updateWalletAddress(userId, walletAddress);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const connectWalletController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletAddress } = req.body;
        const userId = req.user?.id;

        if (!walletAddress) {
            throw createError('BadRequest', '지갑 주소가 필요합니다.', 400);
        }
        if (!userId) {
            throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
        }

        const result = await myPageService.connectWallet(userId, walletAddress);
        res.status(200).json({
            message: '지갑 연결 성공',
            walletAddress: result.wallet_address,
        });
    } catch (error) {
        next(error);
    }
};

export const disconnectWalletController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
        }

        await myPageService.disconnectWallet(userId);
        res.status(200).json({
            message: '지갑 연결 해제 성공'
        });
    } catch (error) {
        next(error);
    }
};

export const registerEmailController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const userId = req.user?.id;

        if (!email) {
            throw createError('BadRequest', '이메일 주소가 필요합니다.', 400);
        }
        if (!userId) {
            throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
        }

        const result = await myPageService.registerEmail(userId, email);
        res.status(200).json({
            message: '이메일 등록 성공',
            email: result.email
        });
    } catch (error) {
        next(error);
    }
};