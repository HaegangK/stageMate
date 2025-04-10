import { Request, Response, NextFunction } from 'express';
import  *  as postService from '../services/postService';
import { createError } from '../utils/error';

interface UserRequest extends Request {
  user?: {
    id: number;
    is_admin?: boolean;
  };
}

interface MulterRequest extends UserRequest {
    file?: Express.Multer.File & { 
        location?: string;
        key?: string;
    };
}

export const createPostController = async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
        const { title, content } = req.body;
        const authorId = req.user?.id;
        
        let imageUrl;
        if (req.file) {
            if (req.file.location) {
                imageUrl = req.file.location;
            } else if (req.file.key) {
                imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
            }
        }

        if (!authorId) {
            throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
        }

        if (!title || !content) {
            throw createError('BadRequest', '제목과 내용은 필수입니다.', 400);
        }

        const post = await postService.createPostService(title, content, authorId, imageUrl);
        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};

export const getPostsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        const posts = await postService.getPostsService();
        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
};

export const deletePostController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId } = req.params;
        const parsedId = Number(postId);
        if (isNaN(parsedId)) {
            throw createError('BadRequest', '유효하지 않은 postId입니다.', 400);
        }

        const post = await postService.deletePostService(parsedId);

        res.status(200).json({ message: '게시글이 삭제되었습니다.', post });
    } catch (error) {
        next(error);
    }
};

export const updatePostController = async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
        const { postId } = req.params;
        const parsedId = Number(postId);
        if (isNaN(parsedId)) {
            throw createError('BadRequest', '유효하지 않은 postId입니다.', 400);
        }

        const { title, content } = req.body;
        let imageUrl;
        if (req.file) {
            if (req.file.location) {
                imageUrl = req.file.location;
            } else if (req.file.key) {
                imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
            }
        }

        const post = await postService.updatePostService(parsedId, title, content, imageUrl);
        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

export const getDetailPostController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {postId} = req.params;
        const parsedId = Number(postId);
        if (isNaN(parsedId)) {
            throw createError('BadRequest', '유효하지 않은 postId입니다.', 400);
        }

        const post = await postService.getDetailPostService(parsedId);
        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

export const paginatePostsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        if (isNaN(parsedPage) || isNaN(parsedLimit)) {
            throw createError('BadRequest', '유효하지 않은 페이지 또는 한도입니다.', 400);
        }

        const posts = await postService.paginatePostsService(parsedPage, parsedLimit);
        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
};

export const createCommentsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw createError('Unauthorized', '인증되지 않은 사용자입니다.', 401);
        }
        if (!content) {
            throw createError('BadRequest', '댓글 내용은 필수입니다.', 400);
        }

        const comment = await postService.CreateCommentsService(Number(postId), content, userId);
        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
};

export const getCommentsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId } = req.params;
        const parsedId = Number(postId);
        if (isNaN(parsedId)) {
            throw createError('BadRequest', '유효하지 않은 postId입니다.', 400);
        }

        const comments = await postService.getCommentsService(parsedId);
        res.status(200).json(comments);
    } catch (error) {
        next(error);
    }
};

export const deleteCommentController = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const { commentId } = req.params;
        const parsedId = Number(commentId);
        if (isNaN(parsedId)) {
            throw createError('BadRequest', '유효하지 않은 commentId입니다.', 400);
        }

        const findComment = await postService.getCommentsByIdService(parsedId);
        if (!findComment) {
            throw createError('NotFound', '존재하지 않는 댓글입니다.', 404);
        };

        if (req.user?.id !== findComment.user_id && !req.user?.is_admin) {
            throw createError('Unauthorized', '권한이 없습니다.', 403);
        };

        const comment = await postService.deleteCommentService(parsedId);
        res.status(200).json({ message: '댓글이 삭제되었습니다.', comment });
    } catch (error) {
        next(error);
    }
};
