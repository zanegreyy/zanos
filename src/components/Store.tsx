'use client'
import { useState } from 'react';
import { redirectToCheckout, CartItem } from '@/lib/stripe';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  features: string[];
}

const products: Product[] = [
  {
    id: '1',
    name: 'Universal Travel Charger',
    price: 49.99,
    description: 'Fast-charging universal adapter with multiple ports for all your devices',
    image: '🔌',
    features: [
      'USB-C PD 65W fast charging',
      'Compatible with 150+ countries',
      'LED charging indicator',
      'Compact foldable design'
    ]
  },
  {
    id: '2',
    name: 'Premium Laptop Bag',
    price: 89.99,
    description: 'Water-resistant laptop bag with dedicated compartments for nomads',
    image: '💼',
    features: [
      'Fits laptops up to 15.6"',
      'Water-resistant material',
      'Multiple organizational pockets',
      'Comfortable padded straps'
    ]
  },
  {
    id: '3',
    name: 'Multiport Travel Adapter',
    price: 34.99,
    description: 'All-in-one travel adapter with surge protection and multiple USB ports',
    image: '🔌',
    features: [
      'Works in 200+ countries',
      '4 USB ports + 1 USB-C',
      'Built-in surge protection',
      'Compact slide-out design'
    ]
  }
];

export default function Store() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      await redirectToCheckout(cart);
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'There was an error processing your payment. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const buyNow = async (product: Product) => {
    setIsProcessing(true);
    setError(null);
    try {
      await redirectToCheckout([{ ...product, quantity: 1 }]);
    } catch (error) {
      console.error('Buy now error:', error);
      const errorMessage = error instanceof Error ? error.message : 'There was an error processing your payment. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 shadow-2xl border border-gray-600 hover:border-purple-500/50 transition-all duration-300 hover:shadow-purple-500/10">
      <h2 className="text-3xl font-bold mb-4 text-white flex items-center gap-2">
        🛍️ Nomad Store
      </h2>
      <p className="text-gray-300 mb-6 text-lg">Essential gear for digital nomads - curated for your journey</p>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-400">❌</span>
            <h3 className="text-red-400 font-semibold">Payment Error</h3>
          </div>
          <p className="text-red-300 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-700/50 rounded-lg p-6 border border-gray-600 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{product.image}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{product.description}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-purple-400 font-medium mb-2 text-sm">Features:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-400 text-xs">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t border-gray-600 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-white">${product.price}</span>
                <span className="text-gray-400 text-sm">Free shipping</span>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Processing...' : '🛒 Add to Cart'}
                </button>
                
                <button 
                  onClick={() => buyNow(product)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Processing...' : '⚡ Buy Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="mt-8 bg-gray-800/50 border border-gray-600 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            🛒 Shopping Cart ({cart.length} items)
          </h3>
          
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{products.find(p => p.id === item.id)?.image}</span>
                  <div>
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <p className="text-gray-400 text-sm">${item.price} each</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="bg-gray-600 hover:bg-gray-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-white font-medium px-3">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-600 hover:bg-gray-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-600 hover:bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-600 pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-semibold text-white">Total: ${getCartTotal().toFixed(2)}</span>
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '⏳ Processing...' : '💳 Checkout with Stripe'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-purple-900/30 border border-purple-500/50 rounded-lg p-6 text-center">
        <h3 className="text-purple-400 font-semibold mb-2 flex items-center justify-center gap-2">
          🚀 Special Offer for Nomads
        </h3>
        <p className="text-gray-300 text-sm">
          Get 15% off your first order with code <span className="text-purple-400 font-mono">NOMAD15</span>
        </p>
      </div>
    </section>
  );
}