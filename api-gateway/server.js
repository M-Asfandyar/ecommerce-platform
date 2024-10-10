const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;


// Logging middleware to track incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Proxy configuration for Product Service
app.use('/products', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: (path, req) => path.replace('/products', ''),
}));

// Proxy configuration for Order Service
app.use('/orders', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: (path, req) => path.replace('/orders', ''),
}));

// Proxy configuration for User Service
app.use('/users', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: (path, req) => path.replace('/users', ''),
}));

// Proxy configuration for Payment Service
app.use('/payments', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: (path, req) => path.replace('/payments', ''), // This removes '/payments' before forwarding
}));

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});