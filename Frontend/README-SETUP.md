# Frontend Setup Guide

## Environment Variables

Create a `.env` file in the Frontend directory with the following variables:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5173
```

## Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Features Connected

### Authentication
- ✅ User registration and login
- ✅ JWT token management
- ✅ Protected routes
- ✅ Auto-redirect on authentication

### Dashboard
- ✅ View all user's checkout pages
- ✅ Create new pages
- ✅ Edit existing pages
- ✅ Delete pages
- ✅ Copy page URLs
- ✅ View submissions

### Page Creation
- ✅ Form builder with custom fields
- ✅ Product configuration
- ✅ Layout styles
- ✅ Redirect URLs

### Public Checkout Pages
- ✅ Dynamic form rendering
- ✅ Form validation
- ✅ Stripe integration
- ✅ Responsive design

### Submissions Management
- ✅ View all form submissions
- ✅ Export to CSV
- ✅ Search functionality
- ✅ Detailed submission data

## API Integration

All backend APIs are connected:

- **Auth APIs**: `/api/auth/*`
- **Pages APIs**: `/api/pages/*`
- **Submissions APIs**: `/api/submissions/*`
- **Stripe APIs**: `/api/stripe/*`

## Components Structure

```
src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── AuthLayout.tsx   # Authentication layout
│   ├── ProtectedRoute.tsx # Route protection
│   └── ...
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
├── lib/
│   ├── api.ts          # API client and types
│   └── utils.ts        # Utility functions
├── pages/
│   ├── Dashboard.tsx    # Main dashboard
│   ├── CreatePage.tsx   # Page creation form
│   ├── CheckoutPage.tsx # Public checkout pages
│   ├── Submissions.tsx  # Submissions management
│   ├── SignIn.tsx       # Login page
│   ├── SignUp.tsx       # Registration page
│   └── ...
└── hooks/
    └── use-toast.ts     # Toast notifications
```

## Next Steps

1. Set up the backend server (see backend README)
2. Create the `.env` file with your configuration
3. Start both frontend and backend servers
4. Test the complete flow:
   - Register/Login
   - Create a checkout page
   - Visit the public page
   - Submit a form
   - View submissions in dashboard 