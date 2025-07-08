'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // You can verify the session with your backend here
      console.log('Payment successful! Session ID:', sessionId);
      setIsLoading(false);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center">
          <div className="text-8xl mb-8">🎉</div>
          <h1 className="text-4xl font-bold mb-4 text-green-400">Payment Successful!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Thank you for your purchase! Your order has been confirmed.
          </p>
          
          <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">What&apos;s Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-3xl mb-2">📧</div>
                <h3 className="font-semibold text-green-400 mb-2">Confirmation Email</h3>
                <p className="text-gray-300 text-sm">
                  You&apos;ll receive a confirmation email with your order details and tracking information.
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-3xl mb-2">📦</div>
                <h3 className="font-semibold text-blue-400 mb-2">Processing</h3>
                <p className="text-gray-300 text-sm">
                  Your order is being processed and will be shipped within 1-2 business days.
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-3xl mb-2">🚚</div>
                <h3 className="font-semibold text-purple-400 mb-2">Delivery</h3>
                <p className="text-gray-300 text-sm">
                  Free shipping worldwide! Estimated delivery: 3-7 business days.
                </p>
              </div>
            </div>
          </div>

          {sessionId && (
            <div className="bg-gray-800 rounded-lg p-4 mb-8 border border-gray-700">
              <p className="text-gray-400 text-sm">
                Order ID: <span className="font-mono text-green-400">{sessionId}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Continue Shopping
            </Link>
            
            <div className="mt-6">
              <p className="text-gray-400 text-sm">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@zanos.io" className="text-green-400 hover:text-green-300">
                  support@zanos.io
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}