{/*
'use client'
import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';

// Mock contract ABI for Zanos Subscription
const SUBSCRIPTION_ABI = [
  {
    name: 'subscribe',
    type: 'function',
    inputs: [
      { name: 'plan', type: 'uint8' },
      { name: 'duration', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    name: 'getSubscription',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'plan', type: 'uint8' },
      { name: 'expiryDate', type: 'uint256' },
      { name: 'autoRenew', type: 'bool' }
    ],
    stateMutability: 'view'
  },
  {
    name: 'setAutoRenew',
    type: 'function',
    inputs: [{ name: 'enabled', type: 'bool' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'renewSubscription',
    type: 'function',
    inputs: [],
    outputs: [],
    stateMutability: 'payable'
  }
] as const;

// Get contract address from environment variable
const SUBSCRIPTION_CONTRACT = (process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT || '0x1234567890123456789012345678901234567890') as `0x${string}`;

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: string; // in ETH
  duration: number; // in seconds (30 days = 2592000)
  features: string[];
  isPopular?: boolean;
  color: string;
}

interface SubscriptionManagerProps {
  plan: SubscriptionPlan;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UserSubscription {
  plan: number;
  expiryDate: bigint;
  autoRenew: boolean;
  isActive: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 0,
    name: 'Free Tier',
    price: '0',
    duration: 0,
    features: ['Limited use of TravelAI', '1 Smart Contract'],
    color: 'gray'
  },
  {
    id: 1,
    name: 'Advanced',
    price: '0.05', // ~€49.99 equivalent in ETH
    duration: 2592000, // 30 days
    features: [
      'Full access to TravelAI',
      '50% off Escrow transactions',
      '5 Smart contracts per month',
      'E-sim Data Only 5GB / month'
    ],
    color: 'blue'
  },
  {
    id: 2,
    name: 'Holiday Package',
    price: '0.1', // ~€100 equivalent in ETH
    duration: 7776000, // 90 days
    features: [
      'Full access to TravelAI',
      '50% off Escrow transactions',
      'E-sim Data Only 5GB / month'
    ],
    isPopular: true,
    color: 'green'
  },
  {
    id: 3,
    name: 'Prime',
    price: '0.1', // ~€99.99 equivalent in ETH
    duration: 2592000, // 30 days
    features: [
      'Full access to TravelAI',
      'Free Escrow transactions',
      'E-sim Data Only 10GB / month',
      'Exclusive access to shared listings',
      'Prime Perks',
      'Unlimited Smart Contracts'
    ],
    color: 'purple'
  }
];

export default function SubscriptionManager({ plan, onSuccess, onError }: SubscriptionManagerProps) {
  const { address, isConnected } = useAccount();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);

  // Contract write hook for subscription
  const { writeContract, data: txHash, error: writeError, isPending: isWritePending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isTxLoading, isSuccess: isTxSuccess, error: txError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Read user's current subscription
  const { data: subscriptionData, refetch: refetchSubscription } = useReadContract({
    address: SUBSCRIPTION_CONTRACT,
    abi: SUBSCRIPTION_ABI,
    functionName: 'getSubscription',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Update user subscription state when data changes
  useEffect(() => {
    if (subscriptionData && Array.isArray(subscriptionData)) {
      const [planId, expiryDate, autoRenew] = subscriptionData;
      const now = Math.floor(Date.now() / 1000);
      setUserSubscription({
        plan: Number(planId),
        expiryDate: expiryDate as bigint,
        autoRenew: autoRenew as boolean,
        isActive: Number(expiryDate) > now
      });
    }
  }, [subscriptionData]);

  // Handle transaction success
  useEffect(() => {
    if (isTxSuccess) {
      setSubscriptionStatus('success');
      setIsSubscribing(false);
      refetchSubscription();
      onSuccess?.();
    }
  }, [isTxSuccess, onSuccess, refetchSubscription]);

  // Handle errors
  useEffect(() => {
    if (writeError || txError) {
      const error = writeError || txError;
      const errorMsg = error?.message || 'Transaction failed';
      setErrorMessage(errorMsg);
      setSubscriptionStatus('error');
      setIsSubscribing(false);
      onError?.(errorMsg);
    }
  }, [writeError, txError, onError]);

  const handleSubscribe = async () => {
    if (!isConnected || !address) {
      setErrorMessage('Please connect your wallet first');
      setSubscriptionStatus('error');
      return;
    }

    if (plan.id === 0) {
      // Free tier - no payment needed
      return;
    }

    try {
      setIsSubscribing(true);
      setSubscriptionStatus('pending');
      setErrorMessage('');

      // Convert price to wei
      const priceInWei = parseEther(plan.price);

      // Call smart contract
      writeContract({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        functionName: 'subscribe',
        args: [plan.id, BigInt(plan.duration)],
        value: priceInWei,
      });

    } catch (error) {
      console.error('Subscription error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      setSubscriptionStatus('error');
      setIsSubscribing(false);
      onError?.(errorMsg);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!isConnected || !userSubscription) return;

    try {
      writeContract({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        functionName: 'setAutoRenew',
        args: [!userSubscription.autoRenew],
      });
    } catch (error) {
      console.error('Auto-renew toggle error:', error);
    }
  };

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isSubscribing || isWritePending || isTxLoading) return 'Processing...';
    if (plan.id === 0) return 'Current Plan';
    if (userSubscription?.plan === plan.id && userSubscription.isActive) return 'Active';
    return `Subscribe for ${plan.price} ETH`;
  };

  const getButtonStyle = () => {
    const baseStyle = "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg";
    
    if (!isConnected) {
      return `${baseStyle} bg-yellow-600 hover:bg-yellow-700 text-white`;
    }

    if (isSubscribing || isWritePending || isTxLoading) {
      return `${baseStyle} bg-gray-600 text-gray-300 cursor-not-allowed`;
    }

    if (plan.id === 0) {
      return `${baseStyle} bg-gray-600 text-gray-300 cursor-not-allowed`;
    }

    if (userSubscription?.plan === plan.id && userSubscription.isActive) {
      return `${baseStyle} bg-green-600 text-white cursor-not-allowed`;
    }

    const colorMap = {
      blue: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      green: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
      purple: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
      gray: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
    };

    return `${baseStyle} ${colorMap[plan.color as keyof typeof colorMap]} text-white`;
  };

  const isButtonDisabled = () => {
    return !isConnected || 
           isSubscribing || 
           isWritePending || 
           isTxLoading || 
           plan.id === 0 ||
           (userSubscription?.plan === plan.id && userSubscription.isActive);
  };

  return (
    <div className="space-y-4">
      
      <button
        onClick={handleSubscribe}
        disabled={isButtonDisabled()}
        className={getButtonStyle()}
      >
        {isSubscribing || isWritePending || isTxLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Processing...</span>
          </div>
        ) : (
          getButtonText()
        )}
      </button>

      
      {subscriptionStatus === 'success' && (
        <div className="bg-green-900/30 border border-green-500 rounded-lg p-3">
          <p className="text-green-400 text-sm font-semibold">✅ Subscription activated successfully!</p>
        </div>
      )}

      {subscriptionStatus === 'error' && errorMessage && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
          <p className="text-red-400 text-sm font-semibold">❌ {errorMessage}</p>
        </div>
      )}

      
      {userSubscription && userSubscription.isActive && (
        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-3">
          <div className="text-blue-400 text-sm space-y-2">
            <p className="font-semibold">📊 Current Subscription</p>
            <p>Plan: {SUBSCRIPTION_PLANS[userSubscription.plan]?.name}</p>
            <p>Expires: {new Date(Number(userSubscription.expiryDate) * 1000).toLocaleDateString()}</p>
            
            
            <div className="flex items-center justify-between pt-2 border-t border-blue-500/30">
              <span className="text-xs">Auto-renew:</span>
              <button
                onClick={handleToggleAutoRenew}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  userSubscription.autoRenew 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {userSubscription.autoRenew ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

    
      {txHash && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <p className="text-gray-400 text-xs">
            Transaction: <span className="font-mono text-blue-400">{txHash}</span>
          </p>
        </div>
      )}
    </div>
  );
}
*/}