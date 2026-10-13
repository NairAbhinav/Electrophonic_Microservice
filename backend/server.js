import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import proxy from 'express-http-proxy';

import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

app.use(cors());

// Serve static upload directory from the Product Service uploads folder reliably
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = process.env.UPLOADS_PATH || path.resolve(__dirname, '../services/product-service/uploads');
app.use('/uploads', express.static(uploadsPath));

// Target URLs for microservices (configurable via environment variables for Docker)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5002';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003';
const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://localhost:5004';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:5005';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5006';

// Middleware to log proxy routing
app.use((req, res, next) => {
  console.log(`[Gateway Proxy] ${req.method} ${req.originalUrl}`);
  next();
});

// Helper: preserve the original request path when proxying
const withPath = (prefix) => ({
  proxyReqPathResolver: (req) => `${prefix}${req.url}`
});

// Proxy routes matching the implementation plan
app.use('/api/auth', proxy(AUTH_SERVICE_URL, withPath('/api/auth')));
app.use('/api/users', proxy(USER_SERVICE_URL, withPath('/api/users')));

// Route GET /api/products (specifically product listing/searching/filtering) to Search Service
app.get('/api/products', proxy(SEARCH_SERVICE_URL, {
  proxyReqPathResolver: (req) => req.url
}));

// Route all other Product Service actions (CRUD, details, reviews, batch) to Product Service
app.use('/api/products', proxy(PRODUCT_SERVICE_URL, withPath('/api/products')));

app.use('/api/cart', proxy(CART_SERVICE_URL, withPath('/api/cart')));
app.use('/api/orders', proxy(ORDER_SERVICE_URL, withPath('/api/orders')));

// Root route
app.get('/', (req, res) => {
  res.send('API Gateway is running...');
});

// Custom 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
