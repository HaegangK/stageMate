export const errorTypes = {
    BadRequest: {
        status: 400,
        message: '잘못된 요청입니다.'
    },
    Unauthorized: {
        status: 401,
        message: '인증이 필요합니다.'
    },
    NotFound: {
        status: 404,
        message: '찾을 수 없습니다.'
    },
    ServerError: {
        status: 500,
        message: '서버 오류가 발생했습니다.'
    }
}