/**
 * Stacks Wallet Context
 * Provides wallet connection state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { showConnect, disconnect } from '@stacks/connect';
import { AppConfig, UserSession } from '@stacks/connect';
import { APP_DETAILS } from '@/lib/stacks-config';

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

// Configure app for Stacks authentication
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Check if user is already authenticated on mount
   */
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const profile = userData.profile;
      
      // Get STX address
      const address = userData.profile.stxAddress.mainnet || 
                      userData.profile.stxAddress.testnet;
      
      setIsConnected(true);
      setUserAddress(address);
      setStxAddress(address);
    }
  }, []);

  /**
   * Connect wallet using Stacks Connect
   */
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);

      showConnect({
        appDetails: APP_DETAILS,
        redirectTo: '/',
        onFinish: () => {
          const userData = userSession.loadUserData();
          const address = userData.profile.stxAddress.mainnet || 
                          userData.profile.stxAddress.testnet;
          
          setIsConnected(true);
          setUserAddress(address);
          setStxAddress(address);
          setIsConnecting(false);
        },
        onCancel: () => {
          setIsConnecting(false);
        },
        userSession,
      });
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
    disconnect();
    userSession.signUserOut();
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
