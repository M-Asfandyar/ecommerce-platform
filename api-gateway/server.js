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
  target: 'http://product-service:3001', // Use the Docker service name
  changeOrigin: true,
  pathRewrite: {
      '^/products': '', // Remove '/products' from the path before forwarding
  },
}));

// Proxy configuration for Order Service
app.use('/orders', createProxyMiddleware({
  target: 'http://order-service:3002', // Use the Docker service name here
  changeOrigin: true,
  pathRewrite: {
      '^/orders': '', // Remove '/orders' from the path before forwarding
  },
}));

// Proxy configuration for User Service
app.use('/users', createProxyMiddleware({
  target: 'http://user-service:3003', // Use the Docker service name here
  changeOrigin: true,
  pathRewrite: {
      '^/users': '', // Remove '/users' from the path before forwarding
  },
}));

// Proxy configuration for Payment Service
app.use('/payments', createProxyMiddleware({
  target: 'http://payment-service:3004', // Use the Docker service name here
  changeOrigin: true,
  pathRewrite: {
      '^/payments': '', // Remove '/payments' from the path before forwarding
  },
}));

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});