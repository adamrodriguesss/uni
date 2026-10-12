import { redirect, Form, Link } from "react-router";
import type { Route } from "./+types/product-detail";
import { fetchFromGateway } from "../lib/api.server";
import { getSessionId, sessionCookie } from "../lib/session.server";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const product = await fetchFromGateway(`/api/search/products/${params.id}`);
    return { product, error: null };
  } catch (err: any) {
    return { product: null, error: err.message };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const quantity = Number(formData.get("quantity")) || 1;
  const productStr = formData.get("product") as string;
  const product = JSON.parse(productStr);
  
  let sessionId = await getSessionId(request);
  const headers = new Headers();
  
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 9);
    headers.set("Set-Cookie", await sessionCookie.serialize(sessionId));
  }

  // Add to cart via Gateway
  await fetchFromGateway('/api/cart/add', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.image_url,
      quantity,
    }),
  });

  return redirect("/cart", { headers });
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "MicroShop - Product Details" }];
}

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { product, error } = loaderData;

  if (error || !product) {
    return (
      <div className="space-y-4 max-w-xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400">{error || "Could not retrieve product details."}</p>
        <Link to="/products" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/products" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
        &larr; Back to Catalog
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs p-6 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full max-h-96 object-contain rounded-lg" 
          />
        </div>
        <div className="md:w-1/2 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              ${(product.price / 100).toFixed(2)}
            </p>
            <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
            </div>
          </div>
          
          <Form method="post" className="space-y-4 pt-2">
            <input type="hidden" name="product" value={JSON.stringify(product)} />
            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Quantity
              </label>
              <input 
                id="quantity"
                type="number" 
                name="quantity" 
                defaultValue={1} 
                min={1} 
                max={99}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white p-2 w-20 rounded-lg text-center text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden" 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-base transition-colors shadow-xs cursor-pointer"
            >
              Add to Shopping Cart
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
