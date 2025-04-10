import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Pagination,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';

interface Post {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  username: string;
}

const PostListPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (currentPage: number) => {
    try {
      setLoading(true);
      const response = await postAPI.getPosts(currentPage);
      setPosts(response.posts);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('게시글 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          공연 목록
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/posts/create')}
          >
            공연 등록
          </Button>
        )}
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)' 
        }, 
        gap: 4 
      }}>
        {posts.map((post) => (
          <Card
            key={post.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <CardMedia
              component="img"
              height="200"
              image={post.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
              alt={post.title}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                {post.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {post.content}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.created_at).toLocaleDateString()}
                </Typography>
                <Chip
                  label={post.username}
                  size="small"
                  sx={{ backgroundColor: '#FF4B4B', color: 'white' }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
      </Box>
    </Container>
  );
};

export default PostListPage; 