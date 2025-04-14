import jwt from 'jsonwebtoken';
import pool from '../config/dataBase';
import { User } from '../models/user';
import axios from 'axios';
import { createError } from '../utils/error';
import { recoverPersonalSignature } from '@metamask/eth-sig-util'; // 필수 패키지
import { bufferToHex } from 'ethereumjs-util';

interface kakaoTokenResponse {
  access_token: string;
}

interface naverTokenResponse {
  access_token: string;
}

interface googleTokenResponse {
  access_token: string;
}

interface kakaoUserInfoResponse {
  id: string;
  kakao_account: {
    email: string | null;
    profile: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
  properties: {
    nickname?: string;
    profile_image?: string;
  };
}

interface naverUserInfoResponse {
  response: {
    id: string;
    email: string;
    name: string;
    nickname?: string;
    profile_image?: string;
  }
}

interface googleUserInfoResponse {
  id: string;
  email: string;
  name: string;
}

interface decoded {
  id: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw createError(
    'EnvironmentError',
    '환경 변수가 설정되지 않았습니다.',
    500,
  );
}

export const kakaoLogin = async (code: string) => {
  try {
      const tokenResponse = await axios.post<kakaoTokenResponse>(
        'https://kauth.kakao.com/oauth/token',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_CLIENT_ID,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
            code,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

    const userInfoResponse = await axios.get<kakaoUserInfoResponse>(
      'https://kapi.kakao.com/v2/user/me',
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      },
    );

    const { id, kakao_account, properties } = userInfoResponse.data;
    const email = kakao_account.email ?? null;
    const username = properties.nickname ?? kakao_account.profile.nickname;
    const profileImage =
      properties.profile_image ?? kakao_account.profile.profile_image_url;

    if (!email) {
      throw createError(
        'kakaoAuthError',
        `카카오에서 정보가 충분하지 않습니다.`,
        400,
      );
    }

    // 이메일로 사용자 확인
    const checkEmailQuery = `SELECT id, username, kakaoid, naverid, googleid, is_admin FROM users WHERE email = $1`;
    const checkEmailResult = await pool.query(checkEmailQuery, [email]);

    let user;
    if (checkEmailResult.rows.length > 0) {
      user = checkEmailResult.rows[0];
      if (!user.kakaoid) {
        // 다른 소셜 계정으로 가입된 경우
        if (user.naverid || user.googleid) {
          return {
            message: '이미 다른 소셜 계정으로 가입된 이메일입니다.',
          };
        }
        // 소셜 계정 연결
        await pool.query(
          `UPDATE users SET kakaoid = $1 WHERE email = $2`,
          [id, email],
        );
      }
    } else {
      // 새 사용자 등록
      const createUserQuery = `
        INSERT INTO users (email, kakaoid, username, profile_image, is_admin) 
        VALUES ($1, $2, $3, $4, false) 
        RETURNING *
      `;
      const createUserResult = await pool.query(createUserQuery, [
        email,
        id,
        username,
        profileImage,
      ]);
      user = createUserResult.rows[0];
    }

    // 토큰 생성
    const payload = { 
      id: user.id,
      is_admin: Boolean(user.is_admin)
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    return {
      token,
      refreshToken,
    };
    
  } catch (error) {
    if (error instanceof Error && error.name === 'kakaoAuthError') {
      throw error;
    }
    throw createError('SocialLoginError', '소셜 로그인 실패', 400);
  }
};

export const naverLogin = async (code: string, state: string) => {
  const naverTokenUrl = `https://nid.naver.com/oauth2.0/token`;

  try {
    const tokenResponse = await axios.post<naverTokenResponse>(
      naverTokenUrl,
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.NAVER_CLIENT_ID,
          client_secret: process.env.NAVER_CLIENT_SECRET,
          code,
          state,
          redirect_uri: process.env.NAVER_REDIRECT_URI,
        },
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded',
        },
      });

      const userInfoResponse = await axios.get<naverUserInfoResponse>(
        `https://openapi.naver.com/v1/nid/me`,
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`,
          },
        });

        const { id, email, name, nickname, profile_image } = userInfoResponse.data.response;

        if (!email) {
          throw createError('naverAuthError', '네이버에서 정보가 충분하지 않습니다.', 400);
        }

        const checkEmailQuery = `SELECT id, username, kakaoid, naverid, googleid, is_admin FROM users WHERE email = $1`;
        const checkEmailResult = await pool.query(checkEmailQuery, [email]);

        let user;
        if (checkEmailResult.rows.length > 0) {
          user = checkEmailResult.rows[0];
          if (!user.naverid) {
            // 다른 소셜 계정으로 가입된 경우
            if (user.kakaoid || user.googleid) {
              return {
                message: '이미 다른 소셜 계정으로 가입된 이메일입니다.',
              };
            }
            // 소셜 계정 연결
            await pool.query(
              `UPDATE users SET naverid = $1 WHERE email = $2`,
              [id, email],
            );
          }
        } else {
          const createUserQuery = `
            INSERT INTO users (email, naverid, username, profile_image)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `;
          const createUserResult = await pool.query(createUserQuery, [
            email,
            id,
            name,
            profile_image,
          ]);
          user = createUserResult.rows[0];
        }

        const payload = { 
          id: user.id,
          is_admin: Boolean(user.is_admin) 
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
          expiresIn: '7d',
        });

        return {
          token,
          refreshToken,
        };
  } catch (error) {
    if (error instanceof Error && error.name === 'naverAuthError') {
      throw error;
    }
    throw createError('SocialLoginError', '소셜 로그인 실패', 400);
  }
} 

export const googleLogin = async (code: string) => {
  try {
      const tokenResponse = await axios.post<googleTokenResponse>(
        'https://oauth2.googleapis.com/token',
        null,
        {
          params: {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      
    const userInfoResponse = await axios.get<googleUserInfoResponse>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      },
    );

    const { id, email, name } = userInfoResponse.data;

    if (!email) {
      throw createError(
        'googleAuthError',
        `구글에서 정보가 충분하지 않습니다.`,
        400,
      );
    }

    // 이메일로 사용자 확인
    const checkEmailQuery = `SELECT id, username, kakaoid, naverid, googleid, is_admin FROM users WHERE email = $1`;
    const checkEmailResult = await pool.query(checkEmailQuery, [email]);

    let user;
    if (checkEmailResult.rows.length > 0) {
      user = checkEmailResult.rows[0];
      if (!user.googleid) {
        // 다른 소셜 계정으로 가입된 경우
        if (user.kakaoid || user.naverid) {
          return {
            message: '이미 다른 소셜 계정으로 가입된 이메일입니다.',
          };
        }
        // 소셜 계정 연결
        await pool.query(
          `UPDATE users SET googleid = $1 WHERE email = $2`,
          [id, email],
        );
      }
    } else {
      // 새 사용자 등록
      const createUserQuery = `
        INSERT INTO users (email, googleid, username, profile_image) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      const createUserResult = await pool.query(createUserQuery, [
        email,
        id,
        name,
        null
      ]);
      user = createUserResult.rows[0];
    }

