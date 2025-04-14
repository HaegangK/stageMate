import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, authAPI } from '../services/api';
import { useMetaMask } from '../contexts/MetaMaskContext';
import ConnectWalletButton from '../components/ConnectWalletButton';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const MyPage: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const { isConnected: isMetaMaskConnected, walletAddress: metaMaskAddress, connectWallet, disconnectWallet } = useMetaMask();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editProfileImage, setEditProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profile_image || null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');
  const [email, setEmail] = useState('');

  // *** 디버깅 코드 추가 ***
  useEffect(() => {
    console.log('[MyPage Render] user:', user);
    console.log('[MyPage Render] metaMaskAddress:', metaMaskAddress);
  }, [user, metaMaskAddress]);
  // *** 디버깅 코드 끝 ***

  // isWalletLinked 계산 시 명시적으로 boolean으로 변환
  const isWalletLinked = !!(user?.wallet_address && user.wallet_address.toLowerCase() === metaMaskAddress?.toLowerCase());

  // *** 디버깅 코드 추가 ***
  console.log('[MyPage Calculation] isWalletLinked (boolean):', isWalletLinked, ' (based on user.wallet_address:', user?.wallet_address, ' and metaMaskAddress:', metaMaskAddress, ')');
  // *** 디버깅 코드 끝 ***

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setEditUsername(user.username);
      setPreviewImage(user.profile_image);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      window.location.reload(); // 페이지 새로고침 추가
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleEditOpen = () => {
    setEditUsername(user?.username || '');
    setEditProfileImage(null);
    setPreviewImage(user?.profile_image || null);
    setEditDialogOpen(true);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!editUsername) {
        throw new Error('사용자 이름은 필수입니다.');
      }

      await userAPI.updateUserInfo(editUsername, editProfileImage || undefined);
      setEditDialogOpen(false);
      await checkAuth(); // 사용자 정보 갱신
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      console.error('프로필 업데이트 오류:', err);
      setError('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const accounts = await connectWallet(); // MetaMask 연결 시도
      if (!accounts || accounts.length === 0) {
        throw new Error('지갑 연결에 실패했습니다.');
      }

      await userAPI.connectWallet(accounts[0]); // 백엔드에 지갑 주소 등록
      await checkAuth(); // 사용자 정보 갱신 (wallet_address 포함)
      setSuccess('지갑이 성공적으로 연결(링크)되었습니다.');
    } catch (err) {
      console.error('지갑 연결 오류:', err);
      setError(err instanceof Error ? err.message : '지갑 연결 중 오류가 발생했습니다.');
      // 백엔드 연결 실패 시 MetaMask 연결 상태는 유지될 수 있음
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await userAPI.disconnectWallet(); // 백엔드에서 지갑 주소 제거
      // MetaMask 자체 연결 해제는 사용자가 직접 해야 함
      // disconnectWallet(); // 컨텍스트 상태만 즉시 업데이트 (선택 사항)
      await checkAuth(); // 사용자 정보 갱신 (wallet_address가 null이 됨)
      setSuccess('지갑 연결(링크)이 해제되었습니다.');
    } catch (err) {
      console.error('지갑 연결 해제 오류:', err);
      setError('지갑 연결 해제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await userAPI.registerEmail(email);
      await checkAuth(); // 사용자 정보 갱신
      setSuccess('이메일이 성공적으로 등록되었습니다.');
      setEmail('');
    } catch (err) {
      console.error('이메일 등록 오류:', err);
      setError('이메일 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          내 프로필
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* 사용자 정보 카드 */}
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={previewImage || undefined}
                  alt={editUsername}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{editUsername}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleEditOpen}
                    sx={{ mr: 1 }}
                  >
                    수정
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
            </CardContent>
          </Card>

          {/* 지갑 연결 섹션 */}
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  지갑 연결
                </Typography>
                {isMetaMaskConnected ? (
                  isWalletLinked ? (
                    <Chip label="계정에 연결됨" color="success" size="small" sx={{ ml: 2 }} />
                  ) : (
                    <Chip label="MetaMask 연결됨 (계정 연결 필요)" color="warning" size="small" sx={{ ml: 2 }} />
                  )
                ) : (
                  <Chip label="MetaMask 연결 안됨" color="default" size="small" sx={{ ml: 2 }} />
                )}
              </Box>

              {!isMetaMaskConnected ? (
                <>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    MetaMask 지갑을 연결하여 블록체인 기능을 사용해보세요.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConnectWallet}
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? '처리 중...' : '지갑 연결'}
                  </Button>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 2
                }}>
                  {isWalletLinked && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }}>
                      <Typography variant="body1" sx={{ mr: 2, fontFamily: 'monospace' }}>
                        {metaMaskAddress ? 
                          (showFullAddress ? metaMaskAddress : `${metaMaskAddress.slice(0, 4)}${'*'.repeat(34)}`) 
                          : ''}
                      </Typography>
                      <Button 
                        size="small"
                        onClick={() => setShowFullAddress(!showFullAddress)}
                        sx={{ mr: 1 }}
                      >
                        {showFullAddress ? '숨기기' : '전체보기'}
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyToClipboard(metaMaskAddress || '')}
                      >
                        {copied ? '복사됨!' : '복사'}
                      </Button>
                    </Box>
                  )}
                  {(() => {
                    if (isWalletLinked) { 
                      return (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleDisconnectWallet}
                          disabled={loading}
                          fullWidth
                        >
                          {loading ? <CircularProgress size={24} /> : '지갑 연결 해제'}
                        </Button>
                      );
                    } else {
                      return (
                        <Button
                          variant="contained"
                          onClick={handleConnectWallet}
                          disabled={loading}
                          fullWidth
                        >
                          {loading ? <CircularProgress size={24} /> : '현재 지갑 계정에 연결'}
                        </Button>
                      );
                    }
                  })()}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* 이메일 등록 섹션 */}
          {!user?.email && (
            <>
              <Divider sx={{ my: 2 }} />
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  이메일 등록
                </Typography>
                <Box component="form" onSubmit={handleRegisterEmail}>
                  <TextField
                    fullWidth
                    label="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    sx={{ mb: 2 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : '이메일 등록'}
                  </Button>
                </Box>
              </Paper>
            </>
          )}
        </Stack>

        {/* 프로필 수정 다이얼로그 */}
        <Dialog open={editDialogOpen} onClose={handleEditCancel}>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="사용자 이름"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                autoFocus
              />
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
              >
                프로필 이미지 변경
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {previewImage && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <img src={previewImage} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditCancel}>취소</Button>
            <Button onClick={handleUpdateProfile} color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : '수정'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default MyPage; 