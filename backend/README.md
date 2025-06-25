# Checkout SaaS Backend

A secure and scalable backend for a custom checkout page SaaS platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with secure password hashing
- **Plan Management**: Free, Builder, and Pro tiers with usage limits
- **Stripe Integration**: Full Stripe Connect integration for payments
- **Input Validation**: Comprehensive validation using express-validator
- **Security**: Helmet, CORS, rate limiting, and error handling
- **Database**: MongoDB with Mongoose ODM

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Stripe account (for payments)

### Installation

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend root with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/checkout-saas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Client Configuration
CLIENT_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Trial Configuration
TRIAL_DURATION_DAYS=7
```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Pages
- `POST /api/pages` - Create a new checkout page
- `GET /api/pages` - Get user's pages
- `GET /api/pages/:slug` - Get page by slug (public)
- `PUT /api/pages/:id` - Update a page
- `DELETE /api/pages/:id` - Delete a page

### Submissions
- `POST /api/pages/:slug/submit` - Submit form data (public)
- `GET /api/submissions` - Get all submissions for user's pages
- `GET /api/pages/:id/submissions` - Get submissions for a specific page

### Stripe
- `POST /api/stripe/connect` - Connect Stripe account
- `POST /api/stripe/session/:pageId` - Create checkout session

### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe webhook events

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers with Helmet
- Error handling without stack trace exposure in production

## Database Models

### User
- Basic user information
- Stripe account details
- Plan management (free/builder/pro)
- Trial expiration tracking

### CheckoutPage
- Page configuration
- Product details
- Custom fields
- Stripe integration settings

### Submission
- Form submission data
- Linked to checkout pages

## Plan Limits

- **Free**: 1 page, 7-day trial
- **Builder**: 5 pages
- **Pro**: Unlimited pages

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Project Structure
```
src/
├── config/          # Database and external service configs
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
└── utils/           # Utility functions
```

## Environment Variables

All environment variables should be set in a `.env` file. See the template above for required variables.

**Security Note**: Never commit your `.env` file to version control. The `.env.example` file should contain example values only.

## Deployment

1. Set `NODE_ENV=production`
2. Ensure all environment variables are set
3. Use a process manager like PM2
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure MongoDB connection string for production

## Error Handling

The application includes comprehensive error handling:
- Mongoose validation errors
- JWT token errors
- Stripe API errors
- Custom business logic errors
- Development vs production error responses

## Contributing

1. Follow the existing code style
2. Add validation for new endpoints
3. Include error handling
4. Update documentation
5. Test thoroughly

## License

ISC 