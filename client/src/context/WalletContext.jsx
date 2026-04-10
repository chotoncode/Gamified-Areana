import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

/**
 * WalletProvider manages Freighter wallet connection and XLM balance.
 * Falls back to mock wallet for testing without the extension.
 */
export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const { connectWallet: authConnectWallet } = useAuth();

  /**
   * Connect to Freighter wallet or use mock fallback.
   * Freighter is a browser extension; if not available, we simulate.
   */
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if Freighter is installed
      if (window.freighterApi || window.freighter) {
        const api = window.freighterApi || window.freighter;
        
        if (api.isConnected && await api.isConnected()) {
          const { address } = await api.getAddress();
          setWalletAddress(address);
          authConnectWallet(address);
          
          // Fetch real balance (testnet)
          try {
            const response = await fetch(
              `https://horizon-testnet.stellar.org/accounts/${address}`
            );
            const data = await response.json();
            const xlmBalance = data.balances?.find(b => b.asset_type === 'native');
            setBalance(parseFloat(xlmBalance?.balance || '0'));
          } catch {
            setBalance(1000); // Fallback
          }
        } else {
          // Request access
          await api.requestAccess();
          const { address } = await api.getAddress();
          setWalletAddress(address);
          authConnectWallet(address);
          setBalance(1000);
        }
      } else {
        // Mock wallet for testing
        console.warn('Freighter not detected. Using mock wallet.');
        const mockAddress = 'GBMOCK' + Math.random().toString(36).substr(2, 48).toUpperCase();
        setWalletAddress(mockAddress);
        setBalance(5000);
        authConnectWallet(mockAddress);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err.message || 'Failed to connect wallet');
      
      // Fallback to mock
      const mockAddress = 'GBMOCK' + Math.random().toString(36).substr(2, 48).toUpperCase();
      setWalletAddress(mockAddress);
      setBalance(5000);
      authConnectWallet(mockAddress);
    } finally {
      setIsConnecting(false);
    }
  }, [authConnectWallet]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setBalance(0);
    setError(null);
  }, []);

  /**
   * Simulate staking XLM for a match
   */
  const stakeXLM = useCallback(async (amount) => {
    if (balance < amount) {
      throw new Error('Insufficient XLM balance');
    }
    // Simulate blockchain transaction delay
    await new Promise(r => setTimeout(r, 1500));
    setBalance(prev => prev - amount);
    return {
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      amount,
      timestamp: Date.now(),
    };
  }, [balance]);

  /**
   * Receive XLM winnings
   */
  const receiveXLM = useCallback(async (amount) => {
    await new Promise(r => setTimeout(r, 1000));
    setBalance(prev => prev + amount);
  }, []);

  return (
    <WalletContext.Provider value={{
      walletAddress,
      balance,
      isConnecting,
      error,
      connectWallet,
      disconnectWallet,
      stakeXLM,
      receiveXLM,
      isConnected: !!walletAddress,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};
