import React, { useState } from 'react';
import type { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import PageSection from '../components/PageSection';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  quantity?: number;
  category: 'products' | 'robotic-services' | 'ai-services';
}

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  description: string;
  highlighted?: boolean;
  category: 'robotic-services' | 'ai-services';
}

interface SelectedItem {
  id: string;
  name: string;
  price?: number;
  monthlyPrice?: number;
  annualPrice?: number;
  type: 'product' | 'service';
}

interface ProductsProps {
  onNavClick?: (page: Page) => void;
}

const Products: React.FC<ProductsProps> = ({ onNavClick }) => {
  const { isLoggedIn } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeCategory, setActiveCategory] = useState<'products' | 'robotic-services' | 'ai-services'>('products');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [cart, setCart] = useState<(SelectedItem & { quantity: number })[]>([]);

  // Physical Products
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Manipulation Robot',
      price: 2499,
      description: 'Advanced robotic arm for precision tasks',
      image: 'https://source.unsplash.com/400x300/?robotic,arm',
      quantity: 0,
      category: 'products',
    },
    {
      id: '2',
      name: 'Locomotion Bot',
      price: 1999,
      description: 'Legged robot for terrain navigation',
      image: 'https://source.unsplash.com/400x300/?robot,walking',
      quantity: 0,
      category: 'products',
    },
    {
      id: '3',
      name: 'Mobile Manipulator',
      price: 3499,
      description: 'Combined mobility and manipulation platform',
      image: 'https://source.unsplash.com/400x300/?robot,mobile',
      quantity: 0,
      category: 'products',
    },
  ]);

  // RAAS - Robots as a Service
  const raasServices: PricingPlan[] = [
    {
      id: 'raas_1',
      name: 'Starter',
      monthlyPrice: 299,
      annualPrice: 2990,
      description: 'Perfect for small projects and learning',
      features: [
        'Access to basic robots',
        'Up to 100 hours/month usage',
        'Email support',
        'Basic analytics',
        'Community forum access',
      ],
      category: 'robotic-services',
    },
    {
      id: 'raas_2',
      name: 'Professional',
      monthlyPrice: 799,
      annualPrice: 7990,
      description: 'For growing businesses',
      features: [
        'Access to all robots',
        'Unlimited hours/month usage',
        'Priority email support',
        'Advanced analytics',
        'API access',
        'Custom configurations',
      ],
      highlighted: true,
      category: 'robotic-services',
    },
    {
      id: 'raas_3',
      name: 'Enterprise',
      monthlyPrice: 1999,
      annualPrice: 19990,
      description: 'For large-scale operations',
      features: [
        'Dedicated robot fleet',
        'Unlimited usage',
        '24/7 phone support',
        'Real-time analytics',
        'Full API access',
        'Custom integrations',
        'SLA guarantee',
        'Dedicated account manager',
      ],
      category: 'robotic-services',
    },
  ];

  // SAAS - Simulation as a Service (moved from AI Services)
  const saasServices: PricingPlan[] = [
    {
      id: 'sim_1',
      name: 'Basic',
      monthlyPrice: 199,
      annualPrice: 1990,
      description: 'For simple simulations',
      features: [
        'Access to basic simulation tools',
        'Up to 50 simulation runs/month',
        'Standard environments',
        'Email support',
        'Data export',
      ],
      category: 'robotic-services',
    },
    {
      id: 'sim_2',
      name: 'Advanced',
      monthlyPrice: 599,
      annualPrice: 5990,
      description: 'For advanced research',
      features: [
        'All Basic features',
        'Unlimited simulation runs',
        'Custom environments',
        'Priority support',
        'Advanced data analytics',
        'Team collaboration tools',
        'Version control',
      ],
      highlighted: true,
      category: 'robotic-services',
    },
    {
      id: 'sim_3',
      name: 'Research',
      monthlyPrice: 1499,
      annualPrice: 14990,
      description: 'For research institutions',
      features: [
        'All Advanced features',
        'Custom simulation development',
        'GPU acceleration',
        'Dedicated support team',
        'Publication support',
        'Institutional licensing',
        'Custom integrations',
      ],
      category: 'robotic-services',
    },
  ];

  // ODIN Variants (AI Services)
  const odinServices: PricingPlan[] = [
    {
      id: 'ai_1',
      name: 'ODIN Freelancer',
      monthlyPrice: 199,
      annualPrice: 1990,
      description: 'For independent developers and contractors',
      features: [
        'Access to ODIN Freelancer suite',
        'Up to 50 projects/month',
        'Standard templates',
        'Email support',
        'Community access',
      ],
      category: 'ai-services',
    },
    {
      id: 'ai_2',
      name: 'ODIN Space',
      monthlyPrice: 599,
      annualPrice: 5990,
      description: 'For space exploration and satellite applications',
      features: [
        'All Freelancer features',
        'Advanced space algorithms',
        'Unlimited projects',
        'Priority support',
        'Custom orbital mechanics',
        'Collaboration tools',
        'API access',
      ],
      highlighted: true,
      category: 'ai-services',
    },
    {
      id: 'ai_3',
      name: 'ODIN Education',
      monthlyPrice: 299,
      annualPrice: 2990,
      description: 'For educational institutions and students',
      features: [
        'Complete education platform',
        'Unlimited student accounts',
        'Curriculum resources',
        'Interactive tutorials',
        'Research tools',
        'Institutional support',
        'Custom learning paths',
      ],
      category: 'ai-services',
    },
    {
      id: 'ai_4',
      name: 'ODIN Health',
      monthlyPrice: 999,
      annualPrice: 9990,
      description: 'For healthcare and medical research',
      features: [
        'Medical AI algorithms',
        'HIPAA compliance',
        'Patient data protection',
        'Advanced analytics',
        '24/7 dedicated support',
        'Integration with medical systems',
        'Custom health models',
      ],
      category: 'ai-services',
    },
  ];

  const [selectedProductId, setSelectedProductId] = useState<string>('1');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Physical Products Data
  const physicalProducts = products;
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Calculate totals
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.price ?? item.monthlyPrice ?? 0;
    return sum + price * item.quantity;
  }, 0);
  const shippingCost = cart.length > 0 && activeCategory === 'products' ? 50 : 0;
  const totalCost = cartTotal + shippingCost;

  const handleSelectItem = (item: Product | PricingPlan) => {
    const selectedItem: SelectedItem = {
      id: item.id,
      name: item.name,
      type: 'price' in item ? 'product' : 'service',
      ...(('price' in item) && { price: item.price }),
      ...(('monthlyPrice' in item) && { monthlyPrice: item.monthlyPrice, annualPrice: item.annualPrice }),
    };
    setSelectedItems([...selectedItems, selectedItem]);
  };

  const handleRemoveSelected = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    selectedItems.forEach((item) => {
      const existingItem = cart.find((i) => i.id === item.id);
      if (existingItem) {
        setCart(
          cart.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        );
      } else {
        setCart([...cart, { ...item, quantity: 1 }]);
      }
    });
    setSelectedItems([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    // Save cart to localStorage before navigating to checkout
    localStorage.setItem('cart', JSON.stringify(cart));
    if (onNavClick) {
      onNavClick('Checkout');
    } else {
      console.log('Proceeding to checkout', { cart, total: totalCost });
    }
  };

  const PricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    const period = billingCycle === 'monthly' ? 'month' : 'year';
    const savings = billingCycle === 'annual' ? Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100) : 0;

    return (
      <div
        className={`rounded-lg p-8 border transition-all ${
          plan.highlighted
            ? 'border-red-600 bg-red-50 shadow-lg shadow-red-600/20 transform scale-105'
            : 'border-gray-200 bg-white hover:shadow-md'
        }`}
      >
        {plan.highlighted && (
          <div className="mb-4">
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </span>
          </div>
        )}

        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">${price}</span>
            <span className="text-gray-600">/{period}</span>
          </div>
          {savings > 0 && (
            <p className="text-sm text-green-600 font-semibold">Save {savings}% with annual billing</p>
          )}
        </div>

        <button
          onClick={() => handleSelectItem(plan)}
          className={`w-full py-3 rounded-lg font-semibold mb-8 transition-colors cursor-pointer ${
            plan.highlighted
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Subscribe
        </button>

        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          Products and <span className="text-red-600">Services</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose from our range of physical products and AI-powered service subscriptions.
        </p>
      </section>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-4 justify-center">
        {[
          { id: 'products', label: 'Robot Store' },
          { id: 'robotic-services', label: 'Robotic Services' },
          { id: 'ai-services', label: 'AI Services' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Robot Store */}
      {activeCategory === 'products' && (
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Robot <span className="text-red-600">Store</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProductId === product.id
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                      <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <p className="text-lg font-bold text-red-600">${product.price}</p>
                    </div>
                  ))}
                </div>

                {/* Image Upload */}
                <div className="p-6 bg-white rounded-lg border border-gray-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Custom Product Image</h3>
                  <div className="flex flex-col items-center">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="uploaded" className="w-full h-48 object-cover rounded-lg mb-4" />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                        <p className="text-gray-500">No image selected</p>
                      </div>
                    )}
                    <label className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700">
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                {/* Selected Products and Services Section */}
                <div className="mb-6 pb-6 border-b border-gray-300">
                  <h4 className="font-bold text-gray-900 mb-3 text-sm">Selected Products and Services</h4>
                  {selectedItems.length === 0 ? (
                    <p className="text-gray-600 text-sm">No items selected</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-600">
                              ${item.price ?? item.monthlyPrice ?? 0}
                              {item.monthlyPrice ? '/' : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveSelected(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs cursor-pointer flex-shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Product Preview */}
                {selectedProduct && (
                  <div className="mb-6 pb-6 border-b border-gray-300">
                    <p className="text-sm text-gray-600 mb-2">Current Product:</p>
                    <h4 className="font-bold text-gray-900 mb-2">{selectedProduct.name}</h4>
                    <p className="text-lg text-red-600 font-bold mb-4">${selectedProduct.price}</p>
                    <button
                      onClick={() => handleSelectItem(selectedProduct)}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold cursor-pointer text-sm"
                    >
                      Add to Selected
                    </button>
                  </div>
                )}

                {/* Cart Items */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 text-sm">Cart ({cart.length})</h4>
                  {cart.length === 0 ? (
                    <p className="text-gray-600 text-sm">Cart is empty</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-600">
                              {item.quantity}x ${('monthlyPrice' in item ? item.monthlyPrice : item.price)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Details */}
                {cart.length > 0 && (
                  <div className="space-y-2 mb-6 pb-6 border-b border-gray-300">
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span>Subtotal:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span>Shipping:</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-red-600">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={selectedItems.length === 0}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer mb-3 text-sm ${
                    selectedItems.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Add to Cart
                </button>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors cursor-pointer text-sm ${
                    cart.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Robotic Services */}
      {activeCategory === 'robotic-services' && (
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Robotic <span className="text-red-600">Services</span>
          </h2>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-lg p-1 flex gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Annual (Save up to 17%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* RAAS Section */}
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                  Robots as a <span className="text-red-600">Service (RAAS)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {raasServices.map((plan) => (
                    <PricingCard key={plan.id} plan={plan} />
                  ))}
                </div>
              </div>

              {/* SAAS Section */}
              <div>
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                  Simulation as a <span className="text-red-600">Service (SAAS)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {saasServices.map((plan) => (
                    <PricingCard key={plan.id} plan={plan} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                {/* Selected Products and Services Section */}
                <div className="mb-6 pb-6 border-b border-gray-300">
                  <h4 className="font-bold text-gray-900 mb-3 text-sm">Selected Products and Services</h4>
                  {selectedItems.length === 0 ? (
                    <p className="text-gray-600 text-sm">No items selected</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-600">
                              ${billingCycle === 'monthly' ? item.monthlyPrice : item.annualPrice}/
                              {billingCycle === 'monthly' ? 'mo' : 'yr'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveSelected(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs cursor-pointer flex-shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 text-sm">Cart ({cart.length})</h4>
                  {cart.length === 0 ? (
                    <p className="text-gray-600 text-sm">Cart is empty</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-600">
                              {item.quantity}x ${billingCycle === 'monthly' ? item.monthlyPrice : item.annualPrice}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Details */}
                {cart.length > 0 && (
                  <div className="space-y-2 mb-6 pb-6 border-b border-gray-300">
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span>Subtotal:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-red-600">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={selectedItems.length === 0}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer mb-3 text-sm ${
                    selectedItems.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Add to Cart
                </button>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors cursor-pointer text-sm ${
                    cart.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: AI Services */}
      {activeCategory === 'ai-services' && (
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            AI <span className="text-red-600">Services</span>
          </h2>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-lg p-1 flex gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Annual (Save up to 17%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* ODIN Variants Section */}
              <div>
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                  ODIN <span className="text-red-600">Variants</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {odinServices.map((plan) => (
                    <PricingCard key={plan.id} plan={plan} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                {/* Selected Products and Services Section */}
                <div className="mb-6 pb-6 border-b border-gray-300">
                  <h4 className="font-bold text-gray-900 mb-3 text-sm">Selected Products and Services</h4>
                  {selectedItems.length === 0 ? (
                    <p className="text-gray-600 text-sm">No items selected</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-600">
                              ${billingCycle === 'monthly' ? item.monthlyPrice : item.annualPrice}/
                              {billingCycle === 'monthly' ? 'mo' : 'yr'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveSelected(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs cursor-pointer flex-shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 text-sm">Cart ({cart.length})</h4>
                  {cart.length === 0 ? (
                    <p className="text-gray-600 text-sm">Cart is empty</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-600">
                              {item.quantity}x ${billingCycle === 'monthly' ? item.monthlyPrice : item.annualPrice}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Details */}
                {cart.length > 0 && (
                  <div className="space-y-2 mb-6 pb-6 border-b border-gray-300">
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span>Subtotal:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-red-600">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={selectedItems.length === 0}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer mb-3 text-sm ${
                    selectedItems.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Add to Cart
                </button>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors cursor-pointer text-sm ${
                    cart.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <PageSection title="Frequently Asked Questions">
        <div className="max-w-3xl mx-auto text-left space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Can I change my subscription plan anytime?</h3>
            <p className="text-gray-700 text-justify">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-700 text-justify">
              We accept all major credit cards, bank transfers, and PayPal for your convenience.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Is there a discount for annual billing?</h3>
            <p className="text-gray-700 text-justify">
              Absolutely! Annual plans offer up to 17% savings compared to monthly billing.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Do you offer custom enterprise plans?</h3>
            <p className="text-gray-700 text-justify">
              Yes! Contact our sales team for custom pricing and enterprise solutions tailored to your needs.
            </p>
          </div>
        </div>
      </PageSection>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Products;

