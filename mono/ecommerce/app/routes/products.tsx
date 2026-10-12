import { useLoaderData, useSearchParams, Link } from "react-router";
import type { Route } from "./+types/products";
import { getProducts, getCategories } from "../services/catalog.server";
import { ProductCard } from "../components/ProductCard";
import { SearchIcon, FilterIcon } from "../components/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Products Catalog | MonoStore" },
    { name: "description", content: "Browse our entire product catalog powered by PostgreSQL database." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const sort = (url.searchParams.get("sort") as any) || undefined;
  const minPriceStr = url.searchParams.get("minPrice");
  const maxPriceStr = url.searchParams.get("maxPrice");

  const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
  const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;

  const [products, categories] = await Promise.all([
    getProducts({ category, search, sort, minPrice, maxPrice }),
    getCategories(),
  ]);

  return {
    products,
    categories,
    filters: {
      category: category || "all",
      search: search || "",
      sort: sort || "featured",
    },
  };
}

export default function ProductsPage() {
  const { products, categories, filters } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleCategoryChange = (catSlug: string) => {
    const next = new URLSearchParams(searchParams);
    if (catSlug === "all") {
      next.delete("category");
    } else {
      next.set("category", catSlug);
    }
    setSearchParams(next);
  };

  const handleSortChange = (sortVal: string) => {
    const next = new URLSearchParams(searchParams);
    if (sortVal === "featured") {
      next.delete("sort");
    } else {
      next.set("sort", sortVal);
    }
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Product Catalog
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing {products.length} products stored directly in PostgreSQL
          </p>
        </div>

        {/* Sort and Filters */}
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <FilterIcon className="w-3.5 h-3.5" /> Sort:
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="featured">Featured / Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              filters.category === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                filters.category === cat.slug
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Live Active Search Indicator if searching */}
        {filters.search && (
          <div className="flex items-center gap-2 text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <span>Search query: <strong>"{filters.search}"</strong></span>
            <Link
              to="/products"
              className="text-indigo-500 hover:text-indigo-800 font-bold ml-1"
            >
              &times; Clear
            </Link>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <SearchIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No products found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            We couldn't find any products matching your selected criteria in our PostgreSQL database.
          </p>
          <Link
            to="/products"
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            Reset Filters
          </Link>
        </div>
      )}
    </div>
  );
}

