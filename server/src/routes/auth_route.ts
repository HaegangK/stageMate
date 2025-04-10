import { Router } from 'express';
import { 
    socialLoginController, 
    kakaoLoginController, 
    naverLoginController, 
    googleLoginController,
    checkAdminController,
    logoutController,
} from '../controllers/authController';
import authByToken from '../middlewares/authByToken';

const router = Router();

// 카카오 로그인
router.get('/kakao', kakaoLoginController);

// 네이버 로그인
router.get('/naver', naverLoginController);

// 구글 로그인
router.get('/google', googleLoginController);

// 소셜 로그인 콜백
router.get('/:provider/callback', socialLoginController);

// 관리자 권한 체크
router.get('/check-admin', authByToken, checkAdminController);

// 로그아웃
router.post('/logout', logoutController);

// 인증 상태 확인
router.get('/check', authByToken, (req, res) => {
  res.status(200).json({ isAuthenticated: true });
});

export default router;