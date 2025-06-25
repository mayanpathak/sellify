# Sellify - Complete Setup Guide

A complete checkout page SaaS platform with Node.js backend and React frontend.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone and Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration:
# NODE_ENV=development
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/sellify
# JWT_SECRET=your-super-secret-jwt-key-here
# JWT_EXPIRES_IN=7d
# JWT_COOKIE_EXPIRES_IN=7
# CLIENT_URL=http://localhost:5173
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
# TRIAL_DURATION_DAYS=7

# Start the backend server
npm run dev
```

Backend will be available at `http://localhost:5000`

### 2. Setup Frontend

```bash
cd ../Frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
echo "VITE_APP_URL=http://localhost:5173" >> .env

# Start the frontend server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🧪 Test the APIs

Run the backend API tests:

```bash
cd backend
node test-api.js
```

## 🎯 Features Overview

### ✅ Backend Features

- **Authentication System**
  - User registration/login with JWT
  - Password hashing with bcrypt
  - Protected routes with middleware
  - Trial period management

- **Checkout Pages**
  - CRUD operations for pages
  - Custom form fields
  - Slug-based URLs
  - Multiple layout styles

- **Form Submissions**
  - Store customer submissions
  - Export functionality
  - User-specific access control

- **Stripe Integration**
  - Stripe Connect for payouts
  - Checkout session creation
  - Webhook handling
  - Platform fees

- **Security & Validation**
  - Input validation with express-validator
  - Rate limiting
  - CORS protection
  - Helmet security headers
  - Plan-based access control

### ✅ Frontend Features

- **Modern React UI**
  - TypeScript support
  - Tailwind CSS styling
  - Framer Motion animations
  - Shadcn/ui components

- **Authentication Flow**
  - Login/Register forms
  - Protected routes
  - Auto-redirect handling
  - JWT token management

- **Dashboard**
  - View all checkout pages
  - Create/edit/delete pages
  - Copy page URLs
  - View submissions

- **Page Builder**
  - Drag-and-drop form fields
  - Product configuration
  - Layout customization
  - Preview functionality

- **Public Checkout Pages**
  - Dynamic form rendering
  - Stripe checkout integration
  - Responsive design
  - Trust badges

## 📁 Project Structure

```
contack/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── config/         # Database, Stripe config
│   │   └── utils/          # Helper functions
│   ├── server.js           # Entry point
│   ├── test-api.js         # API testing script
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── contexts/       # React contexts
    │   ├── lib/            # API client, utilities
    │   └── hooks/          # Custom hooks
    ├── public/
    └── package.json
```

## 🔧 Environment Variables

### Backend (.env)

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/sellify

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Frontend URL
CLIENT_URL=http://localhost:5173

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Business Configuration
TRIAL_DURATION_DAYS=7

# Optional: Email Configuration (for future features)
EMAIL_FROM=noreply@yourdomain.com
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5173
```

## 🛠 Development Workflow

1. **Start MongoDB** (if using local installation)
2. **Start Backend**: `cd backend && npm run dev`
3. **Start Frontend**: `cd Frontend && npm run dev`
4. **Test APIs**: `cd backend && node test-api.js`

## 🚢 Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set up proper JWT secrets
4. Configure Stripe webhook endpoints
5. Set up SSL/HTTPS

### Frontend Deployment

1. Build the frontend: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update `VITE_API_BASE_URL` to production backend URL

## 🔐 Security Considerations

- All passwords are hashed with bcrypt
- JWT tokens are HTTP-only cookies in production
- Rate limiting prevents abuse
- Input validation on all endpoints
- CORS configured for specific origins
- Helmet provides security headers

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Loading states and error handling
- Toast notifications for user feedback
- Modern gradient designs
- Smooth animations with Framer Motion
- Accessible form components

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Pages
- `GET /api/pages` - Get user's pages
- `POST /api/pages` - Create new page
- `GET /api/pages/:slug` - Get page by slug (public)
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

### Submissions
- `POST /api/pages/:slug/submit` - Submit form (public)
- `GET /api/submissions` - Get user's submissions
- `GET /api/pages/:id/submissions` - Get page submissions

### Stripe
- `POST /api/stripe/connect` - Connect Stripe account
- `POST /api/stripe/session/:pageId` - Create checkout session

### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file

2. **CORS Errors**
   - Verify CLIENT_URL matches frontend URL
   - Check if both servers are running

3. **Stripe Integration Issues**
   - Verify Stripe keys are correct
   - Check webhook endpoint configuration

4. **JWT Token Issues**
   - Clear browser cookies
   - Check JWT_SECRET is set

## 📝 Next Steps

1. Set up Stripe webhooks for production
2. Add email notifications
3. Implement analytics dashboard
4. Add more payment methods
5. Create page templates
6. Add team collaboration features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ using Node.js, React, MongoDB, and Stripe** 