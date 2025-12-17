/**
 * Example: Create Vesting Schedule Integration
 * 
 * This example demonstrates how to integrate the createVestingSchedule
 * function with a React form component.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateVestingSchedule } from '@/hooks/useVestingData';
import { useWallet } from '@/contexts/WalletContext';
import { isValidStacksAddress } from '@/lib/stacks-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';

// Form validation schema
const scheduleSchema = z.object({
  beneficiary: z.string().refine(isValidStacksAddress, {
    message: 'Invalid Stacks address format',
  }),
  totalAmount: z.number().min(1, 'Amount must be greater than 0'),
  cliffDuration: z.number().min(0, 'Cliff duration must be non-negative'),
  vestingDuration: z.number().min(1, 'Vesting duration must be greater than 0'),
});

type SchleFormData = z.infer<typeof scheduleSchema>;

export function CreateScheduleExample() {
  const { isConnected, userAddress } = useWallet();
  const { toast } = useToast();
  const createMutation = useCreateVestingSchedule();
  const [txId, setTxId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
  });

  const onSubmit = async (data: ScheduleFormData) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create a schedule',
        variant: 'destructive',
      });
      return;
    }

    try {
      const txId = await createMutation.mutateAsync({
        beneficiary: data.beneficiary,
        totalAmount: data.totalAmount,
        cliffDuration: data.cliffDuration,
        vestingDuration: data.vestingDuration,
      });

      setTxId(txId);
      toast({
        title: 'Schedule created successfully',
        description: `Transaction ID: ${txId.slice(0, 10)}...`,
      });

      reset();
    } catch (error: any) {
      toast({
        title: 'Failed to create schedule',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Vesting Schedule</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Beneficiary Address */}
        <div className="space-y-2">
          <Label htmlFor="beneficiary">Beneficiary Address</Label>
          <Input
            id="beneficiary"
            placeholder="SP2..."
            {...register('beneficiary')}
          />
          {errors.beneficiary && (
            <p className="text-sm text-destructive">{errors.beneficiary.message}</p>
          )}
        </div>

        {/* Total Amount */}
        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount (STX)</Label>
          <Input
            id="totalAmount"
            type="number"
            placeholder="1000"
            {...register('totalAmount', { valueAsNumber: true })}
          />
          {errors.totalAmount && (
            <p className="text-sm text-destructive">{errors.totalAmount.message}</p>
          )}
        </div>

        {/* Cliff Duration */}
        <div className="space-y-2">
          <Label htmlFor="cliffDuration">Cliff Duration (blocks)</Label>
          <Input
            id="cliffDuration"
            type="number"
            placeholder="4320"
            {...register('cliffDuration', { valueAsNumber: true })}
          />
          {errors.cliffDuration && (
            <p className="text-sm text-destructive">{errors.cliffDuration.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            ~4320 blocks = 30 days
          </p>
        </div>

        {/* Vesting Duration */}
        <div className="space-y-2">
          <Label htmlFor="vestingDuration">Vesting Duration (blocks)</Label>
          <Input
            id="vestingDuration"
            type="number"
            placeholder="52560"
            {...register('vestingDuration', { valueAsNumber: true })}
          />
          {errors.vestingDuration && (
            <p className="text-sm text-destructive">{errors.vestingDuration.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            ~52560 blocks = 1 year
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={createMutation.isPending || !isConnected}
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating Schedule...
            </>
          ) : (
            'Create Vesting Schedule'
          )}
        </Button>

        {!isConnected && (
          <p className="text-sm text-center text-muted-foreground">
            Connect your wallet to create a schedule
          </p>
        )}
      </form>

      {/* Success Message */}
      {txId && (
        <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
            <div>
              <p className="font-medium text-success">Schedule Created!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Transaction ID: <code className="font-mono">{txId}</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
