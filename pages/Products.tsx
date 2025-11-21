import React, { useState } from 'react';
import type { Page } from '../types';
import PageSection from '../components/PageSection';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  quantity: number;
}

interface ProductsProps {
  onNavClick?: (page: Page) => void;
}

const Products: React.FC<ProductsProps> = ({ onNavClick }) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Manipulation Robot',
      price: 2499,
      description: 'Advanced robotic arm for precision tasks',
      image: 'https://source.unsplash.com/400x300/?robotic,arm',
      quantity: 0,
    },
    {
      id: '2',
      name: 'Locomotion Bot',
      price: 1999,
      description: 'Legged robot for terrain navigation',
      image: 'https://source.unsplash.com/400x300/?robot,walking',
      quantity: 0,
    },
    {
      id: '3',
      name: 'Mobile Manipulator',
      price: 3499,
      description: 'Combined mobility and manipulation platform',
      image: 'https://source.unsplash.com/400x300/?robot,mobile',
      quantity: 0,
    },
  ]);

  const [selectedProductId, setSelectedProductId] = useState<string>('1');
  const [cart, setCart] = useState<Product[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = cart.length > 0 ? 50 : 0;
  const totalCost = cartTotal + shippingCost;

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const existingItem = cart.find((item) => item.id === selectedProduct.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === selectedProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...selectedProduct, quantity: 1 }]);
    }
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

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleCheckout = () => {
    if (onNavClick) {
      onNavClick('Checkout');
    } else {
      console.log('Proceeding to checkout', { cart, total: totalCost });
    }
  };

  return (
    <div className="space-y-12">
      <section className="text-center pt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
          Our <span className="text-red-600">Products</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our range of advanced robots and AI-powered solutions.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="mt-8 p-6 bg-white rounded-lg border border-gray-300">
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

        {/* Checkout Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>

            {selectedProduct && (
              <div className="mb-6 pb-6 border-b border-gray-300">
                <p className="text-sm text-gray-600 mb-2">Selected Product:</p>
                <h4 className="font-bold text-gray-900 mb-2">{selectedProduct.name}</h4>
                <p className="text-lg text-red-600 font-bold mb-4">${selectedProduct.price}</p>
                <button
                  onClick={handleAddToCart}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Add to Cart
                </button>
              </div>
            )}

            {/* Cart Items */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-4">Cart ({cart.length})</h4>
              {cart.length === 0 ? (
                <p className="text-gray-600 text-sm">Cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-gray-600">
                          {item.quantity}x ${item.price}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
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
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping:</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900">
                  <span>Total:</span>
                  <span className="text-red-600">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
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
  );
};

export default Products;
