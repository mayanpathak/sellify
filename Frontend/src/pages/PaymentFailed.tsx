import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Loader2, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface PaymentDetails {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  lastError?: string;
  pageId: {
    title: string;
    productName: string;
    slug: string;
  };
}

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetchPaymentDetails();
    } else {
      setError('No payment session found');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/analytics/payments/status?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Payment not found');
      }

      const data = await response.json();
      setPaymentDetails(data.data.payment);

    } catch (error) {
      console.error('Error fetching payment details:', error);
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const retryPayment = () => {
    if (paymentDetails?.pageId?.slug) {
      navigate(`/page/${paymentDetails.pageId.slug}`);
    } else {
      navigate('/dashboard');
    }
  };

  const getErrorMessage = (status: string, lastError?: string) => {
    if (lastError) {
      return lastError;
    }
    
    switch (status) {
      case 'failed':
        return 'Your payment could not be processed. Please check your payment method and try again.';
      case 'cancelled':
        return 'Payment was cancelled. You can try again whenever you\'re ready.';
      default:
        return 'Something went wrong with your payment. Please try again.';
    }
  };

  const getErrorTitle = (status: string) => {
    switch (status) {
      case 'cancelled':
        return 'Payment Cancelled';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Payment Issue';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-gray-600">Checking payment status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-red-600">
              Payment Status Unknown
            </CardTitle>
            <CardDescription>
              {error || 'Could not verify your payment status'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {paymentDetails.status === 'cancelled' ? (
              <AlertTriangle className="w-10 h-10 text-orange-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold text-red-800">
            {getErrorTitle(paymentDetails.status)}
          </CardTitle>
          <CardDescription className="text-lg">
            {getErrorMessage(paymentDetails.status, paymentDetails.lastError)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Payment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-semibold">{paymentDetails.pageId.productName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold text-lg">
                  {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Status</p>
                <Badge 
                  variant="destructive" 
                  className={paymentDetails.status === 'cancelled' ? 'bg-orange-100 text-orange-800' : ''}
                >
                  {paymentDetails.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Common Issues & Solutions */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg text-blue-900 mb-4">Common Solutions</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>Check that your card has sufficient funds</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>Verify your card details are correct</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>Try a different payment method</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">•</span>
                <span>Contact your bank if the card is being declined</span>
              </li>
            </ul>
          </div>

          {/* Transaction ID */}
          {paymentDetails._id && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Reference ID</p>
              <p className="text-xs text-gray-800 font-mono break-all">
                {paymentDetails._id}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={retryPayment}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Support */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Still having trouble?{' '}
              <a href="/support" className="text-indigo-600 hover:underline">
                Contact our support team
              </a>{' '}
              for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;
