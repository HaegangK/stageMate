import { Router } from 'express';
import * as myPageController from '../controllers/myPageController';
import authByToken from '../middlewares/authByToken';
import { upload } from '../middlewares/upload';

const router = Router();

router.get('/', authByToken, myPageController.getUserInfoController);
router.put('/', authByToken, upload.single('image'), myPageController.updateUserInfo);
router.delete('/', authByToken, myPageController.deleteUserController);
router.patch('/wallet', authByToken, myPageController.updateWalletAddress);
router.post('/wallet', authByToken, myPageController.connectWalletController);
router.delete('/wallet', authByToken, myPageController.disconnectWalletController);
router.post('/email', authByToken, myPageController.registerEmailController);

export default router;