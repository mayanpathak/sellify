import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Crown, AlertTriangle, TrendingUp } from 'lucide-react';

interface PlanUpgradePromptProps {
  feature: string;
  description: string;
  variant?: 'warning' | 'info' | 'success';
  className?: string;
  showIcon?: boolean;
}

const PlanUpgradePrompt: React.FC<PlanUpgradePromptProps> = ({
  feature,
  description,
  variant = 'warning',
  className = '',
  showIcon = true
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Don't show for pro users
  if (user?.plan === 'pro') return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'info':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'info':
        return 'text-blue-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-yellow-800';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'info':
        return <TrendingUp className={`h-4 w-4 ${getIconColor()}`} />;
      case 'success':
        return <Crown className={`h-4 w-4 ${getIconColor()}`} />;
      default:
        return <AlertTriangle className={`h-4 w-4 ${getIconColor()}`} />;
    }
  };

  return (
    <Alert className={`${getVariantStyles()} ${className}`}>
      {showIcon && getIcon()}
      <AlertDescription className={getTextColor()}>
        <div className="flex items-center justify-between">
          <div>
            <strong>{feature}</strong>
            <p className="text-sm mt-1">{description}</p>
          </div>
          <Button 
            onClick={() => navigate('/plans')}
            className={`ml-4 ${
              variant === 'info' ? 'bg-blue-600 hover:bg-blue-700' :
              variant === 'success' ? 'bg-green-600 hover:bg-green-700' :
              'bg-yellow-600 hover:bg-yellow-700'
            } text-white`}
            size="sm"
          >
            <Crown className="w-3 h-3 mr-1" />
            Upgrade Plan
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PlanUpgradePrompt; 