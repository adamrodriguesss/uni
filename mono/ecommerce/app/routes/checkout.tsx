import React, { useState } from "react";
import { useLoaderData, useNavigation, Form, redirect, data, Link } from "react-router";
import type { Route } from "./+types/checkout";
import { getSessionId } from "../session.server";
import { getCart } from "../services/cart.server";
import { createOrder } from "../services/order.server";
import {
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowLeftIcon,
  DatabaseIcon,
  LayersIcon,
} from "../components/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checkout | MonoStore" },
    { name: "description", content: "Complete your order with atomic transaction processing." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { sessionId, headers } = getSessionId(request);
  const cartSummary = await getCart(sessionId);

  if (cartSummary.items.length === 0) {
    return redirect("/cart");
  }

  return data({ cartSummary }, { headers });
}

export async function action({ request }: Route.ActionArgs) {
  const { sessionId, headers } = getSessionId(request);
  const formData = await request.formData();

  const customerName = formData.get("customerName") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const shippingAddress = formData.get("shippingAddress") as string;
  const city = formData.get("city") as string;
  const postalCode = formData.get("postalCode") as string;
  const paymentMethod = formData.get("paymentMethod") as string;

  if (!customerName || !customerEmail || !shippingAddress || !city || !postalCode) {
    return data(
      { error: "Please fill in all required shipping fields." },
      { status: 400, headers }
    );
  }

  const result = await createOrder(sessionId, {
    customerName,
    customerEmail,
    shippingAddress,
    city,
    postalCode,
    paymentMethod: paymentMethod || "Credit Card",
  });

  if (result.error || !result.order) {
    return data(
      { error: result.error || "Failed to process order." },
      { status: 400, headers }
    );
  }

  return redirect(`/orders/${result.order.id}`, { headers });
}

export default function CheckoutPage({ actionData }: Route.ComponentProps) {
  const { cartSummary } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Quick state for prefilling test demo values
  const [formData, setFormData] = useState({
    customerName: "Alex Mercer",
    customerEmail: "alex.mercer@example.com",
    shippingAddress: "742 Evergreen Terrace",
    city: "San Francisco",
    postalCode: "94107",
    paymentMethod: "Credit Card (Simulated)",
  });

  const handlePrefill = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormData({
      customerName: "Taylor Swift",
      customerEmail: "taylor@swift.io",
      shippingAddress: "13 Cornelia Street",
      city: "New York",
      postalCode: "10014",
      paymentMethod: "Credit Card (Simulated)",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link to="/cart" className="hover:text-indigo-600 flex items-center gap-1">
              <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Cart
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Secure Checkout
          </h1>
        </div>

        <button
          onClick={handlePrefill}
          type="button"
          className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
        >
          &bull; Prefill Demo Values
        </button>
      </div>

      {actionData?.error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 text-sm">
          <strong>Order Error:</strong> {actionData.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7">
          <Form method="post" className="space-y-6">
            {/* Section 1: Customer & Shipping Details */}
            <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Customer &amp; Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customerName" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="customerEmail" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="shippingAddress" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="shippingAddress"
                    name="shippingAddress"
                    required
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Postal / ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Payment Simulation */}
            <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Payment Method (Simulation)
                </h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3.5 border border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Credit Card (Simulated)"
                    defaultChecked
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <CreditCardIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Credit / Debit Card</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Simulated instant sandbox authorization</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <TruckIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Cash on Delivery</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pay when package is delivered</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin">&#9696;</span>
                  <span>Executing PostgreSQL Transaction...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Place Order (${cartSummary.total.toFixed(2)})</span>
                </>
              )}
            </button>
          </Form>
        </div>

        {/* Order Review Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
              Items in Order ({cartSummary.itemCount})
            </h2>

            <div className="divide-y divide-gray-100 dark:divide-gray-700/60 max-h-72 overflow-y-auto pr-1">
              {cartSummary.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3 text-xs">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>${cartSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Shipping</span>
                <span>{cartSummary.shipping === 0 ? "Free" : `$${cartSummary.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Tax (8%)</span>
                <span>${cartSummary.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between text-base font-extrabold text-gray-900 dark:text-white">
                <span>Total Due</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-xl">${cartSummary.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Architecture Explainer Badge */}
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-800/40 text-[11px] text-indigo-900 dark:text-indigo-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                <DatabaseIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Atomic In-Process Commit
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Placing this order runs a synchronous PostgreSQL transaction that locks product inventory, inserts the order record, creates line items, and clears your session cart in one commit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

