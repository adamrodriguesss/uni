import { getDb } from "../db/db.server";
import type { CartItem, CartSummary } from "../types";

export async function getCart(sessionId: string): Promise<CartSummary> {
  const db = await getDb();
  const res = await db.query<any>(
    `SELECT 
       ci.id,
       ci.session_id,
       ci.product_id,
       ci.quantity,
       p.name,
       p.price,
       p.image_url,
       p.stock,
       c.name as category_name
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE ci.session_id = $1
     ORDER BY ci.created_at ASC`,
    [sessionId]
  );

  const items: CartItem[] = res.rows.map((row) => ({
    id: row.id,
    session_id: row.session_id,
    product_id: row.product_id,
    quantity: row.quantity,
    name: row.name,
    price: Number(row.price),
    image_url: row.image_url,
    stock: Number(row.stock),
    category_name: row.category_name,
  }));

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% standard tax
  const total = subtotal + shipping + tax;

  return {
    items,
    itemCount,
    subtotal: Number(subtotal.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export async function addToCart(sessionId: string, productId: number, quantity = 1): Promise<{ success: boolean; message?: string }> {
  const db = await getDb();

  // Check product exists and has stock
  const productRes = await db.query<{ stock: number }>("SELECT stock FROM products WHERE id = $1", [productId]);
  if (productRes.rows.length === 0) {
    return { success: false, message: "Product not found" };
  }

  const availableStock = Number(productRes.rows[0].stock);
  if (availableStock <= 0) {
    return { success: false, message: "Product is out of stock" };
  }

  // Check existing cart quantity
  const existingRes = await db.query<{ id: number; quantity: number }>(
    "SELECT id, quantity FROM cart_items WHERE session_id = $1 AND product_id = $2",
    [sessionId, productId]
  );

  if (existingRes.rows.length > 0) {
    const newQty = existingRes.rows[0].quantity + quantity;
    if (newQty > availableStock) {
      return { success: false, message: `Only ${availableStock} units available in stock` };
    }
    await db.query(
      "UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newQty, existingRes.rows[0].id]
    );
  } else {
    const insertQty = Math.min(quantity, availableStock);
    await db.query(
      "INSERT INTO cart_items (session_id, product_id, quantity) VALUES ($1, $2, $3)",
      [sessionId, productId, insertQty]
    );
  }

  return { success: true };
}

export async function updateCartQuantity(sessionId: string, cartItemId: number, quantity: number): Promise<{ success: boolean; message?: string }> {
  const db = await getDb();

  if (quantity <= 0) {
    await removeFromCart(sessionId, cartItemId);
    return { success: true };
  }

  // Check product stock limit
  const itemRes = await db.query<{ product_id: number }>(
    "SELECT product_id FROM cart_items WHERE id = $1 AND session_id = $2",
    [cartItemId, sessionId]
  );
  if (itemRes.rows.length === 0) {
    return { success: false, message: "Item not in cart" };
  }

  const prodRes = await db.query<{ stock: number }>("SELECT stock FROM products WHERE id = $1", [itemRes.rows[0].product_id]);
  const maxStock = Number(prodRes.rows[0]?.stock || 0);

  if (quantity > maxStock) {
    return { success: false, message: `Cannot exceed available stock (${maxStock})` };
  }

  await db.query(
    "UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND session_id = $3",
    [quantity, cartItemId, sessionId]
  );

  return { success: true };
}

export async function removeFromCart(sessionId: string, cartItemId: number): Promise<void> {
  const db = await getDb();
  await db.query("DELETE FROM cart_items WHERE id = $1 AND session_id = $2", [cartItemId, sessionId]);
}

export async function clearCart(sessionId: string): Promise<void> {
  const db = await getDb();
  await db.query("DELETE FROM cart_items WHERE session_id = $1", [sessionId]);
}

