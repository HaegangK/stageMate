import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

const MyPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setUsername(user?.username || '');
    setProfileImage(null);
  };

  const handleEditConfirm = async () => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }
      
      await userAPI.updateUserInfo(formData);
      setEditDialogOpen(false);
      // TODO: 사용자 정보 새로고침
    } catch (error) {
      console.error('사용자 정보 수정 에러:', error);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6">로그인이 필요합니다.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            로그인하기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar
              src={user.profile_image || undefined}
              sx={{ width: 100, height: 100 }}
            />
            <Typography variant="h5">{user.username}</Typography>
            <Typography color="textSecondary">{user.email}</Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditClick}
              >
                프로필 수정
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </Box>
          </Box>
        </Paper>

        <Dialog open={editDialogOpen} onClose={handleEditCancel}>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="사용자 이름"
              type="text"
              fullWidth
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="프로필 이미지"
              type="file"
              fullWidth
              variant="outlined"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0] || null;
                setProfileImage(file);
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
      </Box>
    </Container>
  );
};

export default MyPage; 