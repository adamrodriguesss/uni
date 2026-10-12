import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products", "routes/products.tsx"),
  route("products/:id", "routes/product-detail.tsx"),
  route("cart", "routes/cart.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("orders", "routes/orders.tsx"),
  route("orders/:id", "routes/order-detail.tsx"),
  route("architecture", "routes/architecture.tsx"),
  route("api/cart", "routes/api.cart.ts"),
] satisfies RouteConfig;
