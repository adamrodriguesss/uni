import { Link, Form } from "react-router";
import type { Route } from "./+types/cart";
import { fetchFromGateway } from "../lib/api.server";
import { getSessionId } from "../lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionId = await getSessionId(request);
  if (!sessionId) return { items: [], total: 0, error: null };

  try {
    const cartData = await fetchFromGateway(`/api/cart/cart/${sessionId}`);
    const items = cartData.items || [];
    const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    return { items, total, error: null };
  } catch (err: any) {
    return { items: [], total: 0, error: err.message };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const sessionId = await getSessionId(request);

  if (!sessionId) return null;

  if (intent === "clear") {
    try {
      await fetchFromGateway(`/api/cart/clear/${sessionId}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
  }

  return null;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "MicroShop - Shopping Cart" }];
}

export default function Cart({ loaderData }: Route.ComponentProps) {
  const { items, total, error } = loaderData;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shopping Cart</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Served via the Cart Microservice (Port 4003)
        </p>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-sm">
          <p className="font-semibold mb-1">Notice:</p>
          <p>{error}</p>
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-4">
          <p className="text-slate-600 dark:text-slate-300 text-lg">Your shopping cart is empty.</p>
          <Link 
            to="/products" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Explore Catalog &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item: any) => (
              <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image_url} 
                    alt={item.product_name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-slate-100 dark:bg-slate-800" 
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">
                      {item.product_name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                      ${(item.price / 100).toFixed(2)} each &times; {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-900 dark:text-white">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 gap-4 shadow-xs">
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Amount:</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ${(total / 100).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <Form method="post">
                <button 
                  type="submit" 
                  name="intent" 
                  value="clear" 
                  className="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                >
                  Clear Cart
                </button>
              </Form>
              <Link 
                to="/checkout" 
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors shadow-xs"
              >
                Proceed to Checkout &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
