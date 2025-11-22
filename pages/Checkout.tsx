import React, { useState } from 'react';
import type { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import PageSection from '../components/PageSection';

interface CheckoutProps {
  onNavClick?: (page: Page) => void;
}

interface CartItem {
  id: string;
  name: string;
  price?: number;
  monthlyPrice?: number;
  annualPrice?: number;
  quantity: number;
  type: 'product' | 'service';
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface OrderSummary {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
}

const Checkout: React.FC<CheckoutProps> = ({ onNavClick }) => {
  const { user, isLoggedIn } = useAuth();
  const [step, setStep] = useState<'payment' | 'address' | 'review' | 'success'>('payment');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });

  const [billingAddress, setBillingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefaultBilling: true,
  });

  // Retrieve cart from localStorage (in a real app, this would come from props or context)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderSummary[]>(() => {
    try {
      const storedOrders = localStorage.getItem('orders');
      return storedOrders ? JSON.parse(storedOrders) : [];
    } catch {
      return [];
    }
  });

  const paymentMethods: PaymentMethod[] = [
    { id: 'credit_card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
    { id: 'payoneer', name: 'Payoneer', icon: '💰' },
  ];

  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.price ?? item.monthlyPrice ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingCost = cart.some(item => item.type === 'product') ? 50 : 0;
  const cartTotal = cartSubtotal + shippingCost;

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    if (methodId === 'credit_card') {
      setStep('payment');
    } else if (methodId === 'paypal') {
      setStep('address');
    } else if (methodId === 'payoneer') {
      setStep('address');
    }
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const isCardDetailsValid = () => {
    return (
      cardDetails.cardNumber.length >= 13 &&
      cardDetails.cardholderName.trim() !== '' &&
      cardDetails.expiryDate.match(/^\d{2}\/\d{2}$/) &&
      cardDetails.cvv.length >= 3
    );
  };

  const isBillingAddressValid = () => {
    return (
      billingAddress.fullName.trim() !== '' &&
      billingAddress.email.trim() !== '' &&
      billingAddress.phone.trim() !== '' &&
      billingAddress.address.trim() !== '' &&
      billingAddress.city.trim() !== '' &&
      billingAddress.state.trim() !== '' &&
      billingAddress.zipCode.trim() !== '' &&
      billingAddress.country.trim() !== ''
    );
  };

  const isShippingAddressValid = () => {
    return (
      shippingAddress.fullName.trim() !== '' &&
      shippingAddress.phone.trim() !== '' &&
      shippingAddress.address.trim() !== '' &&
      shippingAddress.city.trim() !== '' &&
      shippingAddress.state.trim() !== '' &&
      shippingAddress.zipCode.trim() !== '' &&
      shippingAddress.country.trim() !== ''
    );
  };

  const handleReviewPayment = () => {
    if (selectedPaymentMethod === 'credit_card') {
      if (!isCardDetailsValid() || !isBillingAddressValid()) {
        alert('Please fill in all required fields correctly');
        return;
      }
    } else if (!isBillingAddressValid()) {
      alert('Please fill in billing address');
      return;
    }

    if (!isShippingAddressValid()) {
      alert('Please fill in shipping address');
      return;
    }

    setStep('review');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newOrder: OrderSummary = {
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        items: cart,
        subtotal: cartSubtotal,
        shipping: shippingCost,
        total: cartTotal,
        paymentMethod: selectedPaymentMethod,
        status: 'completed',
      };

      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Clear cart
      setCart([]);
      localStorage.removeItem('cart');

      // Store order for admin dashboard
      const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      adminOrders.push({
        ...newOrder,
        userEmail: user?.email,
        userName: user?.name,
        shippingAddress,
        billingAddress,
      });
      localStorage.setItem('adminOrders', JSON.stringify(adminOrders));

      setStep('success');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You must be logged in to proceed with checkout</p>
          <button
            onClick={() => onNavClick?.('Products')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="bg-white p-12 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been placed successfully. Check your email for confirmation.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-600">
              <strong>Order ID:</strong> {orders[orders.length - 1]?.id}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Total:</strong> ${cartTotal.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => onNavClick?.('Products')}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12">
      <PageSection title="Checkout">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Payment Method Selection */}
              {step !== 'success' && (
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-red-600"
                        style={{
                          borderColor: selectedPaymentMethod === method.id ? '#d32f2f' : '#e5e7eb',
                          backgroundColor: selectedPaymentMethod === method.id ? '#fef2f2' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={(e) => handlePaymentMethodSelect(e.target.value)}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-2xl ml-4">{method.icon}</span>
                        <span className="ml-4 text-lg font-semibold text-gray-900">{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Credit/Debit Card Form */}
              {selectedPaymentMethod === 'credit_card' && step === 'payment' && (
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Card Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={handleCardInputChange}
                        maxLength="19"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardholderName"
                        placeholder="John Doe"
                        value={cardDetails.cardholderName}
                        onChange={handleCardInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Expiry Date (MM/YY)</label>
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="12/25"
                          value={cardDetails.expiryDate}
                          onChange={handleCardInputChange}
                          maxLength="5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={handleCardInputChange}
                          maxLength="4"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Address */}
              {(step === 'payment' || step === 'address') && (
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Billing Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={billingAddress.fullName}
                          onChange={handleBillingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={billingAddress.email}
                          onChange={handleBillingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={billingAddress.phone}
                          onChange={handleBillingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Country *</label>
                        <input
                          type="text"
                          name="country"
                          value={billingAddress.country}
                          onChange={handleBillingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={billingAddress.address}
                        onChange={handleBillingAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">State/Province *</label>
                        <input
                          type="text"
                          name="state"
                          value={billingAddress.state}
                          onChange={handleBillingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">ZIP Code *</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={billingAddress.zipCode}
                          onChange={handleBillingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {(step === 'address' || step === 'review') && (
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={shippingAddress.fullName}
                          onChange={handleShippingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingAddress.phone}
                          onChange={handleShippingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleShippingAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleShippingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">State/Province *</label>
                        <input
                          type="text"
                          name="state"
                          value={shippingAddress.state}
                          onChange={handleShippingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">ZIP Code *</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={handleShippingAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleShippingAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Review & Payment */}
              {step === 'review' && (
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Review</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-900">
                      <span>Subtotal:</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                    {shippingCost > 0 && (
                      <div className="flex justify-between text-gray-900">
                        <span>Shipping:</span>
                        <span>${shippingCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-red-600">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                      isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Pay'}
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              {step !== 'success' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (step === 'payment') {
                        onNavClick?.('Products');
                      } else if (step === 'address') {
                        setStep('payment');
                      } else if (step === 'review') {
                        setStep('address');
                      }
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 cursor-pointer font-semibold"
                  >
                    Back
                  </button>
                  {step !== 'review' && (
                    <button
                      onClick={handleReviewPayment}
                      disabled={!selectedPaymentMethod}
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                        !selectedPaymentMethod
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      Review Payment
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Items</h4>
                  {cart.length === 0 ? (
                    <p className="text-gray-600 text-sm">Cart is empty</p>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ${((item.price ?? item.monthlyPrice ?? 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping:</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total:</span>
                    <span className="text-red-600">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageSection>
    </div>
  );
};

export default Checkout;
