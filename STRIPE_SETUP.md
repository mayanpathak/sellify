# Stripe Connect Integration Setup Guide

This guide will help you set up Stripe Connect for your Sellify MVP to enable end-to-end payment processing.

## 🔧 Environment Variables Setup

Create a `.env` file in your `backend` directory with the following variables:

```bash
# Stripe Configuration (Required)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Other required variables
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/sellify
JWT_SECRET=your-long-random-secret-key-here
CLIENT_URL=http://localhost:5173
```

## 🎯 Stripe Dashboard Setup

### 1. Create Stripe Account
- Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
- Sign up for a new account or log in
- Switch to **Test mode** for development

### 2. Get API Keys
1. Go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add these to your `.env` file

### 3. Enable Stripe Connect
1. Go to **Connect** in the Stripe Dashboard
2. Click **Get started**
3. Choose **Platform** as your integration type
4. Complete the Connect onboarding process

### 4. Set up Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Set endpoint URL to: `http://localhost:5000/api/webhooks/stripe`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## 🧪 Local Development Testing

### Using Stripe CLI (Recommended)

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (using Scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
   
   This will give you a webhook signing secret like `whsec_...` - use this in your `.env` file.

4. **Test webhook events**
   ```bash
   # Trigger a successful payment
   stripe trigger checkout.session.completed
   
   # Trigger a failed payment
   stripe trigger payment_intent.payment_failed
   ```

### Manual Testing Without Stripe CLI

1. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`

2. Use any future expiry date and any 3-digit CVC

## 🚀 Production Setup

### 1. Switch to Live Mode
- In Stripe Dashboard, toggle from **Test mode** to **Live mode**
- Get new live API keys (start with `pk_live_` and `sk_live_`)
- Update your production environment variables

### 2. Update Webhook Endpoint
- Create a new webhook endpoint with your production URL
- Example: `https://yourapp.com/api/webhooks/stripe`
- Use the same event types as development

### 3. Verify Connect Settings
- Ensure your Connect platform is approved for live transactions
- Complete any required business verification steps

## 🔍 Testing the Complete Flow

### 1. Start Your Application
```bash
# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd Frontend
npm run dev
```

### 2. Test User Registration & Stripe Connect
1. Register a new user at `http://localhost:5173/signup`
2. Go to Dashboard
3. Click "Connect Stripe Account"
4. Complete the Express onboarding flow

### 3. Test Checkout Page Creation
1. Create a new checkout page
2. Set a product name and price
3. Add some custom fields
4. Save the page

### 4. Test Payment Flow
1. Visit your checkout page URL
2. Fill in the form
3. Click submit to trigger Stripe checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete the payment
6. Verify you're redirected to success page
7. Check your dashboard for payment analytics

### 5. Test Webhook Processing
- Check your backend logs for webhook events
- Verify payment records are created in your database
- Confirm submissions are linked to payments

## 🐛 Troubleshooting

### Common Issues

1. **"Webhook signature verification failed"**
   - Ensure `STRIPE_WEBHOOK_SECRET` is correct
   - Make sure webhook endpoint URL is accessible
   - Check that raw body is being passed to webhook handler

2. **"The page owner has not connected a Stripe account"**
   - Complete Stripe Connect onboarding for the user
   - Verify `stripeAccountId` is saved in user record

3. **"Payment not found" in success page**
   - Check that webhook events are being processed
   - Verify payment records are being created
   - Ensure session metadata includes `pageId` and `userId`

4. **Development fallbacks not working**
   - Check that `NODE_ENV=development` in your `.env`
   - Verify mock account IDs start with `acct_mock_`

### Debugging Tips

1. **Check Backend Logs**
   ```bash
   # Look for webhook processing logs
   tail -f backend/logs/app.log
   ```

2. **Verify Database Records**
   ```javascript
   // In MongoDB shell or Compass
   db.payments.find().sort({createdAt: -1}).limit(5)
   db.submissions.find().sort({createdAt: -1}).limit(5)
   ```

3. **Test API Endpoints Directly**
   ```bash
   # Test payment analytics
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:5000/api/analytics/payments
   ```

## 📚 Additional Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Test Card Numbers](https://stripe.com/docs/testing#cards)

## 🎉 Success Checklist

- [ ] Environment variables configured
- [ ] Stripe Connect enabled in dashboard
- [ ] Webhook endpoint created and tested
- [ ] User can connect Stripe account
- [ ] Checkout pages can be created
- [ ] Payment flow works end-to-end
- [ ] Webhooks process successfully
- [ ] Payment analytics display correctly
- [ ] Success/failure pages work properly

If you've completed all items above, your Stripe Connect integration is ready! 🚀
