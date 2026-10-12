import { Link, useLoaderData, useFetcher, data } from "react-router";
import type { Route } from "./+types/cart";
import { getSessionId } from "../session.server";
import { getCart, updateCartQuantity, removeFromCart, clearCart } from "../services/cart.server";
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "../components/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shopping Cart | MonoStore" },
    { name: "description", content: "Review and manage items in your shopping cart." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { sessionId, headers } = getSessionId(request);
  const cartSummary = await getCart(sessionId);

  return data({ cartSummary }, { headers });
}

export async function action({ request }: Route.ActionArgs) {
  const { sessionId, headers } = getSessionId(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "update") {
    const cartItemId = parseInt(formData.get("cartItemId") as string, 10);
    const quantity = parseInt(formData.get("quantity") as string, 10);
    if (!isNaN(cartItemId) && !isNaN(quantity)) {
      await updateCartQuantity(sessionId, cartItemId, quantity);
    }
  } else if (intent === "remove") {
    const cartItemId = parseInt(formData.get("cartItemId") as string, 10);
    if (!isNaN(cartItemId)) {
      await removeFromCart(sessionId, cartItemId);
    }
  } else if (intent === "clear") {
    await clearCart(sessionId);
  }

  return data({ success: true }, { headers });
}

export default function CartPage() {
  const { cartSummary } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const isEmpty = cartSummary.items.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingCartIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span>Shopping Cart</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEmpty
              ? "Your cart is currently empty."
              : `You have ${cartSummary.itemCount} ${cartSummary.itemCount === 1 ? "item" : "items"} in your cart`}
          </p>
        </div>

        {!isEmpty && (
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="clear" />
            <button
              type="submit"
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
            >
              <TrashIcon className="w-3.5 h-3.5" /> Clear Cart
            </button>
          </fetcher.Form>
        )}
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="text-center py-20 bg-white dark:bg-gray-800/60 rounded-3xl border border-gray-200 dark:border-gray-700/60 p-8 shadow-xs">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCartIcon className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Browse our curated monolithic store catalog to add items to your cart.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-500/20"
          >
            <span>Start Shopping</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Active Cart Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 divide-y divide-gray-100 dark:divide-gray-700/60 overflow-hidden shadow-xs">
              {cartSummary.items.map((item) => (
                <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 group">
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${item.product_id}`}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0 border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {item.category_name && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {item.category_name}
                      </span>
                    )}
                    <Link
                      to={`/products/${item.product_id}`}
                      className="block font-semibold text-gray-900 dark:text-white text-base hover:text-indigo-600 transition truncate"
                    >
                      {item.name}
                    </Link>
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">
                      ${Number(item.price).toFixed(2)} each
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 p-1">
                      <fetcher.Form method="post" className="inline">
                        <input type="hidden" name="intent" value="update" />
                        <input type="hidden" name="cartItemId" value={item.id} />
                        <input type="hidden" name="quantity" value={item.quantity - 1} />
                        <button
                          type="submit"
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="w-3.5 h-3.5" />
                        </button>
                      </fetcher.Form>

                      <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>

                      <fetcher.Form method="post" className="inline">
                        <input type="hidden" name="intent" value="update" />
                        <input type="hidden" name="cartItemId" value={item.id} />
                        <input type="hidden" name="quantity" value={item.quantity + 1} />
                        <button
                          type="submit"
                          disabled={item.quantity >= item.stock}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                      </fetcher.Form>
                    </div>

                    {/* Total item price */}
                    <div className="text-right min-w-[70px]">
                      <div className="font-bold text-gray-900 dark:text-white text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove button */}
                    <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="remove" />
                      <input type="hidden" name="cartItemId" value={item.id} />
                      <button
                        type="submit"
                        className="p-2 text-gray-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Remove item"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </fetcher.Form>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/products"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs space-y-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({cartSummary.itemCount} items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">${cartSummary.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    Shipping
                    {cartSummary.subtotal > 100 && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded font-bold">
                        FREE
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {cartSummary.shipping === 0 ? "Free" : `$${cartSummary.shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">${cartSummary.tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between text-base font-extrabold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-xl text-indigo-600 dark:text-indigo-400">${cartSummary.total.toFixed(2)}</span>
                </div>
              </div>

              {cartSummary.subtotal <= 100 && (
                <div className="text-[11px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/40 flex items-center gap-2">
                  <TruckIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>
                    Add <strong>${(100 - cartSummary.subtotal).toFixed(2)}</strong> more to unlock <strong>Free Shipping</strong>!
                  </span>
                </div>
              )}

              <Link
                to="/checkout"
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                <span>Synchronous PostgreSQL checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

