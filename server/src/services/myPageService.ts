import pool from "../config/dataBase";
import { createError } from "../utils/error";

export const updateUserInfo = async (userId: number, username: string, profileImage: string) => {
    try {
        const query = `UPDATE users SET username = $1, profile_image = $2 WHERE id = $3`;
        await pool.query(query, [username, profileImage, userId]);
    } catch (error) {
        console.error('사용자 정보 업데이트 오류:', error);
        throw createError('DBError', '데이터베이스 오류', 500);
    }
}

export const deleteUser = async (userId: number) => {
    try {
        const query = `DELETE FROM users WHERE id = $1`;
        await pool.query(query, [userId]);
    } catch (error) {
        console.error('사용자 삭제 오류:', error);
        throw createError('DBError', '데이터베이스 오류', 500);
    }
}
