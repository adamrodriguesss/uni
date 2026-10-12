import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway' });
});

// Proxy routes (targeting localhost ports since services are running locally now)
app.use('/api/search', createProxyMiddleware({ target: 'http://localhost:4001', changeOrigin: true, pathRewrite: { '^/api/search': '' } }));
app.use('/api/home', createProxyMiddleware({ target: 'http://localhost:4002', changeOrigin: true, pathRewrite: { '^/api/home': '' } }));
app.use('/api/cart', createProxyMiddleware({ target: 'http://localhost:4003', changeOrigin: true, pathRewrite: { '^/api/cart': '' } }));
app.use('/api/checkout', createProxyMiddleware({ target: 'http://localhost:4004', changeOrigin: true, pathRewrite: { '^/api/checkout': '' } }));

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
