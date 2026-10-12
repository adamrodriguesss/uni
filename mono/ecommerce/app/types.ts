export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: number;
  category_name?: string;
  image_url: string;
  stock: number;
  rating: number;
  featured: boolean;
  created_at: string;
}

export interface CartItem {
  id: number;
  session_id: string;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  category_name?: string;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
}

