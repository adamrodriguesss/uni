import { Link } from "react-router";
import type { Route } from "./+types/orders";
import { fetchFromGateway } from "../lib/api.server";

export async function loader() {
  try {
    const orders = await fetchFromGateway('/api/checkout/orders');
    return { orders: Array.isArray(orders) ? orders : [], error: null };
  } catch (err: any) {
    return { orders: [], error: err.message };
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "MicroShop - Order History" }];
}

export default function Orders({ loaderData }: Route.ComponentProps) {
  const { orders, error } = loaderData;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order History</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Served via the Checkout Microservice (Port 4004)
        </p>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-sm">
          <p className="font-semibold mb-1">Notice:</p>
          <p>{error}</p>
        </div>
      )}
      
      {orders.length === 0 && !error ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-4">
          <p className="text-slate-600 dark:text-slate-300 text-lg">No orders have been placed yet.</p>
          <Link 
            to="/products" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Start Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div 
              key={order.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-slate-900 dark:text-white">
                    Order #{order.id}
                  </span>
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase">
                    {order.status || 'completed'}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Placed: {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="font-bold text-xl text-slate-900 dark:text-white">
                  ${(order.total / 100).toFixed(2)}
                </span>
                <Link 
                  to={`/orders/${order.id}`} 
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
