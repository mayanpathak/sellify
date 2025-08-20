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
import { planApi } from '../lib/api';
import { toast } from '../hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  description: string;
  maxPages: number | string;
  price: number;
  features: string[];
  popular?: boolean;
  current: boolean;
}

interface CurrentPlan {
  id: string;
  maxPages: number;
  pagesUsed: number;
  pagesRemaining: number | string;
  usagePercentage: number;
}

const PlanManagement: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);

  useEffect(() => {
    fetchPlansData();
  }, []);

  const fetchPlansData = async () => {
    try {
      setLoading(true);
      const response = await planApi.getPlans();
      setPlans(response.data.plans);
      setCurrentPlan(response.data.currentPlan);
    } catch (error) {
      console.error('Failed to fetch plans data:', error);
      toast({
        title: "Error",
        description: "Failed to load plans data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (user?.plan === planId) {
      toast({
        title: "Already on this plan",
        description: `You are already on the ${planId} plan.`,
      });
      return;
    }

    setUpgradeLoading(planId);
    try {
      const response = await planApi.upgradePlan(planId);
      
      toast({
        title: "Success",
        description: response.data.message,
      });
      
      // Refresh user data and plans data
      await refreshUser();
      await fetchPlansData();
      
    } catch (error: any) {
      console.error('Failed to upgrade plan:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upgrade plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpgradeLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="h-6 w-6" />;
      case 'builder':
        return <Zap className="h-6 w-6" />;
      case 'pro':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'border-gray-200';
      case 'builder':
        return 'border-blue-200 shadow-lg ring-2 ring-blue-100';
      case 'pro':
        return 'border-purple-200 shadow-lg ring-2 ring-purple-100';
      default:
        return 'border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Plan Management
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include a free upgrade for testing purposes.
          </p>
        </div>

        {/* Current Plan Usage */}
        {currentPlan && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Plan Usage
              </CardTitle>
              <CardDescription>
                Track your current plan usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Plan</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{currentPlan.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pages Used</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentPlan.pagesUsed} / {currentPlan.maxPages === Infinity ? 'Unlimited' : currentPlan.maxPages}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pages Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentPlan.pagesRemaining}
                  </p>
                </div>
              </div>
              
              {currentPlan.maxPages !== Infinity && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Usage</span>
                    <span>{currentPlan.usagePercentage}%</span>
                  </div>
                  <Progress value={currentPlan.usagePercentage} className="h-2" />
                  {currentPlan.usagePercentage >= 80 && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {currentPlan.usagePercentage >= 100 
                          ? "You've reached your page limit. Upgrade to create more pages."
                          : "You're approaching your page limit. Consider upgrading your plan."
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${getPlanColor(plan.id)} ${plan.current ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 text-white">
                    Current Plan
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-xl capitalize">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 ml-1">
                    {plan.price === 0 ? 'free' : '/month'}
                  </span>
                  {plan.price > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      Free for Testing
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Pages: {typeof plan.maxPages === 'number' ? plan.maxPages : plan.maxPages}
                  </p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.current || upgradeLoading === plan.id}
                  className={`w-full ${
                    plan.current 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  variant={plan.current ? "secondary" : "default"}
                >
                  {upgradeLoading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Upgrading...
                    </div>
                  ) : plan.current ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Current Plan
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {plan.price === 0 ? 'Select Plan' : 'Upgrade Now'}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Free Testing Environment
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              All plan upgrades are free for testing purposes. In a production environment, 
              this would integrate with your payment processor for actual billing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;