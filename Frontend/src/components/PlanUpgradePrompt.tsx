import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Crown, Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PlanUpgradePromptProps {
  currentPlan: string;
  pagesUsed: number;
  maxPages: number | string;
  onClose?: () => void;
  showInline?: boolean;
}

const PlanUpgradePrompt: React.FC<PlanUpgradePromptProps> = ({
  currentPlan,
  pagesUsed,
  maxPages,
  onClose,
  showInline = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getNextPlan = () => {
    if (currentPlan === 'free') return 'builder';
    if (currentPlan === 'builder') return 'pro';
    return 'pro';
  };

  const getNextPlanInfo = () => {
    const nextPlan = getNextPlan();
    
    const planInfo = {
      builder: {
        name: 'Builder',
        icon: <Zap className="h-5 w-5" />,
        maxPages: 10,
        features: ['Up to 10 pages', 'Advanced analytics', 'Custom branding', 'Priority support']
      },
      pro: {
        name: 'Pro',
        icon: <Crown className="h-5 w-5" />,
        maxPages: 'Unlimited',
        features: ['Unlimited pages', 'Full API access', 'White-label solution', 'Premium support']
      }
    };

    return planInfo[nextPlan as keyof typeof planInfo];
  };

  const nextPlanInfo = getNextPlanInfo();

  const handleUpgrade = () => {
    navigate('/plan-management');
    onClose?.();
  };

  if (showInline) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <span>
              You've used {pagesUsed} of {maxPages} pages. 
              <strong className="ml-1">Upgrade to {nextPlanInfo?.name}</strong> for {nextPlanInfo?.maxPages} pages.
            </span>
            <Button 
              size="sm" 
              onClick={handleUpgrade}
              className="ml-4 bg-orange-600 hover:bg-orange-700"
            >
              Upgrade Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle>Page Limit Reached</CardTitle>
          <CardDescription>
            You've reached your limit of {maxPages} pages on the {currentPlan} plan.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {nextPlanInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                {nextPlanInfo.icon}
                <h3 className="font-semibold">Upgrade to {nextPlanInfo.name}</h3>
                <Badge className="bg-green-600 text-white">Free for Testing</Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Pages:</strong> {nextPlanInfo.maxPages}
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {nextPlanInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {onClose && (
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <span className="flex items-center gap-2">
                Upgrade Now
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            All upgrades are free for testing purposes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanUpgradePrompt;