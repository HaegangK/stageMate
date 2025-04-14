import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 토큰 가져오기
const getToken = () => {
  return localStorage.getItem('token');
};

export const authAPI = {
  // 소셜 로그인
  login: (provider: string) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  checkAuth: async () => {
    const response = await api.get('/auth/check');
    return response.data;
  },

  checkAdmin: async () => {
    const response = await api.get('/auth/admin');
    return response.data;
  },

  // 지갑 인증
  generateNonce: async (walletAddress: string): Promise<string> => {
    const response = await api.post('/auth/nonce', { walletAddress });
    return response.data.nonce;
  },

  verifySignature: async (walletAddress: string, signature: string): Promise<{ token: string; refreshToken: string }> => {
    const response = await api.post('/auth/verify', { walletAddress, signature });
    return response.data;
  },
};

export const postAPI = {
  getPosts: async (page: number = 1) => {
    const response = await api.get(`/posts/paginate?page=${page}`);
    return response.data;
  },
  createPost: async (formData: FormData) => {
    const response = await api.post('/posts/admin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deletePost: async (postId: number) => {
    const response = await api.delete(`/posts/admin/${postId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  },
  getPost: async (id: number) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },
  updatePost: async (postId: number, formData: FormData) => {
    const response = await api.put(`/posts/admin/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  },
};

// 댓글 관련 API
export const commentAPI = {
  // 댓글 작성
  createComment: async (postId: number, content: string) => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },

  // 댓글 목록 조회
  getComments: async (postId: number) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  // 댓글 삭제
  deleteComment: async (postId: number, commentId: number) => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },
};

export const userAPI = {
  getUserInfo: async () => {
    const response = await api.get('/mypage');
    return response.data;
  },

  updateUserInfo: async (username: string, profileImage?: File) => {
    const formData = new FormData();
    formData.append('username', username);
    if (profileImage) {
      formData.append('image', profileImage);
    }
    const response = await api.put('/mypage', formData);
    return response.data;
  },

  // 소셜 로그인 사용자의 지갑 연결
  connectWallet: async (walletAddress: string) => {
    const response = await api.post('/mypage/wallet', { walletAddress });
    return response.data;
  },

  // 지갑 연결 해제
  disconnectWallet: async () => {
    const response = await api.delete('/mypage/wallet');
    return response.data;
  },

  // 지갑 기반 사용자의 이메일 등록
  registerEmail: async (email: string) => {
    const response = await api.post('/mypage/email', { email });
    return response.data;
  },
};

export default api; 