import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface MetaMaskContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<string[]>;
  disconnectWallet: () => Promise<void>;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider');
  }
  return context;
};

export const MetaMaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // MetaMask 이벤트 리스너 설정
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } else {
        setWalletAddress(null);
        setIsConnected(false);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // 초기 연결 상태 확인
      window.ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch(console.error);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const connectWallet = async (): Promise<string[]> => {
    if (!window.ethereum) {
      throw new Error('MetaMask가 설치되어 있지 않습니다.');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        return accounts;
      }

      throw new Error('지갑 연결에 실패했습니다.');
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('지갑 연결이 거부되었습니다.');
      }
      throw error;
    }
  };

  const disconnectWallet = async () => {
    setWalletAddress(null);
    setIsConnected(false);
  };

  return (
    <MetaMaskContext.Provider
      value={{
        isConnected,
        walletAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

export default MetaMaskContext;

