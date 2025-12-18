/**
 * TypeScript Type Definitions for Stacks Vesting Integration
 */

/**
 * Vesting Schedule from contract
 */
export interface VestingSchedule {
  totalAmount: bigint;
  claimedAmount: bigint;
  startTime: bigint;
  cliffDuration: bigint;
  vestingDuration: bigint;
  isActive: boolean;
}

/**
 * Vesting Event from contract
 */
export interface VestingEvent {
  beneficiary: string;
  amount: bigint;
  timestamp: bigint;
  eventType: string;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  txId: string;
}

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'success' | 'failed';

/**
 * Network type
 */
export type NetworkType = 'mainnet' | 'testnet';

/**
 * Wallet connection state
 */
export interface WalletState {
  isConnected: boolean;
  userAddress: string | null;
  stxAddress: string | null;
  isConnecting: boolean;
}

/**
 * Vesting data response
 */
export interface VestingDataResponse {
  schedule: VestingSchedule | null;
  vestedAmount: bigint | undefined;
  progress: number | undefined;
  cliffPassed: boolean | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Create vesting schedule parameters
 */
export interface CreateVestingScheduleParams {
  beneficiary: string;
  totalAmount: number; // in STX
  cliffDuration: number; // in blocks
  vestingDuration: number; // in blocks
}

/**
 * Fund contract parameters
 */
export interface FundContractParams {
  amount: number; // in STX
  senderAddress: string;
}

/**
 * Revoke vesting parameters
 */
export interface RevokeVestingParams {
  beneficiary: string;
}

/**
 * Contract error codes
 */
export enum ContractErrorCode {
  ERR_OWNER_ONLY = 100,
  ERR_NOT_FOUND = 101,
  ERR_ALREADY_EXISTS = 102,
  ERR_VESTING_NOT_STARTED = 103,
  ERR_NO_TOKENS_AVAILABLE = 104,
  ERR_UNAUTHORIZED = 105,
  ERR_INVALID_SCHEDULE = 106,
}

/**
 * Contract error messages
 */
export const CONTRACT_ERROR_MESSAGES: Record<ContractErrorCode, string> = {
  [ContractErrorCode.ERR_OWNER_ONLY]: 'Only the contract owner can perform this action',
  [ContractErrorCode.ERR_NOT_FOUND]: 'Vesting schedule not found',
  [ContractErrorCode.ERR_ALREADY_EXISTS]: 'Vesting schedule already exists for this beneficiary',
  [ContractErrorCode.ERR_VESTING_NOT_STARTED]: 'Cliff period has not passed yet',
  [ContractErrorCode.ERR_NO_TOKENS_AVAILABLE]: 'No tokens available to claim at this time',
  [ContractErrorCode.ERR_UNAUTHORIZED]: 'Unauthorized to perform this action',
  [ContractErrorCode.ERR_INVALID_SCHEDULE]: 'Invalid vesting schedule parameters',
};

/**
 * Time duration
 */
export interface TimeDuration {
  days: number;
  hours: number;
  minutes: number;
}

/**
 * Vesting statistics
 */
export interface VestingStats {
  totalAllocated: number;
  currentlyVested: number;
  availableToClaim: number;
  stillLocked: number;
  progressPercentage: number;
  cliffPassed: boolean;
}

/**
 * Contract info
 */
export interface ContractInfo {
  address: string;
  name: string;
  network: NetworkType;
}

/**
 * Explorer URLs
 */
export interface ExplorerUrls {
  transaction: (txId: string) => string;
  address: (address: string) => string;
  contract: (address: string, name: string) => string;
}

/**
 * API endpoints
 */
export interface ApiEndpoints {
  baseUrl: string;
  transaction: (txId: string) => string;
  account: (address: string) => string;
  contract: (address: string, name: string) => string;
}

/**
 * User session data
 */
export interface UserSessionData {
  profile: {
    stxAddress: {
      mainnet: string;
      testnet: string;
    };
  };
}

/**
 * Wallet connection options
 */
export interface WalletConnectionOptions {
  appName: string;
  appIcon: string;
  onFinish?: (data: { userSession: UserSessionData }) => void;
  onCancel?: () => void;
}

/**
 * Contract call options
 */
export interface ContractCallOptions {
  onFinish?: (data: TransactionResult) => void;
  onCancel?: () => void;
}

/**
 * Claim history item
 */
export interface ClaimHistoryItem {
  id: string;
  amount: number;
  timestamp: Date;
  txHash: string;
  status: TransactionStatus;
}

/**
 * Vesting milestone
 */
export interface VestingMilestone {
  date: Date;
  amount: number;
  description: string;
  isPassed: boolean;
}

/**
 * Contract function names
 */
export enum ContractFunction {
  // Read-only
  GET_VESTING_SCHEDULE = 'get-vesting-schedule',
  CALCULATE_VESTED_AMOUNT = 'calculate-vested-amount',
  GET_VESTING_PROGRESS = 'get-vesting-progress',
  IS_CLIFF_PASSED = 'is-cliff-passed',
  GET_CONTRACT_BALANCE = 'get-contract-balance',
  GET_TOTAL_SCHEDULES = 'get-total-schedules',
  GET_CURRENT_TIME = 'get-current-time',
  
  // Write
  CLAIM_VESTED_TOKENS = 'claim-vested-tokens',
  CREATE_VESTING_SCHEDULE = 'create-vesting-schedule',
  FUND_CONTRACT = 'fund-contract',
  REVOKE_VESTING = 'revoke-vesting',
}

/**
 * Utility type for async function state
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page: number;
  perPage: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort params
 */
export interface SortParams {
  field: string;
  order: SortOrder;
}

/**
 * Filter params for vesting schedules
 */
export interface VestingScheduleFilters {
  isActive?: boolean;
  minAmount?: bigint;
  maxAmount?: bigint;
  beneficiary?: string;
}

/**
 * Helper function to check if error is a contract error
 */
export function isContractError(error: unknown): error is { code: ContractErrorCode } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'number'
  );
}

/**
 * Helper function to get error message
 */
export function getErrorMessage(error: unknown): string {
  if (isContractError(error)) {
    return CONTRACT_ERROR_MESSAGES[error.code] || 'Unknown contract error';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}
