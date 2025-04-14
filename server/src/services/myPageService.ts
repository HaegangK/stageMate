import pool from "../config/dataBase";
import { createError } from "../utils/error";

export const getUserInfo = async (userId: number) => {
    try {
        const query = `
            SELECT id, email, username, profile_image, wallet_address
            FROM users
            WHERE id = $1
        `;
        
        const result = await pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            throw createError('NotFound', '사용자를 찾을 수 없습니다.', 404);
        }
        
        return result.rows[0];
    } catch (error: any) {
        if (error.name === 'NotFound') throw error;
        throw createError('DBError', '사용자 정보 조회 실패', 500);
    }
};

export const updateUserInfo = async (userId: number, username: string, profileImage?: string) => {
    try {
        const query = `
            UPDATE users 
            SET username = COALESCE($1, username),
                profile_image = COALESCE($2, profile_image)
            WHERE id = $3
            RETURNING id, email, username, profile_image, wallet_address
        `;
        
        const result = await pool.query(query, [username, profileImage, userId]);
        
        if (result.rows.length === 0) {
            throw createError('NotFound', '사용자를 찾을 수 없습니다.', 404);
        }
        
        return result.rows[0];
    } catch (error: any) {
        if (error.name === 'NotFound') throw error;
        throw createError('DBError', '사용자 정보 업데이트 실패', 500);
    }
};

export const deleteUser = async (userId: number) => {
    try {
        const query = `
            DELETE FROM users
            WHERE id = $1
            RETURNING id
        `;
        
        const result = await pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            throw createError('NotFound', '사용자를 찾을 수 없습니다.', 404);
        }
    } catch (error: any) {
        if (error.name === 'NotFound') throw error;
        throw createError('DBError', '사용자 삭제 실패', 500);
    }
};

export const updateWalletAddress = async (userId: number, walletAddress: string) => {
    try {
        // 중복 체크
        const checkQuery = `SELECT id FROM users WHERE wallet_address = $1 AND id != $2`;
        const checkResult = await pool.query(checkQuery, [walletAddress, userId]);
        
        if (checkResult.rows.length > 0) {
            throw createError('Conflict', '이미 사용 중인 지갑 주소입니다.', 409);
        }

        const query = `
            UPDATE users 
            SET wallet_address = $1
            WHERE id = $2
            RETURNING id, email, username, profile_image, wallet_address
        `;
        
        const result = await pool.query(query, [walletAddress, userId]);
        
        if (result.rows.length === 0) {
            throw createError('NotFound', '사용자를 찾을 수 없습니다.', 404);
        }
        
        return result.rows[0];
    } catch (error: any) {
        if (error.name === 'Conflict') throw error;
        throw createError('DBError', '지갑 주소 업데이트 실패', 500);
    }
};

export const connectWallet = async (userId: number, walletAddress: string) => {
    try {
        // 이미 다른 사용자가 사용 중인 지갑 주소인지 확인
        const checkQuery = 'SELECT id FROM users WHERE wallet_address = $1 AND id != $2';
        const checkResult = await pool.query(checkQuery, [walletAddress, userId]);
        
        if (checkResult.rows.length > 0) {
            throw createError('Conflict', '이미 사용 중인 지갑 주소입니다.', 409);
        }

        // 지갑 주소 업데이트
        const updateQuery = `
            UPDATE users 
            SET wallet_address = $1
            WHERE id = $2
            RETURNING wallet_address
        `;
        const result = await pool.query(updateQuery, [walletAddress, userId]);
        
        if (result.rows.length === 0) {
            throw createError('NotFound', '사용자를 찾을 수 없습니다.', 404);
        }

        return result.rows[0];
    } catch (error) {
        console.error('지갑 연결 실패:', error);
        throw error;
    }
};

export const disconnectWallet = async (userId: number) => {
    try {
        // 지갑 주소를 NULL로 설정
        const updateQuery = `
            UPDATE users 
            SET wallet_address = NULL
            WHERE id = $1
            RETURNING id
        `;
        const result = await pool.query(updateQuery, [userId]);
        
        if (result.rows.length === 0) {
            throw createError('NotFound', '사용자를 찾을 수 없습니다.', 404);
        }

        return true;
    } catch (error) {
        console.error('지갑 연결 해제 실패:', error);
        throw error;
    }
};

export const registerEmail = async (userId: number, email: string) => {
    try {
        // 이미 사용 중인 이메일인지 확인
        const checkQuery = 'SELECT id FROM users WHERE email = $1 AND id != $2';
        const checkResult = await pool.query(checkQuery, [email, userId]);
        
        if (checkResult.rows.length > 0) {
            throw createError('Conflict', '이미 사용 중인 이메일입니다.', 409);
        }

        // 이메일 업데이트
        const updateQuery = `
            UPDATE users 
            SET email = $1
            WHERE id = $2
            RETURNING email
        `;
        const result = await pool.query(updateQuery, [email, userId]);
        
        if (result.rows.length === 0) {
            throw createError('NotFound', '사용자를 찾을 수 없습니다.', 404);
        }

        return result.rows[0];
    } catch (error) {
        console.error('이메일 등록 실패:', error);
        throw error;
    }
};