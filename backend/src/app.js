// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import cookieParser from 'cookie-parser';

// // --- Route Imports ---
// import authRoutes from './routes/auth.routes.js';
// import pageRoutes from './routes/page.routes.js';
// import stripeRoutes from './routes/stripe.routes.js';

// // --- Initialize Express App ---
// const app = express();

// // --- Middlewares ---

// // Set security HTTP headers
// app.use(helmet());

// // Enable CORS (Cross-Origin Resource Sharing)
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true,
// }));

// // Body parser, reading data from body into req.body
// app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// // Cookie parser to parse cookies from the request
// app.use(cookieParser());

// // --- API Routes ---
// app.get('/', (req, res) => {
//     res.send('Checkout Page Backend API is running...');
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/pages', pageRoutes);
// app.use('/api/stripe', stripeRoutes);

// // --- Global Error Handler ---
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send({
//       status: 'error',
//       message: 'Something went wrong!',
//       error: process.env.NODE_ENV === 'development' ? err.message : {}
//   });
// });

// export default app;








// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import cookieParser from 'cookie-parser';
// import 'express-async-errors'; // Automatically handles async route errors

// // --- Middleware Imports ---
// import { generalLimiter } from './middleware/rateLimiter.middleware.js';

// // --- Route Imports ---
// import authRoutes from './routes/auth.routes.js';
// import pageRoutes from './routes/page.routes.js';
// import stripeRoutes from './routes/stripe.routes.js';
// import webhookRoutes from './routes/webhook.routes.js';
// import { submissionMainRouter } from './routes/submission.routes.js';

// // --- Initialize Express App ---
// const app = express();

// // --- Global Middleware ---
// app.use(helmet());

// // Apply rate limiting to all requests
// app.use(generalLimiter);

// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// app.use(cors({
//   origin: [
//     process.env.CLIENT_URL || 'http://localhost:8080',
//     'http://localhost:3000',
//     'http://localhost:8080',
//     'http://localhost:5173',
//     'https://sellify-delta.vercel.app',
//     'https://sellify-delta.vercel.app/',
//     // Add common Vercel deployment patterns
//     /^https:\/\/.*\.vercel\.app$/,
//     // Allow any subdomain of vercel.app for development
//     /^https:\/\/.*\.vercel\.app\/$/
//   ],
//   credentials: true,
// }));

// // --- Webhook routes (before JSON parser) ---
// app.use('/api/webhooks', webhookRoutes);

// app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// app.use(cookieParser());

// // --- Health Check Route ---
// app.get('/', (req, res) => {
//   res.send('Checkout SaaS Backend API is running...');
// });

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/pages', pageRoutes);
// app.use('/api/stripe', stripeRoutes);
// app.use('/api/submissions', submissionMainRouter);

// // --- Global Error Handler ---
// app.use((err, req, res, next) => {
//   console.error(err.stack);
  
//   let error = { ...err };
//   error.message = err.message;

//   // Mongoose bad ObjectId
//   if (err.name === 'CastError') {
//     const message = 'Resource not found';
//     error = { message, statusCode: 404 };
//   }

//   // Mongoose duplicate key
//   if (err.code === 11000) {
//     const message = 'Duplicate field value entered';
//     error = { message, statusCode: 400 };
//   }

//   // Mongoose validation error
//   if (err.name === 'ValidationError') {
//     const message = Object.values(err.errors).map(val => val.message);
//     error = { message, statusCode: 400 };
//   }

//   // JWT errors
//   if (err.name === 'JsonWebTokenError') {
//     const message = 'Invalid token';
//     error = { message, statusCode: 401 };
//   }

//   if (err.name === 'TokenExpiredError') {
//     const message = 'Token expired';
//     error = { message, statusCode: 401 };
//   }

//   const statusCode = error.statusCode || 500;
//   res.status(statusCode).json({
//     status: 'error',
//     message: error.message || 'Something went very wrong!',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
//   });
// });

// export default app;










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
import { submissionMainRouter } from './routes/submission.routes.js';

// --- Initialize Express App ---
const app = express();

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

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.send('Checkout SaaS Backend API is running...');
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/stripe', stripeRoutes);
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