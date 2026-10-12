import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ShoppingCartIcon, SearchIcon, DatabaseIcon, LayersIcon, PackageIcon } from "./icons";

interface NavbarProps {
  cartItemCount?: number;
}

export function Navbar({ cartItemCount = 0 }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 transition-colors">
      {/* Monolith Architecture Top Ribbon */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-medium border border-indigo-400/30">
              <LayersIcon className="w-3 h-3" /> Monolithic Architecture
            </span>
            <span className="hidden sm:inline text-indigo-200">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-indigo-100 text-[11px]">
              <DatabaseIcon className="w-3 h-3 text-sky-300" /> PostgreSQL ACID Store
            </span>
          </div>
          <Link
            to="/architecture"
            className="text-[11px] text-sky-200 hover:text-white font-medium underline flex items-center gap-1 transition"
          >
            How it works &rarr;
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <LayersIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
                Mono<span className="text-indigo-600 dark:text-indigo-400">Store</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 tracking-wider uppercase font-semibold">
                Monolithic E-Commerce
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, gear, hardware..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition"
              />
              <SearchIcon className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </form>

          {/* Nav Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/products"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive("/products")
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                  : "text-gray-700 dark:text-gray-200 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Shop Catalog
            </Link>

            <Link
              to="/orders"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive("/orders")
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                  : "text-gray-700 dark:text-gray-200 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <PackageIcon className="w-4 h-4" />
              <span>Orders</span>
            </Link>

            <Link
              to="/architecture"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition hidden sm:flex items-center gap-1.5 ${
                isActive("/architecture")
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                  : "text-gray-700 dark:text-gray-200 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <LayersIcon className="w-4 h-4 text-indigo-500" />
              <span>Architecture</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition border border-indigo-100 dark:border-indigo-800/60"
              aria-label="Shopping Cart"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-sm animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

