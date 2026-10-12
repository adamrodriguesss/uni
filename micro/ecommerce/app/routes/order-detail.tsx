import { Link } from "react-router";
import type { Route } from "./+types/order-detail";
import { fetchFromGateway } from "../lib/api.server";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const order = await fetchFromGateway(`/api/checkout/orders/${params.id}`);
    return { order, error: null };
  } catch (err: any) {
    return { order: null, error: err.message };
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "MicroShop - Order Details" }];
}

export default function OrderDetail({ loaderData }: Route.ComponentProps) {
  const { order, error } = loaderData;

  if (error || !order) {
    return (
      <div className="space-y-4 max-w-xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400">{error || "Could not retrieve order details."}</p>
        <Link to="/orders" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          &larr; Back to Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Order #{order.id}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div>
          <span className="bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {order.status || 'Confirmed'}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
          Purchased Items
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 px-6">
          {(order.items || []).map((item: any) => (
            <li key={item.id} className="py-4 flex justify-between items-center text-sm">
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {item.quantity} &times; {item.product_name}
              </span>
              <span className="text-slate-900 dark:text-white font-semibold">
                ${((item.price * item.quantity) / 100).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/60 text-right border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
          <span className="font-extrabold text-2xl text-slate-900 dark:text-white">
            ${(order.total / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Link to="/orders" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:underline">
          &larr; View All Orders
        </Link>
        <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
