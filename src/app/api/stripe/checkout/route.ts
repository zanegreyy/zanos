import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check for required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Stripe checkout API called');
    const { items } = await request.json();
    console.log('Received items:', items);

    if (!items || !Array.isArray(items)) {
      console.error('Invalid items array:', items);
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      console.error('Empty items array');
      return NextResponse.json(
        { error: 'Cart cannot be empty' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.name || !item.price || typeof item.price !== 'number') {
        console.error('Invalid item structure:', item);
        return NextResponse.json(
          { error: 'Invalid item structure' },
          { status: 400 }
        );
      }
    }

    const lineItems = items.map((item: { name: string; description: string; price: number; quantity?: number }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || '',
          images: [], // You can add product images here
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    console.log('Creating Stripe session with line items:', lineItems);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'DK', 'NO', 'FI'],
      },
      metadata: {
        order_type: 'nomad_store',
      },
    });

    console.log('Stripe session created successfully:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    // More specific error handling
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', {
        type: error.type,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      });
      return NextResponse.json(
        { 
          error: 'Payment processing error',
          details: error.message 
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error creating checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}