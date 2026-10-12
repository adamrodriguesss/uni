import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/orders";
import { getAllOrders } from "../services/order.server";
import {
  PackageIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "../components/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Orders | MonoStore" },
    { name: "description", content: "View your order history stored in PostgreSQL database." },
  ];
}

export async function loader() {
  const orders = await getAllOrders();
  return { orders };
}

export default function OrdersPage() {
  const { orders } = useLoaderData<typeof loader>();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircleIcon className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <TruckIcon className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <ClockIcon className="w-3.5 h-3.5" /> Processing
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <PackageIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span>Order History</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and view receipts for all orders registered in the PostgreSQL database.
          </p>
        </div>

        <Link
          to="/products"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          Browse Products
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800/60 rounded-3xl border border-gray-200 dark:border-gray-700/60 p-8 shadow-xs">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders placed yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            When you complete a checkout, your order will be transactionally saved in PostgreSQL and appear here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition"
          >
            <span>Start Shopping</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    {order.order_number}
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Items preview */}
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 flex-shrink-0 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-gray-900 dark:text-white max-w-[140px] truncate">{item.product_name}</p>
                        <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total & View link */}
                <div className="flex items-center justify-between md:justify-end gap-6 flex-shrink-0">
                  <div>
                    <div className="text-[10px] uppercase text-gray-400 font-bold">Total Amount</div>
                    <div className="text-base font-extrabold text-gray-900 dark:text-white">
                      ${Number(order.total_amount).toFixed(2)}
                    </div>
                  </div>

                  <Link
                    to={`/orders/${order.id}`}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5"
                  >
                    <span>View Receipt</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

