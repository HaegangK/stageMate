import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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
  login: (provider: string) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  },
  checkAuth: async () => {
    const response = await api.get('/auth/check');
    return response.data;
  },
  checkAdmin: async () => {
    const response = await api.get('/auth/check-admin');
    return response.data;
  },
  logout: () => {
    return api.post('/auth/logout');
  }
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
  updateUserInfo: async (formData: FormData) => {
    const response = await api.put('/mypage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  },
};

export default api; 