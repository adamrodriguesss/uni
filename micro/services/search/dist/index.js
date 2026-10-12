"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4001;
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/search_db',
});
async function initDb(retries = 10, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            try {
                await client.query(`
          CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE
          );

          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            category_id TEXT REFERENCES categories(id),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
                // Check if seeded
                const check = await client.query('SELECT COUNT(*) FROM products');
                if (parseInt(check.rows[0].count, 10) === 0) {
                    await client.query(`
            INSERT INTO categories (id, name, slug) VALUES 
              ('cat_1', 'Electronics', 'electronics'),
              ('cat_2', 'Clothing', 'clothing')
            ON CONFLICT (id) DO NOTHING;

            INSERT INTO products (id, category_id, name, description, price, image_url, featured) VALUES
              ('prod_1', 'cat_1', 'Wireless Headphones', 'High quality sound with active noise cancellation', 19900, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', true),
              ('prod_2', 'cat_1', 'Smart Watch', 'Fitness tracker with OLED heart-rate display', 29900, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', false),
              ('prod_3', 'cat_2', 'Cotton T-Shirt', '100% organic breathable cotton apparel', 2500, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', true)
            ON CONFLICT (id) DO NOTHING;
          `);
                    console.log('[Search Service] Database initialized & seeded.');
                }
                else {
                    console.log('[Search Service] Database ready.');
                }
                return;
            }
            finally {
                client.release();
            }
        }
        catch (err) {
            console.warn(`[Search Service] DB connection attempt ${i + 1}/${retries} failed: ${err.message}. Retrying in ${delay}ms...`);
            if (i === retries - 1) {
                console.error('[Search Service] Could not connect to DB after all retries.');
            }
            else {
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    }
}
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', service: 'search', db: 'connected' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', service: 'search', db: err.message });
    }
});
app.get('/products', async (req, res) => {
    try {
        const q = req.query.q;
        let query = 'SELECT * FROM products';
        const params = [];
        if (q) {
            query += ' WHERE name ILIKE $1 OR description ILIKE $1';
            params.push(`%${q}%`);
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    }
    catch (err) {
        console.error('[Search Service /products Error]:', err);
        res.status(500).json({ error: err.message || 'DB Error' });
    }
});
app.get('/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Product not found' });
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(`[Search Service /products/${req.params.id} Error]:`, err);
        res.status(500).json({ error: err.message || 'DB Error' });
    }
});
initDb().then(() => {
    app.listen(PORT, () => console.log(`Search service running on port ${PORT}`));
});
