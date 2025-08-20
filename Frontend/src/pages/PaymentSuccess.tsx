import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight, Download, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface PaymentDetails {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail?: string;
  customerName?: string;
  paymentCompletedAt: string;
  pageId: {
    title: string;
    productName: string;
    slug: string;
  };
}

const PaymentSuccess: React.FC = () => {
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

      // Show success toast
      toast({
        title: "Payment Successful! 🎉",
        description: `Your payment of $${(data.data.payment.amount / 100).toFixed(2)} has been processed successfully.`,
      });

    } catch (error) {
      console.error('Error fetching payment details:', error);
      setError('Failed to load payment details');
      toast({
        title: "Error",
        description: "Could not load payment details",
        variant: "destructive",
      });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyReceiptInfo = () => {
    if (!paymentDetails) return;
    
    const receiptText = `
Payment Receipt
===============
Product: ${paymentDetails.pageId.productName}
Amount: ${formatCurrency(paymentDetails.amount, paymentDetails.currency)}
Date: ${formatDate(paymentDetails.paymentCompletedAt)}
Payment ID: ${paymentDetails._id}
Status: ${paymentDetails.status.toUpperCase()}
${paymentDetails.customerEmail ? `Email: ${paymentDetails.customerEmail}` : ''}
    `.trim();

    navigator.clipboard.writeText(receiptText);
    toast({
      title: "Receipt Copied!",
      description: "Payment receipt has been copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-gray-600">Verifying your payment...</p>
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
            <CardTitle className="text-xl font-bold text-red-600">
              Payment Verification Failed
            </CardTitle>
            <CardDescription>
              {error || 'Could not verify your payment'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-800">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            Thank you for your purchase. Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Payment Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-semibold">{paymentDetails.pageId.productName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="font-semibold text-2xl text-green-600">
                  {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Payment Date</p>
                <p className="font-semibold">
                  {formatDate(paymentDetails.paymentCompletedAt)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {paymentDetails.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {paymentDetails.customerEmail && (
              <div>
                <p className="text-sm text-gray-600">Receipt Email</p>
                <p className="font-semibold">{paymentDetails.customerEmail}</p>
              </div>
            )}
          </div>

          {/* Transaction Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">Transaction ID</p>
                <p className="text-xs text-blue-600 font-mono break-all">
                  {paymentDetails._id}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyReceiptInfo}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Payment confirmation email has been sent</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Your purchase is being processed</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>You'll receive updates on your order status</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={copyReceiptInfo}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Copy Receipt
            </Button>
          </div>

          {/* Support */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Need help? Contact support or visit our{' '}
              <a href="/help" className="text-indigo-600 hover:underline">
                help center
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
