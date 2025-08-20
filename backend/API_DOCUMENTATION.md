# Backend API Documentation

## Overview

This is a comprehensive checkout page SaaS backend with user authentication, page management, Stripe integration, and analytics.

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication

All protected routes require a JWT token sent either:
- As a Bearer token in the Authorization header: `Authorization: Bearer <token>`
- As an HTTP-only cookie named `jwt`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "jwt-token-here",
  "data": {
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "plan": "free",
      "trialExpiresAt": "2024-01-01T00:00:00.000Z",
      "isVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST `/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

#### POST `/auth/logout`
Logout user (clears JWT cookie).

#### GET `/auth/me`
Get current logged-in user. **Requires Authentication**

---

### Page Routes (`/api/pages`)

#### POST `/pages`
Create a new checkout page. **Requires Authentication**

**Request Body:**
```json
{
  "title": "My Product Page",
  "productName": "Amazing Product",
  "description": "Product description",
  "price": 29.99,
  "currency": "usd",
  "fields": [
    {
      "label": "Full Name",
      "type": "text",
      "required": true
    },
    {
      "label": "Email",
      "type": "email",
      "required": true
    }
  ],
  "successRedirectUrl": "https://example.com/success",
  "cancelRedirectUrl": "https://example.com/cancel",
  "layoutStyle": "modern",
  "orderBumps": [
    {
      "title": "Add-on Product",
      "price": 9.99,
      "recurring": false
    }
  ]
}
```

#### GET `/pages`
Get all pages created by the user. **Requires Authentication**

#### GET `/pages/:slug`
Get a page by its slug. **Public**

#### PATCH `/pages/:id`
Update a checkout page. **Requires Authentication**

#### DELETE `/pages/:id`
Delete a checkout page. **Requires Authentication**

#### GET `/pages/:id/submissions`
Get submissions for a specific page. **Requires Authentication**

---

### Submission Routes

#### POST `/api/pages/:slug/submit`
Submit a form for a checkout page. **Public**

**Request Body:**
```json
{
  "Full Name": "John Doe",
  "Email": "john@example.com",
  "Custom Field": "Custom Value"
}
```

#### GET `/api/submissions`
Get all submissions for user's pages. **Requires Authentication**

---

### Stripe Routes (`/api/stripe`)

#### POST `/stripe/connect`
Connect user's Stripe account. **Requires Authentication**

#### POST `/stripe/session/:pageId`
Create a Stripe checkout session. **Requires Authentication**

---

### Analytics Routes (`/api/analytics`)

#### GET `/analytics/payments`
Get user's payment analytics. **Requires Authentication**

#### GET `/analytics/pages/:pageId`
Get page-specific analytics. **Requires Authentication**

#### GET `/analytics/payments/status`
Get real-time payment status. **Requires Authentication**

Query Parameters:
- `sessionId`: Stripe session ID
- `pageId`: Page ID

#### GET `/analytics/stripe-status`
Get Stripe account status. **Requires Authentication**

---

### Webhook Routes (`/api/webhooks`)

#### POST `/webhooks/stripe`
Handle Stripe webhook events. **Public** (Verified with Stripe signature)

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "plan": "free|builder|pro",
  "trialExpiresAt": "Date",
  "isVerified": "Boolean",
  "stripeCustomerId": "String",
  "stripeAccountId": "String",
  "createdPages": ["ObjectId"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### CheckoutPage
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "slug": "String (unique)",
  "title": "String",
  "productName": "String",
  "description": "String",
  "price": "Number",
  "currency": "String",
  "fields": [
    {
      "label": "String",
      "type": "text|email|number|textarea|checkbox",
      "required": "Boolean"
    }
  ],
  "successRedirectUrl": "String",
  "cancelRedirectUrl": "String",
  "layoutStyle": "standard|modern|minimalist",
  "orderBumps": [
    {
      "title": "String",
      "price": "Number",
      "recurring": "Boolean"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Submission
```json
{
  "_id": "ObjectId",
  "pageId": "ObjectId",
  "formData": "Map",
  "paymentId": "ObjectId",
  "paymentStatus": "none|pending|completed|failed",
  "customerEmail": "String",
  "customerName": "String",
  "ipAddress": "String",
  "userAgent": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Payment
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "pageId": "ObjectId",
  "submissionId": "ObjectId",
  "stripeSessionId": "String",
  "stripePaymentIntentId": "String",
  "stripeAccountId": "String",
  "amount": "Number (in cents)",
  "currency": "String",
  "applicationFeeAmount": "Number",
  "status": "pending|processing|completed|failed|cancelled|refunded",
  "customerEmail": "String",
  "customerName": "String",
  "metadata": "Map",
  "paymentCompletedAt": "Date",
  "stripeCreatedAt": "Date",
  "webhookProcessed": "Boolean",
  "webhookProcessedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Error Responses

All errors follow this format:
```json
{
  "status": "error|fail",
  "message": "Error description",
  "errors": [] // Validation errors array (if applicable)
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (for deletions)
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

## Rate Limiting

- General requests: 100 requests per 15 minutes per IP
- Authentication requests: 5 requests per 15 minutes per IP
- Page creation: 10 requests per hour per IP
- Form submissions: 50 requests per 15 minutes per IP

## Development

### Environment Variables
Copy `env.example` to `.env` and configure:

```bash
# Required
MONGO_URI=mongodb://localhost:27017/checkout-saas
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173

# Stripe (optional for development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Testing
Run the test suite:
```bash
npm test
```

Make sure your server is running on localhost:5000 before running tests.

### API Testing Tool
Use the included `test-api.js` file to test all endpoints:
```bash
node test-api.js
```

## Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Request validation
- Plan-based access control
- Stripe webhook signature verification

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database URI
3. Set up Stripe live keys
4. Configure webhook endpoints
5. Set up proper CORS origins
6. Use HTTPS
7. Set up monitoring and logging
