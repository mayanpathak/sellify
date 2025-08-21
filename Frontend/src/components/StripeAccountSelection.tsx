import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, 
  TestTube, 
  Shield, 
  Zap,
  Check,
  AlertTriangle,
  ExternalLink,
  Settings
} from 'lucide-react';
import { stripeApi } from '../lib/api';
import { toast } from '../hooks/use-toast';

interface StripeAccountSelectionProps {
  onAccountConnected: (accountData: any) => void;
  onClose?: () => void;
}

const StripeAccountSelection: React.FC<StripeAccountSelectionProps> = ({ 
  onAccountConnected, 
  onClose 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleConnectAccount = async (accountType: 'real' | 'mock') => {
    try {
      setLoading(accountType);
      
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ accountType }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        if (accountType === 'real' && data.data.onboardingUrl) {
          // Redirect to Stripe onboarding
          window.location.href = data.data.onboardingUrl;
        } else {
          // Mock account created successfully
          toast({
            title: "Success",
            description: data.message,
          });
          onAccountConnected(data.data);
        }
      } else {
        throw new Error(data.message || 'Failed to connect account');
      }
    } catch (error: any) {
      console.error('Failed to connect Stripe account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect Stripe account",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Connect Your Stripe Account
              </CardTitle>
              <CardDescription>
                Choose how you want to handle payments for your checkout pages
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Your Choice, Your Control</strong>
              <p className="text-sm mt-1">
                You can start with mock payments for testing and switch to real payments anytime.
                Both options provide the same features and analytics.
              </p>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real Stripe Account */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedOption === 'real' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedOption('real')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Real Stripe Account</CardTitle>
                      <Badge variant="default" className="bg-green-600">
                        Production Ready
                      </Badge>
                    </div>
                  </div>
                  {selectedOption === 'real' && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Connect your actual Stripe account to process real payments and receive money directly.
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Process real payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Receive money in your bank account</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Full Stripe dashboard access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Complete analytics and reporting</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Customer support and disputes</span>
                  </div>
                </div>

                <Alert className="mt-4 border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    Requires Stripe account verification and may take 1-2 business days to activate.
                  </AlertDescription>
                </Alert>

                <Button 
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectAccount('real');
                  }}
                  disabled={loading === 'real'}
                >
                  {loading === 'real' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect Real Stripe Account
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Mock Stripe Account */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedOption === 'mock' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedOption('mock')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TestTube className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Mock Testing Account</CardTitle>
                      <Badge variant="secondary" className="bg-purple-600 text-white">
                        Perfect for Testing
                      </Badge>
                    </div>
                  </div>
                  {selectedOption === 'mock' && (
                    <Check className="h-5 w-5 text-purple-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Create a mock account for testing and development. All features work exactly the same!
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Instant setup - no verification needed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Simulated payment flow</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Full analytics and reporting</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Test all checkout features</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Perfect for demos and development</span>
                  </div>
                </div>

                <Alert className="mt-4 border-green-200 bg-green-50">
                  <Settings className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-sm">
                    <strong>Pro Tip:</strong> You can always upgrade to a real account later without losing any data!
                  </AlertDescription>
                </Alert>

                <Button 
                  variant="outline"
                  className="w-full mt-4 border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectAccount('mock');
                  }}
                  disabled={loading === 'mock'}
                >
                  {loading === 'mock' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Create Mock Account
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Feature Comparison */}
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      <th className="text-center p-2">Real Account</th>
                      <th className="text-center p-2">Mock Account</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="p-2">Setup Time</td>
                      <td className="text-center p-2">1-2 days</td>
                      <td className="text-center p-2">Instant</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Real Money Processing</td>
                      <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                      <td className="text-center p-2">-</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Analytics & Reports</td>
                      <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                      <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Checkout Flow</td>
                      <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                      <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Form Submissions</td>
                      <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                      <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-2">Perfect For</td>
                      <td className="text-center p-2">Production</td>
                      <td className="text-center p-2">Testing & Demos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600">
            <p>
              Need help deciding? Start with a mock account for testing, then upgrade to real payments when you're ready!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeAccountSelection;
