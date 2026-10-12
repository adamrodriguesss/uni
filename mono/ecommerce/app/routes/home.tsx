import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { getFeaturedProducts, getCategories } from "../services/catalog.server";
import { ProductCard } from "../components/ProductCard";
import {
  ArrowRightIcon,
  LayersIcon,
  DatabaseIcon,
  ShieldCheckIcon,
  PackageIcon,
  TruckIcon,
  ClockIcon,
} from "../components/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MonoStore | Modern Monolithic E-Commerce Platform" },
    {
      name: "description",
      content:
        "Fast, reliable monolithic e-commerce application powered by PostgreSQL, React Router, and unified in-process domain services.",
    },
  ];
}

export async function loader() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(),
  ]);

  return {
    featuredProducts,
    categories,
  };
}

export default function Home() {
  const { featuredProducts, categories } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"></div>
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium backdrop-blur-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Single Unified Monolith Engine &bull; PostgreSQL Powered
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Modern E-Commerce, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-200 to-violet-300">
                  Engineered as a Monolith.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-indigo-100/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Discover high-performance gear powered by a clean monolithic architecture. Zero network microservice hops, atomic ACID checkout transactions, and instantaneous catalog browsing.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 group hover:translate-x-0.5"
                >
                  <span>Explore Catalog</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/architecture"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl text-sm border border-white/15 backdrop-blur transition flex items-center gap-2"
                >
                  <LayersIcon className="w-4 h-4 text-sky-300" />
                  <span>View Architecture</span>
                </Link>
              </div>

              {/* Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-indigo-800/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-bold text-sky-300">0ms</div>
                  <div className="text-xs text-indigo-200/70">Inter-service latency</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-300">ACID</div>
                  <div className="text-xs text-indigo-200/70">Atomic checkout</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-violet-300">1 Unit</div>
                  <div className="text-xs text-indigo-200/70">Unified deployment</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-gradient-to-tr from-gray-900 to-indigo-950/80 p-6 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 backdrop-blur">
                <div className="flex items-center justify-between pb-4 border-b border-indigo-800/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-xs text-indigo-300 font-mono">monolith-core.ts</span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs text-indigo-200/90">
                  <div className="text-indigo-400">// In-Process Atomic Transaction Flow</div>
                  <div className="p-3 bg-black/40 rounded-lg space-y-1.5 border border-indigo-900/50 text-[11px]">
                    <p className="text-emerald-400">BEGIN TRANSACTION;</p>
                    <p className="text-sky-300 pl-3">&rarr; SELECT stock FROM products WHERE id = $1 FOR UPDATE;</p>
                    <p className="text-sky-300 pl-3">&rarr; INSERT INTO orders (...);</p>
                    <p className="text-sky-300 pl-3">&rarr; UPDATE products SET stock = stock - 1;</p>
                    <p className="text-sky-300 pl-3">&rarr; DELETE FROM cart_items;</p>
                    <p className="text-emerald-400">COMMIT;</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2">
                    <span className="flex items-center gap-1"><DatabaseIcon className="w-3.5 h-3.5 text-sky-400" /> PostgreSQL Instance</span>
                    <span className="text-emerald-400 font-semibold">&bull; Online &amp; Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Shop by Category</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Curated hardware and accessories in our database</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            All Products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PackageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Featured Products</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Handpicked top-rated products ready for instant order</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all ({featuredProducts.length}+) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Monolithic Architecture Spotlight Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-indigo-800/40 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <LayersIcon className="w-3.5 h-3.5 text-sky-400" /> Architectural Design
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Why Monolithic Architecture for E-Commerce?</h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Unlike distributed microservices that suffer from network overhead, eventual consistency drift, and complex saga transactions, this monolithic implementation executes Catalog, Cart, and Order fulfillment in a single unified Node process backed by PostgreSQL.
            </p>
            <div className="pt-2">
              <Link
                to="/architecture"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
              >
                <span>Read Full Architecture Breakdown</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
