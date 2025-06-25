import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Crown, 
  Check, 
  X, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Zap,
  Shield,
  Star,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { toast } from '../hooks/use-toast';

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface Plan {
  id: 'free' | 'builder' | 'pro';
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
  maxPages: number;
}

const PlanManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ totalPages: number; totalSubmissions: number } | null>(null);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started with basic checkout pages',
      maxPages: 10,
      features: [
        { name: 'Up to 10 checkout pages', included: true },
        { name: 'Basic form fields', included: true },
        { name: 'Email notifications', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Community support', included: true },
        { name: 'Custom branding', included: false },
        { name: 'Advanced form fields', included: false },
        { name: 'Priority support', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'API access', included: false }
      ],
      current: user?.plan === 'free'
    },
    {
      id: 'builder',
      name: 'Builder',
      price: 29,
      period: 'month',
      description: 'Great for growing businesses with more customization needs',
      maxPages: 25,
      popular: true,
      features: [
        { name: 'Up to 25 checkout pages', included: true },
        { name: 'All form field types', included: true },
        { name: 'Custom styling options', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Custom branding', included: true },
        { name: 'Webhook integrations', included: true },
        { name: 'Export submissions', included: true },
        { name: 'API access', included: false },
        { name: 'White-label solution', included: false }
      ],
      current: user?.plan === 'builder'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      period: 'month',
      description: 'Everything you need to scale your business',
      maxPages: Infinity,
      features: [
        { name: 'Unlimited checkout pages', included: true },
        { name: 'All form field types', included: true },
        { name: 'Complete customization', included: true },
        { name: 'Advanced analytics & reports', included: true },
        { name: 'Priority phone & email support', included: true },
        { name: 'Custom branding', included: true },
        { name: 'Advanced webhook integrations', included: true },
        { name: 'Full API access', included: true },
        { name: 'White-label solution', included: true },
        { name: 'Custom integrations', included: true }
      ],
      current: user?.plan === 'pro'
    }
  ];

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const [pagesResponse, submissionsResponse] = await Promise.all([
        apiClient.getUserPages(),
        apiClient.getUserSubmissions()
      ]);

      setStats({
        totalPages: pagesResponse.data?.pages?.length || 0,
        totalSubmissions: submissionsResponse.data?.submissions?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      // This would typically redirect to Stripe Checkout or your payment processor
      toast({
        title: "Upgrade Plan",
        description: `Redirecting to upgrade to ${planId} plan...`,
      });
      
      // Simulate upgrade process
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Plan upgraded successfully!",
        });
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade plan. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const getCurrentPlan = () => plans.find(plan => plan.current);
  const currentPlan = getCurrentPlan();

  const getUsagePercentage = () => {
    if (!stats || !currentPlan) return 0;
    if (currentPlan.maxPages === Infinity) return 0;
    return (stats.totalPages / currentPlan.maxPages) * 100;
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your business with the right plan. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Current Plan Status */}
        {currentPlan && (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Current Plan: {currentPlan.name}
                {currentPlan.id === 'pro' && <Crown className="h-5 w-5 text-yellow-500" />}
              </CardTitle>
              <CardDescription>
                {currentPlan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.plan === 'free' && user?.trialExpiresAt && (
                <div>
                  {isTrialExpired() ? (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Your trial has expired. Upgrade now to continue using all features.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        Trial expires in {getTrialDaysLeft()} days. Upgrade to keep access to all features.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {stats && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Pages Used</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.totalPages} / {currentPlan.maxPages === Infinity ? '∞' : currentPlan.maxPages}
                      </span>
                    </div>
                    {currentPlan.maxPages !== Infinity && (
                      <Progress value={getUsagePercentage()} className="h-2" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Total Submissions</span>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''} ${plan.current ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ${plan.price}
                    {plan.price > 0 && <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>}
                  </div>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="pt-4">
                  {plan.current ? (
                    <Button disabled className="w-full">
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading}
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {loading ? (
                        'Processing...'
                      ) : (
                        <>
                          {plan.price === 0 ? 'Downgrade' : 'Upgrade'} to {plan.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What happens to my data if I downgrade?</h4>
                <p className="text-sm text-muted-foreground">
                  Your data is safe. However, you may lose access to some features and need to reduce your usage to fit the new plan limits.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Is there a setup fee?</h4>
                <p className="text-sm text-muted-foreground">
                  No setup fees. You only pay the monthly or annual subscription fee for your chosen plan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Need help choosing a plan?</h3>
            <p className="text-muted-foreground mb-4">
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanManagement; 