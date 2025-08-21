import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Loader2,
  Zap,
  Unlink,
  ArrowLeft,
  Settings,
  DollarSign,
  Activity,
  Shield,
  Globe,
  Webhook
} from 'lucide-react';
import { stripeApi, analyticsApi } from '../lib/api';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface StripeStatus {
  connected: boolean;
  accountId: string | null;
  details: {
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
    details_submitted?: boolean;
    requirements?: any;
    mock?: boolean;
  } | null;
  error?: string;
}

interface PaymentAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    customerEmail?: string;
    createdAt: string;
  }>;
}

const StripeManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStripeData();
  }, []);

  const fetchStripeData = async () => {
    try {
      setLoading(true);
      const [statusResponse, analyticsResponse] = await Promise.allSettled([
        stripeApi.getConnectionStatus(),
        analyticsApi.getPaymentAnalytics()
      ]);

      if (statusResponse.status === 'fulfilled') {
        setStripeStatus(statusResponse.value.data);
      }

      if (analyticsResponse.status === 'fulfilled') {
        setAnalytics(analyticsResponse.value.data);
      }
    } catch (error) {
      console.error('Failed to fetch Stripe data:', error);
      toast({
        title: "Error",
        description: "Failed to load Stripe information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await stripeApi.connectAccount();
      
      if (response.data.alreadyConnected) {
        toast({
          title: "Already Connected",
          description: response.data.message,
        });
        await fetchStripeData(); // Refresh data
      } else if (response.data.onboardingUrl) {
        toast({
          title: "Redirecting to Stripe",
          description: "Complete your Stripe onboarding to start accepting payments",
        });
        window.location.href = response.data.onboardingUrl;
      }
    } catch (error: any) {
      console.error('Failed to connect Stripe:', error);
      toast({
        title: "Connection Failed",
        description: error.response?.data?.message || "Failed to connect Stripe account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Stripe account? This will disable payment processing for all your checkout pages and you will no longer be able to accept payments.')) {
      return;
    }
    
    setDisconnecting(true);
    try {
      await stripeApi.disconnectAccount();
      toast({
        title: "Account Disconnected",
        description: "Your Stripe account has been disconnected successfully. You can reconnect anytime.",
      });
      await fetchStripeData();
    } catch (error: any) {
      console.error('Failed to disconnect Stripe:', error);
      toast({
        title: "Disconnection Failed",
        description: error.response?.data?.message || "Failed to disconnect Stripe account",
        variant: "destructive"
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      await fetchStripeData();
      toast({
        title: "Status Refreshed",
        description: "Stripe connection status has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh Stripe status",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = () => {
    if (!stripeStatus?.connected) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Not Connected</Badge>;
    }

    if (stripeStatus.details?.mock) {
      return <Badge className="bg-blue-600 text-white">Development Mode</Badge>;
    }

    if (stripeStatus.details?.details_submitted && stripeStatus.details?.charges_enabled) {
      return <Badge className="bg-green-600 text-white">✓ Active & Ready</Badge>;
    }

    return <Badge className="bg-yellow-600 text-white">⚠ Setup Required</Badge>;
  };

  const getStatusIcon = () => {
    if (!stripeStatus?.connected) {
      return <CreditCard className="h-8 w-8 text-gray-400" />;
    }

    if (stripeStatus.details?.charges_enabled) {
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    }

    return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stripe Payment Management</h1>
            <p className="text-muted-foreground">Manage your payment processing and Stripe integration</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Main Status Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon()}
                <div>
                  <CardTitle className="text-xl">
                    {stripeStatus?.connected ? 'Stripe Connected' : 'Connect Stripe Account'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {stripeStatus?.connected 
                      ? 'Your Stripe account is connected and ready to process payments'
                      : 'Connect your Stripe account to start accepting payments from customers worldwide'
                    }
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStatus}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Activity className="h-4 w-4 mr-2" />
                )}
                Refresh Status
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {stripeStatus?.connected ? (
              <>
                {/* Connection Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {stripeStatus.details?.charges_enabled ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <p className="font-medium">
                      {stripeStatus.details?.charges_enabled ? 'Charges Enabled' : 'Charges Disabled'}
                    </p>
                    <p className="text-sm text-gray-600">Accept Payments</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {stripeStatus.details?.payouts_enabled ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <p className="font-medium">
                      {stripeStatus.details?.payouts_enabled ? 'Payouts Enabled' : 'Payouts Disabled'}
                    </p>
                    <p className="text-sm text-gray-600">Receive Money</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {stripeStatus.details?.details_submitted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <p className="font-medium">
                      {stripeStatus.details?.details_submitted ? 'Setup Complete' : 'Setup Required'}
                    </p>
                    <p className="text-sm text-gray-600">Account Info</p>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="font-medium">
                      {stripeStatus.details?.mock ? 'Development' : 'Production'}
                    </p>
                    <p className="text-sm text-gray-600">Environment</p>
                  </div>
                </div>

                {/* Account Information */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">Stripe Account ID</p>
                      <p className="text-sm text-blue-700 font-mono">{stripeStatus.accountId}</p>
                    </div>
                    {stripeStatus.details?.mock && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Development Mode
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Requirements Alert */}
                {stripeStatus.details?.requirements?.currently_due?.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Action Required:</strong> Complete your Stripe onboarding to enable full payment processing.
                      <br />
                      <span className="text-sm">
                        Missing requirements: {stripeStatus.details.requirements.currently_due.slice(0, 5).join(', ')}
                        {stripeStatus.details.requirements.currently_due.length > 5 && '...'}
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {connecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ExternalLink className="h-4 w-4 mr-2" />
                    )}
                    {connecting ? 'Opening Stripe...' : 'Manage on Stripe'}
                  </Button>
                  
                  <Button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    variant="destructive"
                  >
                    {disconnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Unlink className="h-4 w-4 mr-2" />
                    )}
                    {disconnecting ? 'Disconnecting...' : 'Disconnect Account'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/webhooks/manage')}
                  >
                    <Webhook className="h-4 w-4 mr-2" />
                    Manage Webhooks
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    View Checkout Pages
                  </Button>
                </div>
              </>
            ) : (
              /* Not Connected State */
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-blue-600" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Connect Your Stripe Account
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Start accepting payments from customers worldwide. Stripe handles all the payment processing,
                    security, and compliance for you with industry-leading fraud protection.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <div className="text-center p-4">
                    <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-sm">Accept Cards</p>
                    <p className="text-xs text-gray-600">Visa, Mastercard, Amex</p>
                  </div>
                  <div className="text-center p-4">
                    <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-sm">Global Processing</p>
                    <p className="text-xs text-gray-600">135+ currencies</p>
                  </div>
                  <div className="text-center p-4">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium text-sm">Fraud Protection</p>
                    <p className="text-xs text-gray-600">Advanced security</p>
                  </div>
                  <div className="text-center p-4">
                    <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="font-medium text-sm">Instant Payouts</p>
                    <p className="text-xs text-gray-600">Fast settlements</p>
                  </div>
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
                >
                  {connecting ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  ) : (
                    <CreditCard className="h-5 w-5 mr-3" />
                  )}
                  {connecting ? 'Connecting to Stripe...' : 'Connect Stripe Account'}
                </Button>

                <p className="text-sm text-gray-500">
                  By connecting, you agree to Stripe's terms of service. 
                  <br />
                  Setup takes less than 5 minutes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Card - Only show if connected */}
        {stripeStatus?.connected && analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Payment Analytics
              </CardTitle>
              <CardDescription>Overview of your payment performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">
                    ${(analytics.totalRevenue / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">Total Revenue</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{analytics.totalTransactions}</p>
                  <p className="text-sm text-blue-600">Total Transactions</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">{analytics.successRate}%</p>
                  <p className="text-sm text-purple-600">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Resources and support for Stripe integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <a href="https://stripe.com/docs" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Stripe Documentation
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://support.stripe.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Stripe Support
                </a>
              </Button>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Keep your Stripe account information up to date to ensure uninterrupted payment processing. 
                If you experience any issues, contact Stripe support directly.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StripeManagement;
