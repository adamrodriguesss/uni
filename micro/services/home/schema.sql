CREATE TABLE featured_products (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL,
  display_order INTEGER NOT NULL
);
