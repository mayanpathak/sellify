import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Loader2,
  Zap,
  Unlink
} from 'lucide-react';
import { stripeApi } from '../lib/api';
import { toast } from '../hooks/use-toast';
import StripeAccountSelection from './StripeAccountSelection';

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

interface StripeConnectionCardProps {
  className?: string;
  onConnectionChange?: (connected: boolean) => void;
}

const StripeConnectionCard: React.FC<StripeConnectionCardProps> = ({
  className = '',
  onConnectionChange
}) => {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showAccountSelection, setShowAccountSelection] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchStripeStatus();
  }, []);

  const fetchStripeStatus = async () => {
    try {
      setLoading(true);
      const response = await stripeApi.getConnectionStatus();
      setStripeStatus(response.data);
      onConnectionChange?.(response.data.connected);
    } catch (error) {
      console.error('Failed to fetch Stripe status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Stripe connection status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    setShowAccountSelection(true);
  };

  const handleAccountConnected = async (accountData: any) => {
    setShowAccountSelection(false);
    
    toast({
      title: "Success",
      description: accountData.isMock ? 
        "Mock Stripe account created for testing!" : 
        "Stripe account connected successfully!",
    });
    
    // Refresh status
    await fetchStripeStatus();
    onConnectionChange?.(true);
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Stripe account? This will disable payment processing for all your checkout pages.')) {
      return;
    }
    
    setDisconnecting(true);
    try {
      await stripeApi.disconnectAccount();
      toast({
        title: "Account Disconnected",
        description: "Your Stripe account has been disconnected successfully",
      });
      await fetchStripeStatus();
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

  const getStatusBadge = () => {
    if (!stripeStatus?.connected) {
      return <Badge variant="secondary">Not Connected</Badge>;
    }

    if (stripeStatus.details?.mock) {
      return <Badge className="bg-blue-600 text-white">Connected (Dev Mode)</Badge>;
    }

    if (stripeStatus.details?.details_submitted && stripeStatus.details?.charges_enabled) {
      return <Badge className="bg-green-600 text-white">Active</Badge>;
    }

    return <Badge className="bg-yellow-600 text-white">Setup Required</Badge>;
  };

  const getStatusIcon = () => {
    if (!stripeStatus?.connected) {
      return <CreditCard className="h-6 w-6 text-gray-400" />;
    }

    if (stripeStatus.details?.charges_enabled) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    }

    return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Stripe Connection</CardTitle>
              <CardDescription>
                {stripeStatus?.connected 
                  ? 'Accept payments from customers worldwide'
                  : 'Connect your Stripe account to start accepting payments'
                }
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {stripeStatus?.connected ? (
          <div className="space-y-4">
            {/* Connection Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stripeStatus.details?.charges_enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {stripeStatus.details?.charges_enabled ? 'Charges Enabled' : 'Charges Disabled'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stripeStatus.details?.payouts_enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {stripeStatus.details?.payouts_enabled ? 'Payouts Enabled' : 'Payouts Disabled'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stripeStatus.details?.details_submitted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {stripeStatus.details?.details_submitted ? 'Setup Complete' : 'Setup Required'}
                </p>
              </div>
            </div>

            {/* Account ID */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Account ID:</strong> {stripeStatus.accountId}
                {stripeStatus.details?.mock && (
                  <Badge variant="secondary" className="ml-2">Development</Badge>
                )}
              </p>
            </div>

            {/* Requirements Alert */}
            {stripeStatus.details?.requirements?.currently_due?.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Action Required:</strong> Complete your Stripe onboarding to enable payments.
                  Missing: {stripeStatus.details.requirements.currently_due.slice(0, 3).join(', ')}
                  {stripeStatus.details.requirements.currently_due.length > 3 && '...'}
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleConnect}
                disabled={connecting}
                variant="outline"
                size="sm"
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                {connecting ? 'Connecting...' : 'Manage Account'}
              </Button>
              
              <Button
                onClick={handleDisconnect}
                disabled={disconnecting}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {disconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Unlink className="h-4 w-4 mr-2" />
                )}
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Connect Your Stripe Account
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Start accepting payments from customers worldwide. Stripe handles all the payment processing,
                security, and compliance for you.
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Accept major credit cards & digital wallets
              </p>
              <p className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Global payment processing
              </p>
              <p className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Advanced fraud protection
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {connecting ? 'Connecting...' : 'Connect Stripe Account'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    
    {showAccountSelection && (
      <StripeAccountSelection
        onAccountConnected={handleAccountConnected}
        onClose={() => setShowAccountSelection(false)}
      />
    )}
  </>
  );
};

export default StripeConnectionCard;
