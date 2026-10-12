import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/order-detail";
import { getOrderById } from "../services/order.server";
import {
  CheckCircleIcon,
  PackageIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  DatabaseIcon,
} from "../components/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Order Receipt & Tracking | MonoStore" },
    { name: "description", content: "Order fulfillment status and itemized receipt." },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const orderId = parseInt(params.id || "", 10);
  if (isNaN(orderId)) {
    throw new Response("Order Not Found", { status: 404 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    throw new Response("Order Not Found", { status: 404 });
  }

  return { order };
}

export default function OrderDetailPage() {
  const { order } = useLoaderData<typeof loader>();

  const steps = [
    { label: "Order Placed", status: "complete", icon: CheckCircleIcon },
    {
      label: "Processing",
      status: order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? "complete" : "current",
      icon: PackageIcon,
    },
    {
      label: "Shipped",
      status: order.status === "shipped" || order.status === "delivered" ? "complete" : "upcoming",
      icon: TruckIcon,
    },
    {
      label: "Delivered",
      status: order.status === "delivered" ? "complete" : "upcoming",
      icon: ShieldCheckIcon,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to All Orders
      </Link>

      {/* Success Header Box */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 sm:p-8 text-center space-y-3">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
          <CheckCircleIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
          Order Confirmed!
        </h1>
        <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
          Thank you, <strong>{order.customer_name}</strong>. Your order has been recorded into the PostgreSQL database.
        </p>
        <div className="inline-block px-4 py-1.5 bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-mono font-bold text-gray-800 dark:text-gray-200 shadow-xs">
          Order ID: {order.order_number}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Fulfillment Timeline
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = step.status === "complete";
            return (
              <div key={idx} className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">{step.label}</div>
                <div className="text-[10px] text-gray-500 capitalize">{step.status}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer & Shipping Details */}
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            Shipping &amp; Customer Details
          </h2>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">Customer:</span> {order.customer_name}
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">Email:</span> {order.customer_email}
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">Address:</span> {order.shipping_address}, {order.city} {order.postal_code}
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">Payment Method:</span> {order.payment_method}
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">Placed At:</span> {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Payment & Cost Summary */}
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
            Financial Summary
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Shipping</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Number(order.shipping_cost) === 0 ? "Free" : `$${Number(order.shipping_cost).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Tax (8%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">${Number(order.tax).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
              <span>Total Paid</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
                ${Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <DatabaseIcon className="w-3.5 h-3.5" /> Committed to PostgreSQL
            </span>
          </div>
        </div>
      </div>

      {/* Purchased Items List */}
      <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white text-base">
          Order Items ({order.items?.length || 0})
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {order.items?.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                />
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">
                    {item.product_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Qty: {item.quantity} &times; ${Number(item.price).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="font-bold text-sm text-gray-900 dark:text-white">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Link
          to="/products"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          Continue Shopping
        </Link>
        <Link
          to="/orders"
          className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
}
