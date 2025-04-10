import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { postAPI } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  username: string;
  user_id: number;
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const [commentKey, setCommentKey] = useState(0); // 댓글 목록 새로고침을 위한 키
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await postAPI.getPost(Number(postId));
      setPost(data);
      setEditTitle(data.title);
      setEditContent(data.content);
    } catch (err) {
      console.error('게시글 조회 에러:', err); // 디버깅을 위한 로그
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = () => {
    setCommentKey(prev => prev + 1); // 댓글 목록 새로고침
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditTitle(post?.title || '');
    setEditContent(post?.content || '');
  };

  const handleEditConfirm = async () => {
    if (!post) return;
    
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('content', editContent);
      if (editImage) {
        formData.append('image', editImage);
      }
      
      await postAPI.updatePost(post.id, formData);
      setEditDialogOpen(false);
      fetchPost(); // 게시글 정보 새로고침
    } catch (err) {
      console.error('게시글 수정 에러:', err);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!post) return;
    try {
      await postAPI.deletePost(post.id);
      setDeleteDialogOpen(false);
      navigate('/posts');
    } catch (err) {
      console.error('게시글 삭제 에러:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error">{error || '게시글을 찾을 수 없습니다.'}</Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/posts')}
            sx={{ mt: 2 }}
          >
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  const canManage = isAdmin;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/posts')}
          sx={{ mb: 2 }}
        >
          목록으로 돌아가기
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1">
              {post.title}
            </Typography>
            {canManage && (
              <Box>
                <IconButton onClick={handleEditClick} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={handleDeleteClick} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          {post.image_url && (
            <Box sx={{ my: 4, textAlign: 'center' }}>
              <img
                src={post.image_url}
                alt={post.title}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
              />
            </Box>
          )}

          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {post.content}
          </Typography>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              작성자: {post.username} | 작성일: {new Date(post.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Paper>

        <CommentForm postId={Number(postId)} onCommentAdded={handleCommentAdded} />
        <CommentList key={commentKey} postId={Number(postId)} />

        <Dialog open={editDialogOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
          <DialogTitle>게시글 수정</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="제목"
              type="text"
              fullWidth
              variant="outlined"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="내용"
              multiline
              rows={10}
              fullWidth
              variant="outlined"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <TextField
              margin="dense"
              label="이미지"
              type="file"
              fullWidth
              variant="outlined"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0] || null;
                setEditImage(file);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditCancel}>취소</Button>
            <Button onClick={handleEditConfirm} color="primary">
              수정
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>게시글 삭제 확인</DialogTitle>
          <DialogContent>
            <Typography>정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>취소</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              삭제
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PostDetailPage; 