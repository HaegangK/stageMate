import { Router } from 'express';
import { 
    socialLoginController, 
    kakaoLoginController, 
    naverLoginController, 
    googleLoginController,
    checkAdminController,
    logoutController,
    requestNonceController,
    verifySignatureController,
    checkAuthController
} from '../controllers/authController';
import authByToken from '../middlewares/authByToken';
import * as authService from '../services/authService';
import { RequestHandler } from 'express';

const router = Router();

// 카카오 로그인
router.get('/kakao', kakaoLoginController);

// 네이버 로그인
router.get('/naver', naverLoginController);

// 구글 로그인
router.get('/google', googleLoginController);

// 소셜 로그인 콜백
router.get('/:provider/callback', socialLoginController);

// 관리자 권한 확인
router.get('/admin', authByToken, checkAdminController);

// 로그아웃
router.post('/logout', logoutController);

// 인증 상태 확인 (사용자 정보 반환)
router.get('/check', authByToken, checkAuthController);

// Metamask 로그인 관련 라우트
router.post('/nonce', requestNonceController);
router.post('/verify', verifySignatureController);

export default router;