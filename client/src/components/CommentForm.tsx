import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import { commentAPI } from '../services/api';

interface CommentFormProps {
  postId: number;
  onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      await commentAPI.createComment(postId, content);
      setContent('');
      onCommentAdded();
    } catch (err) {
      console.error('댓글 작성 에러:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요"
          variant="outlined"
          disabled={isSubmitting}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!content.trim() || isSubmitting}
          >
            댓글 작성
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CommentForm; 