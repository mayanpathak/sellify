import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const StripeRefresh: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Show warning message
    toast({
      title: "Stripe Setup Incomplete",
      description: "Please complete your Stripe account setup to start receiving payments.",
      variant: "destructive",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-800">
            Setup Incomplete
          </CardTitle>
          <CardDescription>
            Your Stripe account setup was not completed. You'll need to finish the setup to receive payments.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              ❌ Payment processing not enabled
            </p>
            <p className="text-sm text-gray-600">
              ❌ Cannot create checkout pages yet
            </p>
            <p className="text-sm text-gray-600">
              ❌ Need to complete Stripe onboarding
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeRefresh; 