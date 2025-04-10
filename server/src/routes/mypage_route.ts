import { Router } from 'express';
import * as myPageController from '../controllers/myPageController';
import authByToken from '../middlewares/authByToken';

const router = Router();

router.get('/', authByToken, myPageController.getUserInfoController);
router.put('/', authByToken, myPageController.updateUserInfoController);
router.delete('/', authByToken, myPageController.deleteUserController);

export default router;