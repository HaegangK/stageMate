import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { createError } from '../utils/error';
import pool from '../config/dataBase';

export const kakaoLoginController = (req: Request, res: Response) => {
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
    res.redirect(KAKAO_AUTH_URL);
};

export const naverLoginController = (req: Request, res: Response) => {
    const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=${process.env.NAVER_STATE}`;
    res.redirect(NAVER_AUTH_URL);
};

export const googleLoginController = (req: Request, res: Response) => {
    const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile`;
    res.redirect(GOOGLE_AUTH_URL);
};

export const socialLoginController = async (
    req: Request<{provider: 'kakao' | 'naver' | 'google'}, {}, {}, {code: string; state?: string}>, 
    res: Response, 
    next: NextFunction) => {
    try {
        const { code, state } = req.query;
        const { provider } = req.params;
        if (!provider || typeof provider !== 'string') {
            throw createError('ValidationError', '유효하지 않은 소셜 로그인입니다.', 400);
        }
        if (!code || typeof code !== 'string') {
            throw createError('ValidationError', '유효하지 않은 코드입니다.', 400);
        }

        let result;
        if (provider === 'kakao') {
            result = await authService.kakaoLogin(code);
        } else if (provider === 'naver') {
            if (!state || state !== process.env.NAVER_STATE) {
                throw createError('ValidationError', '유효하지 않은 상태입니다.', 400);
            }
            result = await authService.naverLogin(code, state);
        } else if (provider === 'google') {
            result = await authService.googleLogin(code);
        } else {
            throw createError('ValidationError', '지원하지 않는 소셜 로그인입니다.', 400);
        }
        
        if (!result) {
            throw createError('NotFound', '소셜 로그인에 실패했습니다.', 404);
        }

        if (result.message) {
            res.status(400).redirect(`${process.env.FRONTEND_URL}/login?message=${result.message}`);
        } else {
            res.cookie('jwt', result.token, { httpOnly: true });
            res.cookie('refreshToken', result.refreshToken, { httpOnly: true });
            res.status(302).redirect(`${process.env.FRONTEND_URL}/`);
        }
    } catch (error: any) {
        console.error('[ERROR] 토큰 요청 실패:', error.response?.data || error.message);
        next(error);
    }
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: '로그아웃 성공' });
    } catch (error: any) {
        next(error);
    }
}

export const checkAdminController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
        }

        const query = 'SELECT is_admin FROM users WHERE id = $1';
        const result = await pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            throw createError('NotFound', '사용자를 찾을 수 없습니다.', 404);
        }

        const isAdmin = result.rows[0].is_admin;
        res.status(200).json({ isAdmin });
    } catch (error) {
        next(error);
    }
};

export const requestNonceController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletAddress } = req.body;
        
        if (!walletAddress) {
            throw createError('BadRequest', '지갑 주소가 필요합니다.', 400);
        }

        // 지갑 주소가 이미 다른 사용자에 의해 사용 중인지 확인
        const checkWalletQuery = 'SELECT * FROM users WHERE wallet_address = $1';
        const walletResult = await pool.query(checkWalletQuery, [walletAddress]);
        
        if (walletResult.rows.length > 0) {
            throw createError('Conflict', '이미 사용 중인 지갑 주소입니다.', 409);
        }
        
        const nonce = await authService.generateNonce(walletAddress);
        res.status(200).json({ nonce });
    } catch (error) {
        next(error);
    }
};

export const verifySignatureController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletAddress, signature } = req.body;
        
        if (!walletAddress || !signature) {
            throw createError('BadRequest', '지갑 주소와 서명이 필요합니다.', 400);
        }

        // 지갑 주소가 이미 다른 사용자에 의해 사용 중인지 확인
        const checkWalletQuery = 'SELECT * FROM users WHERE wallet_address = $1';
        const walletResult = await pool.query(checkWalletQuery, [walletAddress]);
        
        if (walletResult.rows.length > 0) {
            throw createError('Conflict', '이미 사용 중인 지갑 주소입니다.', 409);
        }

        // 서명 검증
        const isValid = await authService.verifySignature(walletAddress, signature);
        if (!isValid) {
            throw createError('Unauthorized', '잘못된 서명입니다.', 401);
        }

        res.status(200).json({ 
            message: '서명이 확인되었습니다.'
        });
    } catch (error) {
        next(error);
    }
};

export const checkAuthController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
        }
        const userInfo = await authService.getUserInfo(userId);
        res.status(200).json(userInfo);
    } catch (error) {
        next(error);
    }
};