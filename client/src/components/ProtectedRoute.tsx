import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // 인증 상태 확인 중이면 로딩 표시
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // 인증되지 않았으면 로그인 페이지로 리디렉션
    return <Navigate to="/login" replace />;
  }

  // 인증되었으면 자식 컴포넌트(Outlet) 렌더링
  return <Outlet />;
};

export default ProtectedRoute; 