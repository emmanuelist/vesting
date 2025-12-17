/**
 * Stacks Network Configuration
 * Configure network settings for different environments
 */

import { StacksMainnet, StacksTestnet } from '@stacks/network';

// Contract deployment details
export const CONTRACT_ADDRESS = 'SPHB047A30W99178TR7KE0784C2GV22070JTKX8';
export const CONTRACT_NAME = 'vesting';

// Network configuration based on environment
export const NETWORK = import.meta.env.VITE_NETWORK === 'mainnet' 
  ? new StacksMainnet()
  : new StacksTestnet();

// Explorer URLs
export const EXPLORER_URL = NETWORK.isMainnet() 
  ? 'https://explorer.stacks.co' 
  : 'https://explorer.hiro.so';

// API endpoints
export const API_URL = NETWORK.isMainnet()
  ? 'https://api.mainnet.hiro.so'
  : 'https://api.testnet.hiro.so';

/**
 * App configuration for Stacks Connect
 */
export const APP_DETAILS = {
  name: 'VestFlow',
  icon: window.location.origin + '/icon.png',
};

/**
 * Helper to get transaction URL
 */
export function getTransactionUrl(txId: string): string {
  return `${EXPLORER_URL}/txid/${txId}?chain=${NETWORK.isMainnet() ? 'mainnet' : 'testnet'}`;
}

/**
 * Helper to get address URL
 */
export function getAddressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}?chain=${NETWORK.isMainnet() ? 'mainnet' : 'testnet'}`;
}
