import React from 'react';
import { Box, Button, Container, Typography, Paper, Alert } from '@mui/material';
import { authAPI } from '../services/api';

const LoginPage: React.FC = () => {
  const handleLogin = (provider: string) => {
    authAPI.login(provider);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            로그인
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => handleLogin('google')}
          >
            Google로 로그인
          </Button>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => handleLogin('kakao')}
          >
            카카오로 로그인
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{ mb: 3 }}
            onClick={() => handleLogin('naver')}
          >
            네이버로 로그인
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 