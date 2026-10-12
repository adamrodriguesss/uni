"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'gateway' });
});
// Proxy routes (targeting localhost ports since services are running locally now)
app.use('/api/search', (0, http_proxy_middleware_1.createProxyMiddleware)({ target: 'http://localhost:4001', changeOrigin: true, pathRewrite: { '^/api/search': '' } }));
app.use('/api/home', (0, http_proxy_middleware_1.createProxyMiddleware)({ target: 'http://localhost:4002', changeOrigin: true, pathRewrite: { '^/api/home': '' } }));
app.use('/api/cart', (0, http_proxy_middleware_1.createProxyMiddleware)({ target: 'http://localhost:4003', changeOrigin: true, pathRewrite: { '^/api/cart': '' } }));
app.use('/api/checkout', (0, http_proxy_middleware_1.createProxyMiddleware)({ target: 'http://localhost:4004', changeOrigin: true, pathRewrite: { '^/api/checkout': '' } }));
app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
});
