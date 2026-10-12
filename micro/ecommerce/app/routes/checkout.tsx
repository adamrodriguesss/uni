import { redirect, Form, Link } from "react-router";
import type { Route } from "./+types/checkout";
import { fetchFromGateway } from "../lib/api.server";
import { getSessionId } from "../lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionId = await getSessionId(request);
  if (!sessionId) return redirect("/cart");

  try {
    const cartData = await fetchFromGateway(`/api/cart/cart/${sessionId}`);
    if (!cartData.items || cartData.items.length === 0) {
      return redirect("/cart");
    }

    const total = cartData.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    return { items: cartData.items, total, error: null };
  } catch (err: any) {
    return { items: [], total: 0, error: err.message };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const sessionId = await getSessionId(request);
  if (!sessionId) return redirect("/cart");

  try {
    const res = await fetchFromGateway('/api/checkout/checkout', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    
    if (res.success && res.orderId) {
      return redirect(`/orders/${res.orderId}`);
    }
    return { error: res.error || "Checkout failed" };
  } catch (err: any) {
    return { error: err.message };
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "MicroShop - Checkout" }];
}

export default function Checkout({ loaderData, actionData }: Route.ComponentProps) {
  const { items, total, error: loaderError } = loaderData;
  const error = actionData?.error || loaderError;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Checkout</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Processes a distributed transaction via the Checkout Microservice (Port 4004) &rarr; Cart Microservice (Port 4003)
        </p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-800 dark:text-red-300 text-sm">
          <p className="font-semibold mb-1">Checkout Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Order Review</h2>
        </div>
        
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 px-6">
          {items.map((item: any) => (
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

        <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-base font-bold text-slate-900 dark:text-white">Total Due</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${(total / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link to="/cart" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:underline">
          &larr; Back to Cart
        </Link>
        <Form method="post">
          <button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg text-base transition-colors shadow-xs cursor-pointer"
          >
            Confirm &amp; Place Order &rarr;
          </button>
        </Form>
      </div>
    </div>
  );
}
