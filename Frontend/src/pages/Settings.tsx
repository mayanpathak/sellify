import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Crown, Calendar, CreditCard, BarChart3, AlertTriangle, CheckCircle, Zap, ExternalLink, Webhook } from 'lucide-react';
import { apiClient } from '../lib/api';
import { toast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import StripeConnectionCard from '../components/StripeConnectionCard';

interface UserStats {
  totalPages: number;
  totalSubmissions: number;
  planLimits: {
    maxPages: number;
    maxSubmissions?: number;
  };
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const [pagesResponse, submissionsResponse] = await Promise.all([
        apiClient.getUserPages(),
        apiClient.getUserSubmissions()
      ]);

      const planLimits = {
        free: { maxPages: 10 },
        builder: { maxPages: 25 },
        pro: { maxPages: Infinity }
      };

      setStats({
        totalPages: pagesResponse.data?.pages?.length || 0,
        totalSubmissions: submissionsResponse.data?.submissions?.length || 0,
        planLimits: planLimits[user?.plan || 'free']
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      toast({
        title: "Error",
        description: "Failed to load user statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'builder': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isTrialExpired = () => {
    if (!user?.trialExpiresAt) return false;
    return new Date() > new Date(user.trialExpiresAt);
  };

  const getTrialDaysLeft = () => {
    if (!user?.trialExpiresAt) return 0;
    const now = new Date();
    const trialEnd = new Date(user.trialExpiresAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUsagePercentage = () => {
    if (!stats) return 0;
    if (stats.planLimits.maxPages === Infinity) return 0;
    return (stats.totalPages / stats.planLimits.maxPages) * 100;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account and subscription preferences</p>
        </div>

        {/* Trial Warning */}
        {user?.plan === 'free' && isTrialExpired() && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Your trial has expired. Please upgrade your plan to continue using all features.
            </AlertDescription>
          </Alert>
        )}

        {user?.plan === 'free' && !isTrialExpired() && getTrialDaysLeft() <= 7 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Calendar className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your trial expires in {getTrialDaysLeft()} days. Consider upgrading to continue using all features.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-medium">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Plan</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getPlanColor(user?.plan || 'free')}>
                    {user?.plan?.toUpperCase() || 'FREE'}
                  </Badge>
                  {user?.plan === 'pro' && <Crown className="h-4 w-4 text-purple-600" />}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-lg">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {user?.plan === 'free' && user?.trialExpiresAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Trial Status</label>
                  <p className="text-lg">
                    {isTrialExpired() ? (
                      <span className="text-red-600">Expired</span>
                    ) : (
                      <span className="text-green-600">{getTrialDaysLeft()} days left</span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
              <CardDescription>Your current usage and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-500">Pages Created</label>
                  <span className="text-sm text-gray-600">
                    {stats?.totalPages || 0} / {stats?.planLimits.maxPages === Infinity ? '∞' : stats?.planLimits.maxPages}
                  </span>
                </div>
                {stats?.planLimits.maxPages !== Infinity && (
                  <Progress value={getUsagePercentage()} className="h-2" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Submissions</label>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalSubmissions || 0}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Plan Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {user?.plan === 'free' && (
                    <>
                      <li>• Up to 10 checkout pages</li>
                      <li>• Basic form fields</li>
                      <li>• Email notifications</li>
                    </>
                  )}
                  {user?.plan === 'builder' && (
                    <>
                      <li>• Up to 25 checkout pages</li>
                      <li>• Advanced form fields</li>
                      <li>• Custom styling</li>
                      <li>• Priority support</li>
                    </>
                  )}
                  {user?.plan === 'pro' && (
                    <>
                      <li>• Unlimited checkout pages</li>
                      <li>• All form field types</li>
                      <li>• Custom branding</li>
                      <li>• Advanced analytics</li>
                      <li>• Priority support</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stripe Payment Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Payment Settings</h2>
              <p className="text-muted-foreground">Manage your Stripe integration for payment processing</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/stripe/manage')}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Advanced Stripe Management
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          <StripeConnectionCard 
            onConnectionChange={(connected) => setStripeConnected(connected)}
          />

          {/* Webhook Management Link */}
          {stripeConnected && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Webhook className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Webhook Events</h3>
                      <p className="text-sm text-blue-700">
                        Monitor and debug webhook events from Stripe
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/webhooks/manage')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Webhook className="h-4 w-4 mr-2" />
                    View Webhook Logs
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Plan Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plan Management
            </CardTitle>
            <CardDescription>Upgrade or manage your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan: {user?.plan?.toUpperCase() || 'FREE'}</p>
                <p className="text-sm text-gray-600">
                  {user?.plan === 'free' && 'Perfect for getting started'}
                  {user?.plan === 'builder' && 'Great for growing businesses'}
                  {user?.plan === 'pro' && 'Everything you need to scale'}
                </p>
              </div>
              <div className="space-x-2">
                {user?.plan !== 'pro' && (
                  <Button>
                    Upgrade Plan
                  </Button>
                )}
                {user?.plan !== 'free' && (
                  <Button variant="outline">
                    Manage Subscription
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-gray-600">Sign out of your account on this device</p>
              </div>
              <Button variant="destructive" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 