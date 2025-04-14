import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, CircularProgress, Alert, LinearProgress } from '@mui/material';
import { useMetaMask } from '../contexts/MetaMaskContext';

interface ConnectWalletButtonProps {
  onConnect?: (address: string) => void;
  onError?: (error: Error) => void;
  showAddress?: boolean;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onConnect,
  onError,
  showAddress = true,
}) => {
  const { isConnected, walletAddress, connectWallet } = useMetaMask();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 카운트다운 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPending && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isPending && countdown === 0) {
      setIsPending(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPending, countdown]);

  const handleConnect = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const accounts = await connectWallet();
      if (accounts.length > 0 && onConnect) {
        onConnect(accounts[0]);
      }
    } catch (err: any) {
      if (err.code === -32002) {
        setIsPending(true);
        setCountdown(15);
        setError('MetaMask 팝업이 이미 열려 있습니다. 팝업에서 연결을 허용하거나 거부한 후 다시 시도해 주세요.');
      } else if (err.code === 4001) {
        setError('지갑 연결이 거부되었습니다.');
      } else {
        setError('지갑 연결에 실패했습니다. 다시 시도해 주세요.');
      }
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // 이미 Metamask 팝업이 열려 있는 경우
  if (isPending) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          MetaMask 팝업이 이미 열려 있습니다. 팝업에서 연결을 허용하거나 취소해 주세요.
        </Alert>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            자동으로 다시 시도까지 {countdown}초 남았습니다
          </Typography>
          <LinearProgress variant="determinate" value={(15 - countdown) / 15 * 100} />
        </Box>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            setIsPending(false);
            setCountdown(0);
          }}
        >
          지금 다시 시도
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {!isConnected ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnect}
          disabled={loading}
          fullWidth
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? '연결 중...' : 'MetaMask 지갑 연결'}
        </Button>
      ) : (
        <Box>
          {showAddress && walletAddress && (
            <Typography variant="body1" gutterBottom>
              연결된 지갑: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Typography>
          )}
          {!showAddress && (
            <Button
              variant="outlined"
              color="success"
              size="small"
              disabled
              sx={{ pointerEvents: 'none' }}
            >
              연결됨
            </Button>
          )}
        </Box>
      )}
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ConnectWalletButton;

