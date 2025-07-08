import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export interface CartItem {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
}

export const redirectToCheckout = async (items: CartItem[]) => {
  try {
    console.log('Starting checkout process with items:', items);
    
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    console.log('Checkout API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Checkout API error:', errorData);
      throw new Error(errorData.details || errorData.error || 'Failed to create checkout session');
    }

    const responseData = await response.json();
    console.log('Checkout API response:', responseData);
    
    const { sessionId } = responseData;
    
    if (!sessionId) {
      throw new Error('No session ID received from checkout API');
    }
    
    console.log('Loading Stripe...');
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load - check your publishable key');
    }

    console.log('Redirecting to Stripe checkout with session ID:', sessionId);
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};