    // 토큰 생성
    const payload = { 
      id: user.id,
      is_admin: Boolean(user.is_admin)
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    return {
      token,
      refreshToken,
    };

  } catch (error) {  
    throw createError('SocialLoginError', '소셜 로그인 실패', 400);
  }
};

export const getUserInfo = async (userId: number) => {
  try {
    const query = `SELECT id, email, username, profile_image, wallet_address, kakaoid, naverid, googleid, is_admin FROM users WHERE id = $1`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      throw createError('NotFound', '사용자를 찾을 수 없습니다.', 404);
    }
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      profile_image: user.profile_image,
      wallet_address: user.wallet_address,
      kakaoid: user.kakaoid,
      naverid: user.naverid,
      googleid: user.googleid,
      is_admin: user.is_admin
    };
  } catch (error: unknown) {
    console.error('getUserInfo Error: ', error);
    throw createError('DBError', '데이터베이스 오류', 500);
  }
}

export const generateNonce = async (walletAddress: string) => {
  try {
    const nonce = Math.floor(Math.random() * 1000000).toString();
    
    // 지갑 주소로 사용자 확인
    const checkQuery = 'SELECT id FROM users WHERE wallet_address = $1';
    const checkResult = await pool.query(checkQuery, [walletAddress]);
    
    if (checkResult.rows.length > 0) {
      // 기존 사용자의 nonce 업데이트
      const updateQuery = `
        UPDATE users 
        SET nonce = $1, nonce_created_at = NOW() 
        WHERE wallet_address = $2
        RETURNING nonce
      `;
      await pool.query(updateQuery, [nonce, walletAddress]);
    } else {
      // 새로운 지갑 기반 사용자 생성
      const insertQuery = `
        INSERT INTO users (username, wallet_address, nonce, nonce_created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING nonce
      `;
      await pool.query(insertQuery, [
        `User_${walletAddress.slice(0, 6)}`,
        walletAddress,
        nonce
      ]);
    }
    
    return nonce;
  } catch (error: any) {
    console.error('Nonce 생성 실패:', error);
    throw createError('DBError', 'Nonce 생성에 실패했습니다.', 500);
  }
};

export const verifySignature = async (walletAddress: string, signature: string): Promise<{ verified: boolean; token?: string; refreshToken?: string }> => {
  try {
    const query = `
      SELECT id, nonce, nonce_created_at, is_admin
      FROM users 
      WHERE wallet_address = $1 
    `;
    const result = await pool.query(query, [walletAddress]);

    if (!result.rows[0]) {
      return { verified: false };
    }

    const { id, nonce, nonce_created_at, is_admin } = result.rows[0];

    // nonce 만료 확인 (5분)
    const nonceAge = Date.now() - new Date(nonce_created_at).getTime();
    if (nonceAge > 5 * 60 * 1000) {
      await pool.query('UPDATE users SET nonce = NULL WHERE id = $1', [id]);
      return { verified: false };
    }

    const msg = `Welcome to StageMate!\n\nNonce: ${nonce}`;
    const recoveredAddress = recoverPersonalSignature({
      data: bufferToHex(Buffer.from(msg, 'utf8')),
      signature,
    });

    if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
      // nonce 초기화
      await pool.query('UPDATE users SET nonce = NULL WHERE id = $1', [id]);

      // 토큰 생성
      const payload = { id, is_admin: Boolean(is_admin) };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
      });

      return { 
        verified: true,
        token,
        refreshToken
      };
    }

    return { verified: false };
  } catch (error) {
    console.error('서명 검증 실패:', error);
    return { verified: false };
  }
};

// 지갑 주소 연결 (소셜 로그인 사용자용)
export const connectWalletToUser = async (userId: number, walletAddress: string): Promise<boolean> => {
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
      RETURNING id
    `;
    const result = await pool.query(updateQuery, [walletAddress, userId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('지갑 연결 실패:', error);
    throw error;
  }
};

// 이메일 등록 (지갑 기반 사용자용)
export const registerEmail = async (userId: number, email: string): Promise<boolean> => {
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
      RETURNING id
    `;
    const result = await pool.query(updateQuery, [email, userId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('이메일 등록 실패:', error);
    throw error;
  }
}; 