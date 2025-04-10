import { Request, Response, NextFunction } from 'express';
import { kakaoLogin, naverLogin, googleLogin } from '../services/authService';
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
            result = await kakaoLogin(code);
        } else if (provider === 'naver') {
            if (!state || state !== process.env.NAVER_STATE) {
                throw createError('ValidationError', '유효하지 않은 상태입니다.', 400);
            }
            result = await naverLogin(code, state);
        } else if (provider === 'google') {
            result = await googleLogin(code);
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