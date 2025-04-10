import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

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
        <Typography component="h1" variant="h4" gutterBottom>
          StageMate에 오신 것을 환영합니다!
        </Typography>
        <Typography variant="body1" paragraph>
          공연 정보를 공유하고 소통하는 공간입니다.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/posts')}
            sx={{ mr: 2 }}
          >
            게시글 보기
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/posts/create')}
          >
            글쓰기
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage; 