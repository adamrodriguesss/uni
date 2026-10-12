INSERT INTO categories (id, name, slug) VALUES 
('cat_1', 'Electronics', 'electronics'),
('cat_2', 'Clothing', 'clothing');

INSERT INTO products (id, category_id, name, description, price, image_url, featured) VALUES
('prod_1', 'cat_1', 'Wireless Headphones', 'High quality sound', 19900, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', true),
('prod_2', 'cat_1', 'Smart Watch', 'Fitness tracker', 29900, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', false),
('prod_3', 'cat_2', 'Cotton T-Shirt', '100% cotton', 2500, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', true);
