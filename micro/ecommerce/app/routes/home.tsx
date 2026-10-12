import { Link } from "react-router";
import type { Route } from "./+types/home";
import { fetchFromGateway } from "../lib/api.server";

export async function loader() {
  try {
    const { featuredIds } = await fetchFromGateway('/api/home/feed');
    
    // For each featured ID, fetch product details from Search Service
    const featuredProducts = await Promise.all(
      (featuredIds || []).map(async (id: string) => {
        try {
          const product = await fetchFromGateway(`/api/search/products/${id}`);
          return product;
        } catch {
          return null;
        }
      })
    );

    return { featuredProducts: featuredProducts.filter(Boolean), error: null };
  } catch (err: any) {
    return { featuredProducts: [], error: err.message };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MicroShop - Home" },
    { name: "description", content: "Welcome to MicroShop!" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featuredProducts, error } = loaderData;

  return (
    <div className="space-y-10">
      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-sm">
          <p className="font-semibold mb-1">Backend Connection Notice:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Hero Banner */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 rounded-xl text-center shadow-xs">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Welcome to MicroShop
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-8">
          A full-stack e-commerce system powered by independent Node.js microservices and Dockerized PostgreSQL instances.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-xs"
          >
            Browse Products
          </Link>
          <Link
            to="/architecture"
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            View Architecture
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Products</h2>
          <Link to="/products" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            View all &rarr;
          </Link>
        </div>

        {featuredProducts.length === 0 && !error && (
          <p className="text-slate-500 dark:text-slate-400 text-sm">No featured products available.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredProducts.map((p: any) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col"
            >
              <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">{p.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-1">{p.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    ${(p.price / 100).toFixed(2)}
                  </span>
                  <Link
                    to={`/products/${p.id}`}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
