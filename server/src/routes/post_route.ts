import { Router } from 'express';
// import { 
//     createPostController, getPostsController, deletePostController, updatePostController, getDetailPostController, paginatePostsController, createCommentsController, getCommentsController, deleteCommentController 
// } from '../controllers/postController';
import * as postController from '../controllers/postController';
import { checkAdmin } from '../middlewares/checkAdmin';
import authByToken from '../middlewares/authByToken';
import { upload } from '../middlewares/upload';

const router = Router();

// 게시글 목록 조회 (기본)
router.get('/', postController.getPostsController);

// 게시글 페이지네이션 조회
router.get('/paginate', postController.paginatePostsController);

// 게시글 작성 (관리자 전용)
router.post('/admin', authByToken, checkAdmin, upload.single('image'), postController.createPostController);

// 게시글 삭제 (관리자 전용)
router.delete('/admin/:postId', authByToken, checkAdmin, postController.deletePostController);

// 게시글 수정 (관리자 전용)
router.put('/admin/:postId', authByToken, checkAdmin, upload.single('image'), postController.updatePostController);

// 댓글 생성
router.post('/:postId/comments', authByToken, postController.createCommentsController);

// 댓글 조회
router.get('/:postId/comments', postController.getCommentsController);

// 댓글 삭제
router.delete('/:postId/comments/:commentId', authByToken, postController.deleteCommentController);

// 게시글 상세 조회 (가장 마지막에 위치)
router.get('/:postId', postController.getDetailPostController);

export default router;