/**
 * Stacks Utility Functions
 * Helper functions for working with Stacks addresses and values
 */

import { 
  Cl,
  cvToValue,
  ClarityValue,
  cvToJSON,
  ResponseOkCV,
  ResponseErrorCV,
  SomeCV,
  NoneCV,
  TupleCV
} from '@stacks/transactions';

/**
 * Validate a Stacks address format
 */
export function isValidStacksAddress(address: string): boolean {
  // Stacks addresses start with SP (mainnet) or ST (testnet) followed by base58 characters
  const stacksAddressRegex = /^(SP|ST)[0-9A-Z]{39,40}$/;
  return stacksAddressRegex.test(address);
}

/**
 * Truncate a Stacks address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Convert microSTX to STX
 */
export function microStxToStx(microStx: number | bigint): number {
  return Number(microStx) / 1_000_000;
}

/**
 * Convert STX to microSTX
 */
export function stxToMicroStx(stx: number): bigint {
  return BigInt(Math.floor(stx * 1_000_000));
}

/**
 * Format STX amount for display
 */
export function formatStxAmount(microStx: number | bigint, decimals = 2): string {
  const stx = microStxToStx(microStx);
  return stx.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse Clarity value to JavaScript types
 */
export function parseClarityValue(value: ClarityValue): any {
  try {
    const result = cvToValue(value, true);
    // Debug log for development
    if (import.meta.env.DEV) {
      console.debug('Parsed Clarity value:', { type: value.type, result });
    }
    return result;
  } catch (error) {
    console.error('Error parsing Clarity value:', error, value);
    return null;
  }
}

/**
 * Extract value from Clarity response
 */
export function extractResponseValue(response: ClarityValue): any {
  if (response.type === 'response_ok') {
    return parseClarityValue((response as ResponseOkCV).value);
  } else if (response.type === 'response_error') {
    throw new Error(`Contract error: ${parseClarityValue((response as ResponseErrorCV).value)}`);
  }
  return parseClarityValue(response);
}

/**
 * Extract value from optional Clarity value
 */
export function extractOptionalValue(value: ClarityValue): any | null {
  if (value.type === 'some') {
    return parseClarityValue((value as SomeCV).value);
  } else if (value.type === 'none') {
    return null;
  }
  return parseClarityValue(value);
}

/**
 * Parse vesting schedule from Clarity tuple
 */
export interface VestingSchedule {
  totalAmount: bigint;
  claimedAmount: bigint;
  startTime: bigint;
  cliffDuration: bigint;
  vestingDuration: bigint;
  isActive: boolean;
}

export function parseVestingSchedule(value: ClarityValue): VestingSchedule | null {
  try {
    if (value.type === 'none') {
      return null;
    }

    const tupleValue = value.type === 'some' 
      ? (value as SomeCV).value as TupleCV
      : value as TupleCV;

    const data = tupleValue.data;

    return {
      totalAmount: (data['total-amount'] as any).value,
      claimedAmount: (data['claimed-amount'] as any).value,
      startTime: (data['start-time'] as any).value,
      cliffDuration: (data['cliff-duration'] as any).value,
      vestingDuration: (data['vesting-duration'] as any).value,
      isActive: (data['is-active'] as any).value,
    };
  } catch (error) {
    console.error('Error parsing vesting schedule:', error);
    return null;
  }
}

/**
 * Calculate human-readable time from block height
 * Stacks blocks are ~10 minutes on average
 */
export function blocksToTime(blocks: number | bigint): {
  days: number;
  hours: number;
  minutes: number;
} {
  const totalMinutes = Number(blocks) * 10;
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

/**
 * Format time duration for display
 */
export function formatDuration(blocks: number | bigint): string {
  const { days, hours, minutes } = blocksToTime(blocks);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Create Clarity function arguments
 */
export function createPrincipalArg(address: string) {
  return Cl.principal(address);
}

export function createUintArg(value: number | bigint) {
  return Cl.uint(value);
}
