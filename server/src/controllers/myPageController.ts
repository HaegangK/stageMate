import { Request, Response, NextFunction } from 'express';
import * as myPageService from '../services/myPageService';
import { getUserInfo } from '../services/authService';

export const getUserInfoController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        const user = await getUserInfo(userId);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const updateUserInfoController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.'});
            return;
        }

        const { username, profile_image } = req.body;
        const updatedUserInfo = await myPageService.updateUserInfo(userId, username, profile_image);
        res.status(200).json(updatedUserInfo);
    } catch (error) {
        next(error);
    }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: '로그인이 필요합니다.'});
            return;
        }
        await myPageService.deleteUser(userId);
        res.status(200).json({ message: '사용자 삭제 완료'});
    } catch (error) {
        next(error);
    }
};