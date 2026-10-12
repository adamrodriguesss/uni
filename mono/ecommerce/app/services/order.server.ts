import { getDb } from "../db/db.server";
import { getCart, clearCart } from "./cart.server";
import type { CheckoutInput, Order, OrderItem } from "../types";

export async function createOrder(sessionId: string, input: CheckoutInput): Promise<{ order?: Order; error?: string }> {
  const db = await getDb();
  const cartSummary = await getCart(sessionId);

  if (cartSummary.items.length === 0) {
    return { error: "Cart is empty" };
  }

  // Use PostgreSQL transaction to guarantee atomic inventory reduction and order creation
  try {
    const order = await db.transaction(async (txClient) => {
      // 1. Verify and lock product stock
      for (const item of cartSummary.items) {
        const checkProd = await txClient.query<{ stock: number; name: string }>(
          "SELECT stock, name FROM products WHERE id = $1",
          [item.product_id]
        );
        if (checkProd.rows.length === 0) {
          throw new Error(`Product ${item.name} is no longer available.`);
        }
        const currentStock = Number(checkProd.rows[0].stock);
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Only ${currentStock} remaining.`);
        }
      }

      // 2. Generate unique order number
      const orderNumber = `MONO-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Insert Order
      const insertOrderRes = await txClient.query<{ id: number; created_at: string }>(
        `INSERT INTO orders (
          order_number,
          customer_name,
          customer_email,
          shipping_address,
          city,
          postal_code,
          payment_method,
          subtotal,
          shipping_cost,
          tax,
          total_amount,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'processing')
        RETURNING id, created_at`,
        [
          orderNumber,
          input.customerName,
          input.customerEmail,
          input.shippingAddress,
          input.city,
          input.postalCode,
          input.paymentMethod,
          cartSummary.subtotal,
          cartSummary.shipping,
          cartSummary.tax,
          cartSummary.total,
        ]
      );

      const orderId = insertOrderRes.rows[0].id;
      const createdAt = insertOrderRes.rows[0].created_at;
      const createdItems: OrderItem[] = [];

      // 4. Insert Order Items & Atomically Decrement Inventory
      for (const item of cartSummary.items) {
        const itemRes = await txClient.query<{ id: number }>(
          `INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            image_url
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [orderId, item.product_id, item.name, item.price, item.quantity, item.image_url]
        );

        createdItems.push({
          id: itemRes.rows[0].id,
          order_id: orderId,
          product_id: item.product_id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
        });

        // Atomic inventory decrement
        await txClient.query(
          "UPDATE products SET stock = stock - $1 WHERE id = $2",
          [item.quantity, item.product_id]
        );
      }

      // 5. Clear Session Cart
      await txClient.query("DELETE FROM cart_items WHERE session_id = $1", [sessionId]);

      const completeOrder: Order = {
        id: orderId,
        order_number: orderNumber,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        shipping_address: input.shippingAddress,
        city: input.city,
        postal_code: input.postalCode,
        payment_method: input.paymentMethod,
        subtotal: cartSummary.subtotal,
        shipping_cost: cartSummary.shipping,
        tax: cartSummary.tax,
        total_amount: cartSummary.total,
        status: "processing",
        created_at: createdAt,
        items: createdItems,
      };

      return completeOrder;
    });

    return { order };
  } catch (error: any) {
    return { error: error?.message || "Failed to process order transaction" };
  }
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  const db = await getDb();
  const res = await db.query<Order>(
    "SELECT * FROM orders WHERE id = $1",
    [orderId]
  );
  if (res.rows.length === 0) return null;

  const order = mapOrder(res.rows[0]);
  const itemsRes = await db.query<OrderItem>(
    "SELECT * FROM order_items WHERE order_id = $1",
    [orderId]
  );
  order.items = itemsRes.rows.map(mapOrderItem);
  return order;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const db = await getDb();
  const res = await db.query<Order>(
    "SELECT * FROM orders WHERE order_number = $1",
    [orderNumber]
  );
  if (res.rows.length === 0) return null;

  const order = mapOrder(res.rows[0]);
  const itemsRes = await db.query<OrderItem>(
    "SELECT * FROM order_items WHERE order_id = $1",
    [order.id]
  );
  order.items = itemsRes.rows.map(mapOrderItem);
  return order;
}

export async function getAllOrders(): Promise<Order[]> {
  const db = await getDb();
  const res = await db.query<Order>(
    "SELECT * FROM orders ORDER BY created_at DESC"
  );
  const orders = res.rows.map(mapOrder);

  for (const order of orders) {
    const itemsRes = await db.query<OrderItem>(
      "SELECT * FROM order_items WHERE order_id = $1",
      [order.id]
    );
    order.items = itemsRes.rows.map(mapOrderItem);
  }

  return orders;
}

function mapOrder(row: any): Order {
  return {
    ...row,
    subtotal: Number(row.subtotal),
    shipping_cost: Number(row.shipping_cost),
    tax: Number(row.tax),
    total_amount: Number(row.total_amount),
  };
}

function mapOrderItem(row: any): OrderItem {
  return {
    ...row,
    price: Number(row.price),
    quantity: Number(row.quantity),
  };
}

