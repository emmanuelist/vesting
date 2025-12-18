/**
 * Vesting Contract Service
 * Handles all interactions with the vesting smart contract
 */

import {
  cvToValue,
  fetchCallReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  Pc,
  ClarityValue,
  Cl,
} from '@stacks/transactions';
import { request } from '@stacks/connect';
import { 
  CONTRACT_ADDRESS, 
  CONTRACT_NAME, 
  NETWORK
} from './stacks-config';
import { 
  parseVestingSchedule, 
  extractResponseValue,
  extractOptionalValue,
  VestingSchedule,
  stxToMicroStx,
  createPrincipalArg,
  createUintArg,
} from './stacks-utils';

/**
 * Read-only function calls (no wallet interaction needed)
 */

/**
 * Get vesting schedule for a beneficiary
 */
export async function getVestingSchedule(
  beneficiary: string
): Promise<VestingSchedule | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-vesting-schedule',
      functionArgs: [createPrincipalArg(beneficiary)],
      network: NETWORK,
      senderAddress: beneficiary,
    });

    return parseVestingSchedule(result);
  } catch (error) {
    console.error('Error fetching vesting schedule:', error);
    return null;
  }
}

/**
 * Calculate vested amount for a beneficiary
 */
export async function calculateVestedAmount(
  beneficiary: string
): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'calculate-vested-amount',
      functionArgs: [createPrincipalArg(beneficiary)],
      network: NETWORK,
      senderAddress: beneficiary,
    });

    const value = extractResponseValue(result);
    // Handle different response types
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    if (typeof value === 'string') return BigInt(value);
    return BigInt(0);
  } catch (error) {
    console.error('Error calculating vested amount:', error);
    return BigInt(0);
  }
}

/**
 * Get vesting progress percentage (0-100)
 */
export async function getVestingProgress(
  beneficiary: string
): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-vesting-progress',
      functionArgs: [createPrincipalArg(beneficiary)],
      network: NETWORK,
      senderAddress: beneficiary,
    });

    const value = extractResponseValue(result);
    // Handle different response types
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') return Number(value);
    return 0;
  } catch (error) {
    console.error('Error fetching vesting progress:', error);
    return 0;
  }
}

/**
 * Check if cliff period has passed
 */
export async function isCliffPassed(
  beneficiary: string
): Promise<boolean> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'is-cliff-passed',
      functionArgs: [createPrincipalArg(beneficiary)],
      network: NETWORK,
      senderAddress: beneficiary,
    });

    return extractResponseValue(result) === true;
  } catch (error) {
    console.error('Error checking cliff status:', error);
    return false;
  }
}

/**
 * Get contract STX balance
 */
export async function getContractBalance(): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-contract-balance',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const value = extractResponseValue(result);
    // Handle different response types
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    if (typeof value === 'string') return BigInt(value);
    return BigInt(0);
  } catch (error) {
    console.error('Error fetching contract balance:', error);
    return BigInt(0);
  }
}

/**
 * Get total number of vesting schedules
 */
export async function getTotalSchedules(): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-schedules',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const value = extractResponseValue(result);
    // Handle different response types
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') return Number(value);
    return 0;
  } catch (error) {
    console.error('Error fetching total schedules:', error);
    return 0;
  }
}

/**
 * Get vesting event by ID
 */
export async function getVestingEvent(eventId: number): Promise<any> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-vesting-event',
      functionArgs: [createUintArg(eventId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    return extractOptionalValue(result);
  } catch (error) {
    console.error('Error fetching vesting event:', error);
    return null;
  }
}

/**
 * Get current block height (used as timestamp in contract)
 */
export async function getCurrentTime(): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-current-time',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const value = extractResponseValue(result);
    // Handle different response types
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    if (typeof value === 'string') return BigInt(value);
    return BigInt(0);
  } catch (error) {
    console.error('Error fetching current time:', error);
    return BigInt(0);
  }
}

/**
 * Get count of unique beneficiaries
 */
export async function getBeneficiaryCount(): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-beneficiary-count',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const value = extractResponseValue(result);
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') return Number(value);
    return 0;
  } catch (error) {
    console.error('Error fetching beneficiary count:', error);
    return 0;
  }
}

/**
 * Write functions (require wallet interaction)
 */

