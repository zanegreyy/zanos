import { NextResponse } from 'next/server';

export async function GET() {
  const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
  const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
  
  return NextResponse.json({
    environment: {
      hasSecretKey,
      hasPublishableKey,
      hasWebhookSecret,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'not_set',
      publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) || 'not_set',
    }
  });
}