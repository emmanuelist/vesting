/**
 * Custom hook for vesting data
 * Fetches and manages vesting schedule data with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVestingSchedule,
  calculateVestedAmount,
  getVestingProgress,
  isCliffPassed,
  getContractBalance,
  getTotalSchedules,
  getBeneficiaryCount,
  getVestingEvent,
  claimVestedTokens,
  createVestingSchedule,
  fundContract,
  revokeVesting,
  checkTransactionStatus,
  CreateVestingScheduleOptions,
  FundContractOptions,
  RevokeVestingOptions,
} from '@/lib/vesting-service';
import { VestingSchedule, microStxToStx } from '@/lib/stacks-utils';

/**
 * Hook to fetch vesting schedule for a beneficiary
 */
export function useVestingSchedule(beneficiary: string | null) {
  return useQuery({
    queryKey: ['vesting-schedule', beneficiary],
    queryFn: () => beneficiary ? getVestingSchedule(beneficiary) : null,
    enabled: !!beneficiary,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });
}

/**
 * Hook to calculate vested amount
 */
export function useVestedAmount(beneficiary: string | null) {
  return useQuery({
    queryKey: ['vested-amount', beneficiary],
    queryFn: () => beneficiary ? calculateVestedAmount(beneficiary) : BigInt(0),
    enabled: !!beneficiary,
    staleTime: 15_000, // 15 seconds
    refetchInterval: 30_000, // Refetch every 30 seconds
  });
}

/**
 * Hook to get vesting progress percentage
 */
export function useVestingProgress(beneficiary: string | null) {
  return useQuery({
    queryKey: ['vesting-progress', beneficiary],
    queryFn: () => beneficiary ? getVestingProgress(beneficiary) : 0,
    enabled: !!beneficiary,
    staleTime: 30_000,
  });
}

/**
 * Hook to check cliff status
 */
export function useCliffStatus(beneficiary: string | null) {
  return useQuery({
    queryKey: ['cliff-status', beneficiary],
    queryFn: () => beneficiary ? isCliffPassed(beneficiary) : false,
    enabled: !!beneficiary,
    staleTime: 60_000,
  });
}

/**
 * Hook to get contract balance
 */
export function useContractBalance() {
  return useQuery({
    queryKey: ['contract-balance'],
    queryFn: getContractBalance,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false, // Don't retry if contract doesn't exist
    meta: {
      errorMessage: 'Contract not deployed yet',
    },
  });
}

/**
 * Hook to get total schedules
 */
export function useTotalSchedules() {
  return useQuery({
    queryKey: ['total-schedules'],
    queryFn: getTotalSchedules,
    staleTime: 60_000,
  });
}

/**
 * Hook to get complete vesting data for a beneficiary
 */
export function useVestingData(beneficiary: string | null) {
  const schedule = useVestingSchedule(beneficiary);
  const vestedAmount = useVestedAmount(beneficiary);
  const progress = useVestingProgress(beneficiary);
  const cliffPassed = useCliffStatus(beneficiary);
  
  // Check if contract is deployed
  const contractNotDeployed = 
    schedule.error?.message?.includes('NoSuchContract') ||
    vestedAmount.error?.message?.includes('NoSuchContract') ||
    progress.error?.message?.includes('NoSuchContract') ||
    cliffPassed.error?.message?.includes('NoSuchContract');

  return {
    schedule: schedule.data,
    vestedAmount: vestedAmount.data,
    progress: progress.data,
    cliffPassed: cliffPassed.data,
    isLoading: schedule.isLoading || vestedAmount.isLoading || 
               progress.isLoading || cliffPassed.isLoading,
    error: schedule.error || vestedAmount.error || 
           progress.error || cliffPassed.error,
    contractNotDeployed,
    refetch: () => {
      schedule.refetch();
      vestedAmount.refetch();
      progress.refetch();
      cliffPassed.refetch();
    },
  };
}

/**
 * Mutation hook for claiming vested tokens
 */
export function useClaimTokens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return new Promise<string>((resolve, reject) => {
        claimVestedTokens({
          onFinish: (data) => resolve(data.txId),
          onCancel: () => reject(new Error('Transaction cancelled')),
        }).catch(reject);
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['vesting-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['vested-amount'] });
      queryClient.invalidateQueries({ queryKey: ['contract-balance'] });
    },
  });
}

/**
 * Mutation hook for creating vesting schedule
 */
export function useCreateVestingSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: Omit<CreateVestingScheduleOptions, 'onFinish' | 'onCancel'>) => {
      return new Promise<string>((resolve, reject) => {
        createVestingSchedule({
          ...options,
          onFinish: (data) => resolve(data.txId),
          onCancel: () => reject(new Error('Transaction cancelled')),
        }).catch(reject);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['total-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['contract-balance'] });
    },
  });
}

/**
 * Mutation hook for funding contract
 */
export function useFundContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: Omit<FundContractOptions, 'onFinish' | 'onCancel'>) => {
      return new Promise<string>((resolve, reject) => {
        fundContract({
          ...options,
          onFinish: (data) => resolve(data.txId),
          onCancel: () => reject(new Error('Transaction cancelled')),
        }).catch(reject);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-balance'] });
    },
  });
}

/**
 * Mutation hook for revoking vesting
 */
export function useRevokeVesting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: Omit<RevokeVestingOptions, 'onFinish' | 'onCancel'>) => {
      return new Promise<string>((resolve, reject) => {
        revokeVesting({
          ...options,
          onFinish: (data) => resolve(data.txId),
          onCancel: () => reject(new Error('Transaction cancelled')),
        }).catch(reject);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vesting-schedule'] });
    },
  });
}

/**
 * Hook to get beneficiary count
 */
export function useBeneficiaryCount() {
  return useQuery({
    queryKey: ['beneficiary-count'],
    queryFn: getBeneficiaryCount,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/**
 * Hook to get vesting event by ID
 */
export function useVestingEvent(eventId: number | null) {
  return useQuery({
    queryKey: ['vesting-event', eventId],
    queryFn: () => eventId !== null ? getVestingEvent(eventId) : null,
    enabled: eventId !== null,
    staleTime: 300_000, // Events are immutable, cache for 5 minutes
  });
}

/**
 * Hook to poll transaction status
 */
export function useTransactionStatus(txId: string | null) {
  return useQuery({
    queryKey: ['transaction-status', txId],
    queryFn: () => txId ? checkTransactionStatus(txId) : 'pending',
    enabled: !!txId,
    refetchInterval: (query) => {
      const status = query.state.data;
      // Stop polling if transaction is no longer pending
      return status === 'pending' ? 3_000 : false;
    },
  });
}