export interface ClaimTokensOptions {
  onFinish?: (data: { txId: string }) => void;
  onCancel?: () => void;
}

/**
 * Claim vested tokens
 * Opens wallet popup for user to sign transaction
 */
export async function claimVestedTokens(
  options?: ClaimTokensOptions
): Promise<void> {
  try {
    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'claim-vested-tokens',
      functionArgs: [],
      network: NETWORK.chainId === 1 ? 'mainnet' : 'testnet',
    });
    
    console.log('Transaction broadcast:', response.txid);
    options?.onFinish?.({ txId: response.txid });
  } catch (error) {
    console.error('Error claiming tokens:', error);
    options?.onCancel?.();
    throw error;
  }
}

export interface CreateVestingScheduleOptions {
  beneficiary: string;
  totalAmount: number; // in STX
  cliffDuration: number; // in blocks
  vestingDuration: number; // in blocks
  onFinish?: (data: { txId: string }) => void;
  onCancel?: () => void;
}

/**
 * Create a new vesting schedule (admin only)
 * Opens wallet popup for user to sign transaction
 */
export async function createVestingSchedule(
  options: CreateVestingScheduleOptions
): Promise<void> {
  try {
    const totalAmountMicroStx = stxToMicroStx(options.totalAmount);

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'create-vesting-schedule',
      functionArgs: [
        createPrincipalArg(options.beneficiary),
        createUintArg(totalAmountMicroStx),
        createUintArg(options.cliffDuration),
        createUintArg(options.vestingDuration),
      ],
      network: NETWORK.chainId === 1 ? 'mainnet' : 'testnet',
    });
    
    console.log('Vesting schedule created:', response.txid);
    options?.onFinish?.({ txId: response.txid });
  } catch (error) {
    console.error('Error creating vesting schedule:', error);
    options?.onCancel?.();
    throw error;
  }
}

export interface FundContractOptions {
  amount: number; // in STX
  senderAddress: string;
  onFinish?: (data: { txId: string }) => void;
  onCancel?: () => void;
}

/**
 * Fund the contract with STX
 * Opens wallet popup for user to sign transaction
 */
export async function fundContract(
  options: FundContractOptions
): Promise<void> {
  try {
    const amountMicroStx = stxToMicroStx(options.amount);

    // Add post condition to ensure correct amount is transferred
    const postCondition = Pc.principal(options.senderAddress)
      .willSendEq(amountMicroStx)
      .ustx();

    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'fund-contract',
      functionArgs: [createUintArg(amountMicroStx)],
      network: NETWORK.chainId === 1 ? 'mainnet' : 'testnet',
      postConditions: [postCondition],
    });
    
    console.log('Contract funded:', response.txid);
    options?.onFinish?.({ txId: response.txid });
  } catch (error) {
    console.error('Error funding contract:', error);
    options?.onCancel?.();
    throw error;
  }
}

export interface RevokeVestingOptions {
  beneficiary: string;
  onFinish?: (data: { txId: string }) => void;
  onCancel?: () => void;
}

/**
 * Revoke a vesting schedule (admin only)
 * Opens wallet popup for user to sign transaction
 */
export async function revokeVesting(
  options: RevokeVestingOptions
): Promise<void> {
  try {
    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'revoke-vesting',
      functionArgs: [createPrincipalArg(options.beneficiary)],
      network: NETWORK.chainId === 1 ? 'mainnet' : 'testnet',
    });
    
    console.log('Vesting schedule revoked:', response.txid);
    options?.onFinish?.({ txId: response.txid });
  } catch (error) {
    console.error('Error revoking vesting:', error);
    options?.onCancel?.();
    throw error;
  }
}

/**
 * Helper to check transaction status
 */
export async function checkTransactionStatus(
  txId: string
): Promise<'pending' | 'success' | 'failed'> {
  try {
    const apiUrl = NETWORK.chainId === 1 
      ? 'https://api.mainnet.hiro.so'
      : 'https://api.testnet.hiro.so';
    const response = await fetch(
      `${apiUrl}/extended/v1/tx/${txId}`
    );
    const data = await response.json();

    if (data.tx_status === 'success') {
      return 'success';
    } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
      return 'failed';
    }
    return 'pending';
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return 'pending';
  }
}
