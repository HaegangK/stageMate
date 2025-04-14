import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMetaMask } from '../contexts/MetaMaskContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isConnected: isMetaMaskConnected, walletAddress: metaMaskAddress, connectWallet } = useMetaMask();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // 실제 계정에 지갑이 연결(링크)되었는지 확인
  const isWalletLinked = isAuthenticated && user?.wallet_address && user.wallet_address.toLowerCase() === metaMaskAddress?.toLowerCase();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigate = (path: string) => {
    handleClose();
    navigate(path);
  };

  const handleConnectWalletClick = async () => {
    try {
      await connectWallet();
      // 연결 성공 후 별도 액션 없음 (MyPage에서 링크 처리)
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      // 에러 처리 (예: 스낵바 표시)
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold', color: '#FF4B4B' }}
          >
            StageMate
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/posts')}
              sx={{ fontWeight: 'bold' }}
            >
              공연
            </Button>
            
            {isAuthenticated ? (
              <>
                {isWalletLinked ? (
                  <Chip
                    icon={<AccountBalanceWalletIcon />}
                    label={`${metaMaskAddress?.slice(0, 6)}...${metaMaskAddress?.slice(-4)} 연결됨`}
                    variant="outlined"
                    color="success"
                    sx={{ mr: 2 }}
                    onClick={() => navigate('/mypage')}
                  />
                ) : (
                  isMetaMaskConnected ? (
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      startIcon={<AccountBalanceWalletIcon />} 
                      sx={{ mr: 2 }}
                      onClick={() => navigate('/mypage')}
                    >
                      지갑 링크 필요
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      startIcon={<AccountBalanceWalletIcon />} 
                      onClick={handleConnectWalletClick} 
                      sx={{ mr: 2 }}
                    >
                      지갑 연결
                    </Button>
                  )
                )}

                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {user?.profile_image ? (
                    <Avatar
                      src={user.profile_image}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircleIcon />
                  )}
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => handleNavigate('/mypage')}>마이페이지</MenuItem>
                  <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {isMetaMaskConnected ? (
                  <Chip
                    icon={<AccountBalanceWalletIcon />}
                    label={`${metaMaskAddress?.slice(0, 6)}...${metaMaskAddress?.slice(-4)} 연결됨`}
                    variant="outlined"
                    color="secondary"
                    sx={{ mr: 2 }}
                  />
                ) : (
                  <Button 
                    variant="contained" 
                    startIcon={<AccountBalanceWalletIcon />} 
                    onClick={handleConnectWalletClick} 
                    sx={{ mr: 2 }}
                  >
                    지갑 연결
                  </Button>
                )}
                <Button color="inherit" component={Link} to="/login">
                  로그인
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 