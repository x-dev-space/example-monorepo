import '../styles.css';
import { ShoppingCart, Search } from 'lucide-react';

export function App() {
  return (
    <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-2">
                  X
                </div>
                <span className="text-xl font-semibold">Render ATL EXAMPLE</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Categories</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">About Us</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Contact Us</a>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <ShoppingCart className="w-6 h-6 text-gray-600 cursor-pointer" />
              <Search className="w-6 h-6 text-gray-600 cursor-pointer" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                My Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>
  );
}

export default App;
