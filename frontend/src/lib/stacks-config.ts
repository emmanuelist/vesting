/**
 * Stacks Network Configuration
 * Configure network settings for different environments
 */

import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

// Contract deployment details
export const CONTRACT_ADDRESS = 'SPHB047A30W99178TR7KE0784C2GV22070JTKX8';
export const CONTRACT_NAME = 'vesting';

// Development mode - set to true if contract is not deployed yet
export const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || false;

// Network configuration - Contract is deployed on MAINNET
export const NETWORK = import.meta.env.VITE_NETWORK === 'testnet' 
  ? STACKS_TESTNET
  : STACKS_MAINNET; // Default to mainnet where contract is deployed

// Explorer URLs
export const EXPLORER_URL = NETWORK.chainId === 1
  ? 'https://explorer.stacks.co' 
  : 'https://explorer.hiro.so';

// API endpoints
export const API_URL = NETWORK.chainId === 1
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
  return `${EXPLORER_URL}/txid/${txId}?chain=${NETWORK.chainId === 1 ? 'mainnet' : 'testnet'}`;
}

/**
 * Helper to get address URL
 */
export function getAddressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}?chain=${NETWORK.chainId === 1 ? 'mainnet' : 'testnet'}`;
}
