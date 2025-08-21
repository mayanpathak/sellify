import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  CreditCard, 
  Shield, 
  Check, 
  AlertTriangle,
  Lock,
  TestTube,
  ArrowLeft
} from 'lucide-react';
import { pagesApi } from '../lib/api';
import { toast } from '../hooks/use-toast';

interface CheckoutPage {
  _id: string;
  title: string;
  productName: string;
  description?: string;
  price: number;
  currency: string;
  fields: Array<{
    label: string;
    type: string;
    required: boolean;
  }>;
}

const MockCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const pageId = searchParams.get('page_id');
  
  const [page, setPage] = useState<CheckoutPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [paymentData, setPaymentData] = useState({
    cardNumber: '4242424242424242',
    expiryDate: '12/25',
    cvc: '123',
    name: 'Test Customer',
    email: 'test@example.com'
  });

  useEffect(() => {
    if (pageId) {
      fetchPageData();
    }
  }, [pageId]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const response = await pagesApi.getById(pageId!);
      setPage(response.data.page);
      
      // Initialize form data with empty values
      const initialFormData: Record<string, string> = {};
      response.data.page.fields?.forEach((field: any) => {
        initialFormData[field.label] = '';
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Failed to fetch page data:', error);
      toast({
        title: "Error",
        description: "Failed to load checkout page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (label: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Complete the mock payment
      const response = await fetch('/api/webhooks/mock-payment-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          formData,
          customerEmail: paymentData.email,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Payment failed'}`);
      }

      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(responseText);

      if (data.status === 'success') {
        // Simulate processing delay for realism
        setTimeout(() => {
          // Redirect to payment success page
          navigate(`/payment/success?session_id=${sessionId}&mock=true`);
        }, 2000);
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Mock payment failed:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed. Please try again.",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  const isFormValid = () => {
    if (!page) return false;
    
    // Check required form fields
    const requiredFields = page.fields?.filter(field => field.required) || [];
    const hasAllRequiredFields = requiredFields.every(field => 
      formData[field.label] && formData[field.label].trim() !== ''
    );

    // Check payment data
    const hasValidPaymentData = paymentData.cardNumber && 
                               paymentData.expiryDate && 
                               paymentData.cvc && 
                               paymentData.name && 
                               paymentData.email;

    return hasAllRequiredFields && hasValidPaymentData;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="page-loader animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-gray-600 mb-4">The checkout page you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Test Mode Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <TestTube className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Test Mode - Mock Payment</strong>
            <p className="text-sm mt-1">
              This is a test checkout powered by mock Stripe. No real payment will be processed.
              All form data and payment information are for testing purposes only.
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {page.title}
                </CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{page.productName}</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(page.price, page.currency)}
                    </p>
                  </div>

                  {/* Customer Information Form */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Customer Information</h4>
                    {page.fields?.map((field) => (
                      <div key={field.label}>
                        <Label htmlFor={field.label}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.label}
                          type={field.type}
                          value={formData[field.label] || ''}
                          onChange={(e) => handleFormChange(field.label, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          required={field.required}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Secure Test Payment</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  This is a secure mock payment environment. Your test data is safe and will not be stored.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Test Payment Information
                </CardTitle>
                <CardDescription>
                  Use the pre-filled test card details or modify them for testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={(e) => handlePaymentDataChange('cardNumber', e.target.value)}
                      placeholder="4242 4242 4242 4242"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use 4242424242424242 for test</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={(e) => handlePaymentDataChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        value={paymentData.cvc}
                        onChange={(e) => handlePaymentDataChange('cvc', e.target.value)}
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input
                      id="name"
                      value={paymentData.name}
                      onChange={(e) => handlePaymentDataChange('name', e.target.value)}
                      placeholder="Test Customer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => handlePaymentDataChange('email', e.target.value)}
                      placeholder="test@example.com"
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-2xl font-bold">
                        {formatCurrency(page.price, page.currency)}
                      </span>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={!isFormValid() || processing}
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing Test Payment...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Complete Test Payment
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-2">
                      This is a simulated payment. No real money will be charged.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Test Card Information */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">Test Card Numbers</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Success:</strong> 4242424242424242</p>
                  <p><strong>Declined:</strong> 4000000000000002</p>
                  <p><strong>Insufficient Funds:</strong> 4000000000009995</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Use any future expiry date and any 3-digit CVC
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MockCheckout;
