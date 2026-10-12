import { Link } from "react-router";
import { LayersIcon, DatabaseIcon, ShieldCheckIcon, TruckIcon } from "./icons";

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20 transition-colors">
      {/* Value props bar */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3.5">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <LayersIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Monolithic In-Process Architecture</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Zero network latency between domain services</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <DatabaseIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">PostgreSQL ACID Transactions</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Atomic checkout & immediate inventory synchronization</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5">
              <div className="p-3 bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 rounded-xl">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Single Unified Deployment</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Full-stack React Router SSR runtime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">MonoStore</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              A reference implementation of a modern monolithic e-commerce application powered by PostgreSQL, React Router, and unified domain modules.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Shop Categories</h5>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li><Link to="/products?category=electronics" className="hover:text-indigo-600 transition">Electronics</Link></li>
              <li><Link to="/products?category=audio" className="hover:text-indigo-600 transition">Audio & Sound</Link></li>
              <li><Link to="/products?category=wearables" className="hover:text-indigo-600 transition">Wearables</Link></li>
              <li><Link to="/products?category=home-office" className="hover:text-indigo-600 transition">Home & Office</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-indigo-600 transition">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">System</h5>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li><Link to="/products" className="hover:text-indigo-600 transition">Product Catalog</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-600 transition">Active Cart</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-600 transition">Order History</Link></li>
              <li><Link to="/architecture" className="hover:text-indigo-600 transition">Architecture Blueprint</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Tech Specs</h5>
            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Stack:</span> React 19 + React Router SSR</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Database:</span> PostgreSQL with ACID transactions</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Style:</span> Tailwind CSS</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Architecture:</span> Unified Monolith</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} MonoStore. Monolithic E-Commerce Architecture Demo.</p>
          <p className="mt-2 sm:mt-0">Built with React Router and PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}

