import { data } from "react-router";
import type { Route } from "./+types/api.cart";
import { getSessionId } from "../session.server";
import { addToCart, updateCartQuantity, removeFromCart, clearCart, getCart } from "../services/cart.server";

export async function action({ request }: Route.ActionArgs) {
  const { sessionId, headers } = getSessionId(request);
  const formData = await request.formData();
  const actionType = formData.get("action") as string;

  const responseHeaders = new Headers(headers);

  try {
    if (actionType === "add") {
      const productId = parseInt(formData.get("productId") as string, 10);
      const quantity = parseInt((formData.get("quantity") as string) || "1", 10);

      if (isNaN(productId)) {
        return data({ success: false, error: "Invalid product ID" }, { status: 400, headers: responseHeaders });
      }

      const result = await addToCart(sessionId, productId, quantity);
      const summary = await getCart(sessionId);

      return data(
        { success: result.success, message: result.message, cartCount: summary.itemCount },
        { headers: responseHeaders }
      );
    }

    if (actionType === "update") {
      const cartItemId = parseInt(formData.get("cartItemId") as string, 10);
      const quantity = parseInt(formData.get("quantity") as string, 10);

      if (isNaN(cartItemId) || isNaN(quantity)) {
        return data({ success: false, error: "Invalid parameters" }, { status: 400, headers: responseHeaders });
      }

      const result = await updateCartQuantity(sessionId, cartItemId, quantity);
      const summary = await getCart(sessionId);

      return data(
        { success: result.success, message: result.message, summary },
        { headers: responseHeaders }
      );
    }

    if (actionType === "remove") {
      const cartItemId = parseInt(formData.get("cartItemId") as string, 10);
      if (!isNaN(cartItemId)) {
        await removeFromCart(sessionId, cartItemId);
      }
      const summary = await getCart(sessionId);
      return data({ success: true, summary }, { headers: responseHeaders });
    }

    if (actionType === "clear") {
      await clearCart(sessionId);
      return data({ success: true, summary: { items: [], itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 } }, { headers: responseHeaders });
    }

    return data({ success: false, error: "Unknown action" }, { status: 400, headers: responseHeaders });
  } catch (err: any) {
    return data({ success: false, error: err.message || "Failed to modify cart" }, { status: 500, headers: responseHeaders });
  }
}

