import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }
      await postAPI.createPost(formData);
      navigate('/posts');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 3, background: 'linear-gradient(45deg, #FF4B4B 30%, #FF8E8E 90%)', color: 'white', borderRadius: 2, mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            공연 등록
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
            />
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <IconButton color="primary" component="span">
                  <AddPhotoAlternateIcon />
                </IconButton>
                <Typography component="span" variant="body2">
                  이미지 추가
                </Typography>
              </label>
              {previewUrl && (
                <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                    onClick={() => {
                      setImage(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              label="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              margin="normal"
              multiline
              rows={6}
              required
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/posts')}>
                취소
              </Button>
              <Button type="submit" variant="contained" color="primary">
                등록
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreatePostPage;