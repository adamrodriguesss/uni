"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4004;
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5436/checkout_db',
});
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:4003';
async function initDb(retries = 10, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            try {
                await client.query(`
          CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            total INTEGER NOT NULL,
            status TEXT DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id TEXT REFERENCES orders(id),
            product_id TEXT NOT NULL,
            product_name TEXT NOT NULL,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL
          );
        `);
                console.log('[Checkout Service] Database ready.');
                return;
            }
            finally {
                client.release();
            }
        }
        catch (err) {
            console.warn(`[Checkout Service] DB connection attempt ${i + 1}/${retries} failed: ${err.message}. Retrying in ${delay}ms...`);
            if (i === retries - 1) {
                console.error('[Checkout Service] Could not connect to DB after all retries.');
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
        res.json({ status: 'ok', service: 'checkout', db: 'connected' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', service: 'checkout', db: err.message });
    }
});
// Support both /checkout and /
app.post(['/checkout', '/'], async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId)
        return res.status(400).json({ error: 'Missing session_id' });
    try {
        // 1. Fetch cart from Cart Service
        const cartRes = await fetch(`${CART_SERVICE_URL}/cart/${sessionId}`);
        if (!cartRes.ok)
            throw new Error(`Cart service returned ${cartRes.statusText}`);
        const cartData = await cartRes.json();
        const items = cartData.items || [];
        if (items.length === 0)
            return res.status(400).json({ error: 'Cart is empty' });
        const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const orderId = 'ord_' + Math.random().toString(36).substring(2, 9);
        // 2. Create order in DB (transaction)
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('INSERT INTO orders (id, session_id, total, status) VALUES ($1, $2, $3, $4)', [orderId, sessionId, total, 'confirmed']);
            for (const item of items) {
                await client.query('INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES ($1, $2, $3, $4, $5)', [orderId, item.product_id, item.product_name, item.price, item.quantity]);
            }
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
        // 3. Clear cart
        try {
            await fetch(`${CART_SERVICE_URL}/cart/clear/${sessionId}`, { method: 'DELETE' });
        }
        catch {
            // non-blocking
        }
        res.json({ orderId, success: true });
    }
    catch (err) {
        console.error('[Checkout Service /checkout Error]:', err);
        res.status(500).json({ error: err.message || 'Checkout failed' });
    }
});
app.get('/orders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    }
    catch (err) {
        console.error('[Checkout Service /orders Error]:', err);
        res.status(500).json({ error: err.message || 'DB Error' });
    }
});
app.get('/orders/:id', async (req, res) => {
    try {
        const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
        if (orderRes.rows.length === 0)
            return res.status(404).json({ error: 'Order not found' });
        const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
        res.json({ ...orderRes.rows[0], items: itemsRes.rows });
    }
    catch (err) {
        console.error(`[Checkout Service /orders/${req.params.id} Error]:`, err);
        res.status(500).json({ error: err.message || 'DB Error' });
    }
});
initDb().then(() => {
    app.listen(PORT, () => console.log(`Checkout service running on port ${PORT}`));
});
