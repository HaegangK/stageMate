import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface UseWalletReturn {
  walletAddress: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

const useWallet = (): UseWalletReturn => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setWalletAddress(null);
      } else {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [checkConnection]);

  const connectWallet = async (): Promise<string | null> => {
    if (!window.ethereum) {
      setError('MetaMask가 설치되어 있지 않습니다.');
      return null;
    }
    if (isLoading) {
      console.warn('지갑 연결 중입니다.');
      return null;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWalletAddress(address);
      setIsConnected(true);
      return address;
    } catch (err: any) {
      console.error('Connect wallet error:', err);
      setError(err.message || '지갑 연결에 실패했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!window.ethereum || !walletAddress) {
      setError('지갑이 연결되어 있지 않습니다.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });
      return signature;
    } catch (err: any) {
      console.error('Signing error:', err);
      setError(err.message || '메시지 서명에 실패했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    walletAddress,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    signMessage,
  };
};

export default useWallet;

