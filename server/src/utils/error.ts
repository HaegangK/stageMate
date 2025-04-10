class CustomError extends Error {
    status: number;
    constructor(name: string, message: string, status: number) {
        super(message);
        this.name = name;
        this.status = status;
    }
};

export function createError(name: string, message: string, status: number) {
    return new CustomError(name, message, status);
}

export const commonError = {
    NO_ACCESS_TOKEN: {
      name: 'No access token',
      message: '토큰이 없습니다'
    },
    UNAUTHORIZED: {
      name: 'Unauthorized',
      message: '접근 권한이 없습니다.'
    },
    INVALID_TOKEN: {
      name: 'Invalid token',
      message: '잘못된 토큰입니다.'
    },
    EXPIRED_TOKEN: {
      name: 'Expired token',
      message: '만료된 토큰입니다.'
    },
    NO_RESOURCES: {
      name: 'No resources',
      message: '리소스가 존재하지 않습니다.'
    },
    USER_NOT_FOUND: {
      name: 'User not found',
      message: '사용자를 찾을 수 없습니다'
    },
    INVALID_API_PATH: {
      name: 'INVALID_API_PATH',
      message: '잘못된 접근입니다.'
    }
  };
  