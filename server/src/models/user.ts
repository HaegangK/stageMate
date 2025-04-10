export interface User {
    id: number;
    email?: string;
    nickname?: string;
    profileImage?: string;
    kakaoId?: string;
    naverId?: string;
    googleId?: string;
    is_admin?: boolean;
}