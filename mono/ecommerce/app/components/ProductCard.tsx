import React from "react";
import { Link, useFetcher } from "react-router";
import type { Product } from "../types";
import { ShoppingCartIcon, StarIcon, CheckIcon } from "./icons";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const fetcher = useFetcher();
  const isAdding = fetcher.state !== "idle";
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const justAdded = fetcher.data && (fetcher.data as any).success;

  return (
    <div className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all duration-300">
      {/* Image and badges */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-4/3">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.category_name && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-white/90 dark:bg-gray-900/90 backdrop-blur text-gray-800 dark:text-gray-200 rounded-full shadow-xs">
            {product.category_name}
          </span>
        )}
        {product.featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 text-white rounded-full shadow-xs">
            Featured
          </span>
        )}
      </Link>

      {/* Product info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Rating and Stock */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 text-amber-500">
            <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {Number(product.rating).toFixed(1)}
            </span>
          </div>

          {isOutOfStock ? (
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
              Only {product.stock} left
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              In stock ({product.stock})
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/products/${product.id}`} className="block mb-1.5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Snippet */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-3 mt-auto">
          <div>
            <div className="text-xs text-gray-400">Price</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ${Number(product.price).toFixed(2)}
            </div>
          </div>

          <fetcher.Form method="post" action="/api/cart">
            <input type="hidden" name="action" value="add" />
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="quantity" value="1" />

            <button
              type="submit"
              disabled={isOutOfStock || isAdding}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                isOutOfStock
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  : justAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-indigo-500/20"
              }`}
            >
              {justAdded ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-3.5 h-3.5" />
                  <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
                </>
              )}
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}

