import pool from '../config/dataBase';
import { createError } from '../utils/error';

export const createPostService = async (title: string, content: string, authorId: number, imageUrl?: string) => {
    try {
        const query = `
            INSERT INTO posts (author_id, title, content, image_url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [authorId, title, content, imageUrl];
        const result = await pool.query(query, values);

        return result.rows[0];
    } catch (error) {
        console.error('createPost Error: ', error);
        throw createError('DBError', '데이터베이스 오류', 500);
    }
};

export const getPostsService = async () => {
    try {
        const query = `
            SELECT p.*, u.username
            FROM posts p
            JOIN users u ON p.author_id = u.id
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('getPosts Error: ', error);
        throw createError('DBError', '게시글 목록 조회 실패', 500);
    }
};

export const deletePostService = async (postId: number) => {
    try {
        if (isNaN(postId)) {
            throw createError('BadRequest', 'postId가 숫자가 아닙니다.', 400);
        }

        const query = `DELETE FROM posts WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [postId]);

        if (result.rows.length === 0) {
            throw createError('NotFound', '게시글을 찾을 수 없습니다.', 404);
        }

        return result.rows[0];
    } catch (error) {
        console.error('[deletePostService] 에러:', error);
        throw createError('DBError', '게시글 삭제 실패', 500);
    }
};

export const updatePostService = async (postId: number, title: string, content: string, imageUrl?: string) => {
    try {
        const query = ` UPDATE posts SET title = $1, content = $2, image_url= $3 WHERE id = $4 RETURNING *`;
        const values = [title, content, imageUrl, postId];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw createError('NotFound', '게시글을 찾을 수 없습니다.', 404);
        }
        return result.rows[0];
    } catch (error) {
        throw createError('DBError', '게시글 수정 실패', 500);
    }
};

export const getDetailPostService = async (postId: number) => {
    try {
        const query = `SELECT p.*, u.username FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = $1`;
        const result = await pool.query(query, [postId]);

        if (result.rows.length === 0) {
            throw createError('NotFound', '게시글을 찾을 수 없습니다.', 404);
        }
        return result.rows[0];
    } catch (error) {
        throw createError('DBError', '게시글 상세 조회 실패', 500);
    }
};

export const paginatePostsService = async (page: number, limit: number) => {
    try {
        const offset = (page - 1) * limit;
        
        // 총 게시글 수 조회
        const countQuery = `SELECT COUNT(*) FROM posts`;
        const countResult = await pool.query(countQuery);
        const totalPosts = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalPosts / limit);

        // 게시글 목록 조회
        const query = `
            SELECT p.*, u.username
            FROM posts p
            JOIN users u ON p.author_id = u.id
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const values = [limit, offset];
        const result = await pool.query(query, values);
        
        return {
            posts: result.rows,
            totalPages,
            currentPage: page
        };
    } catch (error) {
        throw createError('DBError', '게시글 페이지네이션 조회 실패', 500);
    }
};

export const CreateCommentsService = async (postId: number, content: string, userId: number) => {
    try {
        const query = `INSERT INTO comments (post_id, content, user_id) VALUES ($1, $2, $3) RETURNING *`;
        const result = await pool.query(query, [postId, content, userId]);
        return result.rows[0];
    } catch (error) {
        throw createError('DBError', '댓글 생성 실패', 500);
    }
};

export const getCommentsService = async (postId: number) => {
    try {
        const query = `SELECT c.id, c.content, c.created_at, u.username
                        FROM comments c
                        JOIN users u ON c.user_id = u.id
                        WHERE c.post_id = $1
                        ORDER BY c.created_at DESC`;
        const result = await pool.query(query, [postId]);
        return result.rows;
    } catch (error) {
        throw createError('DBError', '댓글 조회 실패', 500);
    }
};

export const deleteCommentService = async (commentId: number) => {
    try {
        const query = `DELETE FROM comments WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [commentId]);
        
        if (result.rows.length === 0) {
            throw createError('Not Found', '댓글을 찾을 수 없습니다.', 404);
        }
        return result.rows[0];
    } catch (error) {
        throw createError('DBError', '댓글 삭제 실패', 500);
    }
};

export const getCommentsByIdService = async (commentId: number) => {
    const query = `SELECT * FROM comments WHERE id = $1`;
    const result = await pool.query(query, [commentId]);
    return result.rows[0];
};