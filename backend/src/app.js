import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'express-async-errors'; // Automatically handles async route errors

// --- Middleware Imports ---
import { generalLimiter } from './middleware/rateLimiter.middleware.js';

// --- Route Imports ---
import authRoutes from './routes/auth.routes.js';
import pageRoutes from './routes/page.routes.js';
import stripeRoutes from './routes/stripe.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import planRoutes from './routes/plan.routes.js';
import { submissionMainRouter } from './routes/submission.routes.js';
import { completeMockPayment } from './controllers/webhook.controller.js';

// --- Initialize Express App ---
const app = express();

// --- Trust Proxy Configuration ---
// Enable trust proxy for deployment platforms (Render, Heroku, etc.)
app.set('trust proxy', 1);

// --- Global Middleware ---
app.use(helmet());

// Apply rate limiting to all requests
app.use(generalLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- CORS Configuration ---
const corsOptions = {
  origin: [
    // Development URLs
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173',
    
    // Production URLs
    'https://sellify-delta.vercel.app',
    'https://sellify-delta.vercel.app/',
    
    // Dynamic environment-based URLs
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
    ...(process.env.VITE_APP_URL ? [process.env.VITE_APP_URL] : []),
    
    // Vercel deployment patterns (for preview deployments)
    /^https:\/\/sellify-.*\.vercel\.app$/,
    /^https:\/\/.*\.vercel\.app$/,
    
    // Render backend URL patterns (if frontend is served from same domain)
    /^https:\/\/.*\.onrender\.com$/,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// --- Webhook routes (before JSON parser) ---
app.use('/api/webhooks', webhookRoutes);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// --- Mock payment completion route (after JSON parser) ---
app.post('/api/mock-payment-complete', completeMockPayment);

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.send('Checkout SaaS Backend API is running...');
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/submissions', submissionMainRouter);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: error.message || 'Something went very wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;