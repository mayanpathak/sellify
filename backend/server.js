// Load environment variables from .env file
import 'dotenv/config';

import app from './src/app.js';
import connectDB from './src/config/db.js';
import { validateEnvironment } from './src/utils/validateEnv.js';

// --- Environment Validation ---
validateEnvironment();

// --- Database Connection ---
// Connect to MongoDB
connectDB();

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// --- Unhandled Rejection Handler ---
// Gracefully shut down the server on unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
