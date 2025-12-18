/**
 * Stacks Wallet Context
 * Provides wallet connection state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  connect as stacksConnect, 
  disconnect as stacksDisconnect,
  isConnected as checkIsConnected,
  getLocalStorage
} from '@stacks/connect';

interface WalletContextType {
  // Wallet state
  isConnected: boolean;
  userAddress: string | null;
  stxAddress: string | null;
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Loading states
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Check if user is already connected on mount
   */
  useEffect(() => {
    const connected = checkIsConnected();
    if (connected) {
      const data = getLocalStorage();
      // addresses is an object with keys: stx, btc, etc.
      // data.addresses.stx is an array of STX addresses
      const address = data?.addresses?.stx?.[0]?.address;
      if (address) {
        setIsConnected(true);
        setUserAddress(address);
        setStxAddress(address);
      }
    }
  }, []);

  /**
   * Connect wallet using Stacks Connect v8.x
   */
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);

      // Call connect which returns user's addresses
      const response = await stacksConnect();
      
      // Extract STX address from response
      // addresses is an object: { stx: [...], btc: [...] }
      const address = response.addresses?.stx?.[0]?.address;
      
      if (address) {
        setIsConnected(true);
        setUserAddress(address);
        setStxAddress(address);
      }
      
      setIsConnecting(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsConnecting(false);
      throw error;
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    stacksDisconnect();
    setIsConnected(false);
    setUserAddress(null);
    setStxAddress(null);
  }, []);

  const value: WalletContextType = {
    isConnected,
    userAddress,
    stxAddress,
    connect,
    disconnect: disconnectWallet,
    isConnecting,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to access wallet context
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
