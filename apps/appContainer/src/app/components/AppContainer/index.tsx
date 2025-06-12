import  { useState, lazy, Suspense} from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
const Header = lazy(() => import('header/Module'));
const CouponCode = lazy(() => import('couponCode/Module'));

const ShoppingCartApp = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Samsung Galaxy S23 Ultra S918B/DS 256GB',
      color: 'Phantom Black',
      price: 1049.99,
      quantity: 3,
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" fill="%23374151"/%3E%3Crect x="15" y="10" width="30" height="40" rx="4" fill="%231f2937"/%3E%3C/svg%3E'
    },
    {
      id: 2,
      name: 'JBL Charge 3 Waterproof Portable Bluetooth Speaker',
      color: 'Black',
      price: 109.99,
      quantity: 1,
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" fill="%23374151"/%3E%3Cellipse cx="30" cy="30" rx="25" ry="15" fill="%231f2937"/%3E%3C/svg%3E'
    },
    {
      id: 3,
      name: 'GARMIN Fenix 7X 010-02541-11 Exclusive Version',
      color: 'Black',
      price: 349.99,
      quantity: 1,
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" fill="%23374151"/%3E%3Ccircle cx="30" cy="30" r="25" fill="%231f2937"/%3E%3Ccircle cx="30" cy="30" r="20" fill="%23374151"/%3E%3C/svg%3E'
    },
    {
      id: 4,
      name: 'Beats Fit Pro - True Wireless Noise Cancelling Earbuds',
      color: 'Phantom Black',
      price: 199.99,
      quantity: 1,
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" fill="%23374151"/%3E%3Cpath d="M20 30 Q30 20 40 30" fill="%231f2937"/%3E%3C/svg%3E'
    },
    {
      id: 5,
      name: 'JLab Epic Air Sport ANC True Wireless Earbuds',
      color: 'Black',
      price: 99.99,
      quantity: 1,
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" fill="%23374151"/%3E%3Ccircle cx="20" cy="30" r="8" fill="%231f2937"/%3E%3Ccircle cx="40" cy="30" r="8" fill="%231f2937"/%3E%3C/svg%3E'
    }
  ]);


  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = 29.99;
  const tax = 39.99;
  const total = subtotal + delivery + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shopping Cart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-6">Shopping Cart</h2>
            
            <div className="space-y-4">
              {/* Table Headers */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 pb-4 border-b">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-1"></div>
              </div>

              {/* Cart Items */}
              {cartItems.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b">
                  <div className="col-span-6 flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-sm text-gray-500">Color: {item.color}</p>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="col-span-2 text-center font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center mt-6">
              <button className="text-gray-600 hover:text-gray-800">← Back</button>
              <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition">
                Cancel Order
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Coupon Code */}
            <Suspense fallback={<div>Loading...</div>}>
              <CouponCode />
            </Suspense>
            

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>$00.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>${delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 pb-3 border-b">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-semibold pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="border border-gray-300 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:border-blue-500">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">P</div>
                </div>
                <div className="border border-gray-300 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:border-blue-500">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs">S</div>
                </div>
                <div className="border border-gray-300 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:border-blue-500">
                  <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                </div>
                <div className="border border-gray-300 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:border-blue-500">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">B</div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
              Check Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartApp;