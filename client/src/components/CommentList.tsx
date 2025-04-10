import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { commentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: number;
  content: string;
  user_id: number;
  username: string;
  created_at: string;
}

interface CommentListProps {
  postId: number;
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentAPI.getComments(postId);
      setComments(data);
    } catch (err) {
      setError('댓글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (commentId: number) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (commentToDelete) {
      try {
        await commentAPI.deleteComment(postId, commentToDelete);
        setComments(comments.filter(comment => comment.id !== commentToDelete));
      } catch (err) {
      }
    }
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" p={2}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        댓글 ({comments.length})
      </Typography>
      {comments.map((comment) => (
        <Paper
          key={comment.id}
          elevation={1}
          sx={{ p: 2, mb: 2, position: 'relative' }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {comment.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(comment.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            {user && user.id && (user.id === comment.user_id || isAdmin === true) && (
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(comment.id)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {comment.content}
          </Typography>
        </Paper>
      ))}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>댓글 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 이 댓글을 삭제하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentList; 