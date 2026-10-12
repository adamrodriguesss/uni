import { getDb } from "../app/db/db.server.ts";
import { getProducts, getCategories, getProductById } from "../app/services/catalog.server.ts";
import { addToCart, getCart, updateCartQuantity } from "../app/services/cart.server.ts";
import { createOrder, getOrderById, getAllOrders } from "../app/services/order.server.ts";

async function runTests() {
  console.log("🧪 Starting Monolithic E-Commerce End-to-End Workflow Verification...\n");

  const testSessionId = `test_session_${Date.now()}`;

  // 1. Test Catalog & DB
  console.log("Step 1: Testing Product Catalog & Categories...");
  const categories = await getCategories();
  console.log(`✓ Found ${categories.length} categories:`, categories.map((c) => c.name).join(", "));

  const allProducts = await getProducts();
  console.log(`✓ Found ${allProducts.length} products in database`);
  if (allProducts.length === 0) throw new Error("No products found in DB");

  const firstProduct = allProducts[0];
  const fetchedProduct = await getProductById(firstProduct.id);
  if (!fetchedProduct) throw new Error("Product not found");
  console.log(`✓ Verified getProductById: "${fetchedProduct.name}" (Stock: ${fetchedProduct.stock}, Price: $${fetchedProduct.price})`);

  // 2. Test Cart Operations
  console.log("\nStep 2: Testing Cart Management...");
  const initialStock = fetchedProduct.stock;

  await addToCart(testSessionId, firstProduct.id, 2);
  let cart = await getCart(testSessionId);
  console.log(`✓ Added 2 units to cart. Cart item count: ${cart.itemCount}, Subtotal: $${cart.subtotal}, Total: $${cart.total}`);
  if (cart.itemCount !== 2) throw new Error("Cart item count mismatch");

  await updateCartQuantity(testSessionId, cart.items[0].id, 3);
  cart = await getCart(testSessionId);
  console.log(`✓ Updated quantity to 3. New Subtotal: $${cart.subtotal}`);
  if (cart.itemCount !== 3) throw new Error("Updated cart item count mismatch");

  // 3. Test Order Creation & Atomic Checkout Transaction
  console.log("\nStep 3: Testing Order Placement & Atomic Inventory Decrement...");
  const checkoutInput = {
    customerName: "Ada Lovelace",
    customerEmail: "ada@computing.org",
    shippingAddress: "12 Babbage Way",
    city: "London",
    postalCode: "SW1A 1AA",
    paymentMethod: "Credit Card (Simulated)",
  };

  const orderResult = await createOrder(testSessionId, checkoutInput);
  if (orderResult.error || !orderResult.order) {
    throw new Error(`Order creation failed: ${orderResult.error}`);
  }

  const order = orderResult.order;
  console.log(`✓ Order Placed Successfully! Order #: ${order.order_number} (ID: ${order.id})`);
  console.log(`  Customer: ${order.customer_name} | Total: $${order.total_amount} | Status: ${order.status}`);
  console.log(`  Items count: ${order.items?.length}`);

  // Verify cart cleared
  const cartAfterCheckout = await getCart(testSessionId);
  console.log(`✓ Cart cleared after checkout. Remaining items: ${cartAfterCheckout.itemCount}`);
  if (cartAfterCheckout.itemCount !== 0) throw new Error("Cart was not cleared after order");

  // Verify inventory decremented
  const updatedProduct = await getProductById(firstProduct.id);
  if (!updatedProduct) throw new Error("Updated product not found");
  const expectedStock = initialStock - 3;
  console.log(`✓ Product Stock Decrement: Previous = ${initialStock}, Current = ${updatedProduct.stock} (Expected: ${expectedStock})`);
  if (updatedProduct.stock !== expectedStock) {
    throw new Error(`Stock mismatch: got ${updatedProduct.stock}, expected ${expectedStock}`);
  }

  // 4. Test Order Lookup
  console.log("\nStep 4: Testing Order Querying...");
  const retrievedOrder = await getOrderById(order.id);
  if (!retrievedOrder) throw new Error("Order not retrieved");
  console.log(`✓ Retrieved Order from PostgreSQL: ${retrievedOrder.order_number}, Line items: ${retrievedOrder.items?.length}`);

  const allOrders = await getAllOrders();
  console.log(`✓ Total Orders in System: ${allOrders.length}`);

  console.log("\n🎉 All Monolithic E-Commerce verification tests passed flawlessly!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

