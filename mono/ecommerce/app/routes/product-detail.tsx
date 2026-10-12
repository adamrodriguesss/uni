import { useState } from "react";
import { useLoaderData, Link, useFetcher } from "react-router";
import type { Route } from "./+types/product-detail";
import { getProductById, getRelatedProducts } from "../services/catalog.server";
import { ProductCard } from "../components/ProductCard";
import {
  ShoppingCartIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  MinusIcon,
} from "../components/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Product Details | MonoStore" },
    { name: "description", content: "Detailed product specifications and instant checkout." },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const productId = parseInt(params.id || "", 10);
  if (isNaN(productId)) {
    throw new Response("Product Not Found", { status: 404 });
  }

  const product = await getProductById(productId);
  if (!product) {
    throw new Response("Product Not Found", { status: 404 });
  }

  const related = await getRelatedProducts(product.id, product.category_id, 4);

  return { product, related };
}

export default function ProductDetailPage() {
  const { product, related } = useLoaderData<typeof loader>();
  const [quantity, setQuantity] = useState(1);
  const fetcher = useFetcher();

  const isAdding = fetcher.state !== "idle";
  const justAdded = fetcher.data && (fetcher.data as any).success;
  const isOutOfStock = product.stock <= 0;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/products" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition">
          <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Products
        </Link>
        <span>/</span>
        <Link
          to={`/products?category=${product.category_name?.toLowerCase().replace(/\s+/g, "-")}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Main Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-200 dark:border-gray-700/70 p-6 sm:p-10 shadow-xs">
        {/* Product Image */}
        <div className="lg:col-span-6">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.category_name && (
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-white/90 dark:bg-gray-900/90 backdrop-blur text-gray-800 dark:text-gray-200 rounded-full shadow-xs">
                {product.category_name}
              </span>
            )}
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-500">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {Number(product.rating).toFixed(1)} Rating
                </span>
              </div>

              {isOutOfStock ? (
                <span className="px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-full">
                  Out of Stock
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-full">
                  In Stock ({product.stock} units available)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {product.name}
            </h1>

            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              ${Number(product.price).toFixed(2)}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-2 border-t border-gray-100 dark:border-gray-700">
              {product.description}
            </p>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white dark:hover:bg-gray-800 transition"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white dark:hover:bg-gray-800 transition"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <fetcher.Form method="post" action="/api/cart" className="flex-1">
                <input type="hidden" name="action" value="add" />
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="quantity" value={quantity} />

                <button
                  type="submit"
                  disabled={isOutOfStock || isAdding}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : justAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-98"
                  }`}
                >
                  {justAdded ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Added {quantity} to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon className="w-4 h-4" />
                      <span>{isAdding ? "Adding to Cart..." : "Add to Cart"}</span>
                    </>
                  )}
                </button>
              </fetcher.Form>

              <Link
                to="/cart"
                className="py-3.5 px-6 rounded-xl font-semibold text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-center transition"
              >
                Go to Cart
              </Link>
            </div>

            {/* Guarantee / Value info */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-indigo-500" />
                <span>Fast &amp; Reliable Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-indigo-500" />
                <span>PostgreSQL ACID Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Similar Products in {product.category_name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
