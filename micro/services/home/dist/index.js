"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4002;
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5434/home_db',
});
async function initDb(retries = 10, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            try {
                await client.query(`
          CREATE TABLE IF NOT EXISTS featured_products (
            id SERIAL PRIMARY KEY,
            product_id TEXT NOT NULL UNIQUE,
            display_order INTEGER NOT NULL
          );
        `);
                const check = await client.query('SELECT COUNT(*) FROM featured_products');
                if (parseInt(check.rows[0].count, 10) === 0) {
                    await client.query(`
            INSERT INTO featured_products (product_id, display_order) VALUES
              ('prod_1', 1),
              ('prod_3', 2)
            ON CONFLICT (product_id) DO NOTHING;
          `);
                    console.log('[Home Service] Database initialized & seeded.');
                }
                else {
                    console.log('[Home Service] Database ready.');
                }
                return;
            }
            finally {
                client.release();
            }
        }
        catch (err) {
            console.warn(`[Home Service] DB connection attempt ${i + 1}/${retries} failed: ${err.message}. Retrying in ${delay}ms...`);
            if (i === retries - 1) {
                console.error('[Home Service] Could not connect to DB after all retries.');
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
        res.json({ status: 'ok', service: 'home', db: 'connected' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', service: 'home', db: err.message });
    }
});
app.get('/feed', async (req, res) => {
    try {
        const result = await pool.query('SELECT product_id FROM featured_products ORDER BY display_order');
        const featuredIds = result.rows.map((row) => row.product_id);
        res.json({ featuredIds });
    }
    catch (err) {
        console.error('[Home Service /feed Error]:', err);
        res.status(500).json({ error: err.message || 'DB Error' });
    }
});
initDb().then(() => {
    app.listen(PORT, () => console.log(`Home service running on port ${PORT}`));
});
