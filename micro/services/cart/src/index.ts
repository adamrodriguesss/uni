import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 4003;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5435/cart_db',
});

async function initDb(retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS cart_items (
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
          CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);
        `);
        console.log('[Cart Service] Database ready.');
        return;
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.warn(`[Cart Service] DB connection attempt ${i + 1}/${retries} failed: ${err.message}. Retrying in ${delay}ms...`);
      if (i === retries - 1) {
        console.error('[Cart Service] Could not connect to DB after all retries.');
      } else {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'cart', db: 'connected' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', service: 'cart', db: err.message });
  }
});

// Support both /:sessionId and /cart/:sessionId (via gateway rewrite or direct call)
app.get(['/cart/:sessionId', '/:sessionId'], async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const result = await pool.query(
      'SELECT * FROM cart_items WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );
    res.json({ items: result.rows });
  } catch (err: any) {
    console.error(`[Cart Service GET cart Error]:`, err);
    res.status(500).json({ error: err.message || 'DB Error' });
  }
});

// Support both /add and /cart/add
app.post(['/cart/add', '/add'], async (req, res) => {
  const { sessionId, productId, productName, price, imageUrl, quantity = 1 } = req.body;
  if (!sessionId || !productId) {
    return res.status(400).json({ error: 'Missing sessionId or productId' });
  }

  try {
    const existing = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE session_id = $1 AND product_id = $2',
      [sessionId, productId]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, existing.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (session_id, product_id, product_name, price, image_url, quantity) VALUES ($1, $2, $3, $4, $5, $6)',
        [sessionId, productId, productName || 'Product', price || 0, imageUrl || '', quantity]
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Cart Service POST /add Error]:', err);
    res.status(500).json({ error: err.message || 'DB Error' });
  }
});

// Support both /clear/:sessionId and /cart/clear/:sessionId
app.delete(['/cart/clear/:sessionId', '/clear/:sessionId'], async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    await pool.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);
    res.json({ success: true });
  } catch (err: any) {
    console.error(`[Cart Service DELETE clear Error]:`, err);
    res.status(500).json({ error: err.message || 'DB Error' });
  }
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`Cart service running on port ${PORT}`));
});
