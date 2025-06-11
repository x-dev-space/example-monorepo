import { useState } from 'react';
import '../styles.css';


export function App() {
  const [couponCode, setCouponCode] = useState('');
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Coupon Code</h3>
      <input
        type="text"
        placeholder="Enter Your Coupon Code"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button className="w-full bg-white text-blue-600 border-2 border-blue-600 py-2 rounded-lg hover:bg-blue-50 transition">
        Apply Your Coupon
      </button>
    </div>
  );
}

export default App;
