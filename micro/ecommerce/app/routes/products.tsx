import { Link } from "react-router";
import type { Route } from "./+types/products";
import { fetchFromGateway } from "../lib/api.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  
  try {
    const products = await fetchFromGateway(`/api/search/products${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    return { products: Array.isArray(products) ? products : [], q, error: null };
  } catch (err: any) {
    return { products: [], q, error: err.message };
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "MicroShop - Product Catalog" }];
}

export default function Products({ loaderData }: Route.ComponentProps) {
  const { products, q, error } = loaderData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Product Catalog</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Served via the Search Microservice (Port 4001)
        </p>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-sm">
          <p className="font-semibold mb-1">Notice:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <form method="get" className="flex gap-3 max-w-xl">
        <input 
          type="text" 
          name="q" 
          defaultValue={q} 
          placeholder="Search products by name or keyword..." 
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
        >
          Search
        </button>
        {q && (
          <Link
            to="/products"
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p: any) => (
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

      {products.length === 0 && !error && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-slate-600 dark:text-slate-400">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
}
