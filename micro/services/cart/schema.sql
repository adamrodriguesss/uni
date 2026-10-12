CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cart_session ON cart_items(session_id);
