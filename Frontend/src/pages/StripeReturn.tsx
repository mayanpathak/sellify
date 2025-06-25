import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const StripeReturn: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Show success message
    toast({
      title: "Stripe Connected Successfully!",
      description: "Your Stripe account has been connected. You can now start receiving payments.",
    });

    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Stripe Connected!
          </CardTitle>
          <CardDescription>
            Your Stripe account has been successfully connected to Sellify.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              ✅ Payment processing enabled
            </p>
            <p className="text-sm text-gray-600">
              ✅ Ready to create checkout pages
            </p>
            <p className="text-sm text-gray-600">
              ✅ Start receiving payments from customers
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecting to dashboard...</span>
          </div>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeReturn; 