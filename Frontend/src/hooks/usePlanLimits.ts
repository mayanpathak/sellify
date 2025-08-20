import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { planApi } from '../lib/api';

interface PlanLimits {
  maxPages: number;
  hasAdvancedAnalytics: boolean;
  hasCustomBranding: boolean;
  hasPrioritySupport: boolean;
  hasAPIAccess: boolean;
}

interface UsageStats {
  pagesUsed: number;
  submissionsCount: number;
  pagesRemaining: number | string;
  usagePercentage: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
}

interface PlanLimitsHook {
  limits: PlanLimits;
  usage: UsageStats;
  loading: boolean;
  canCreatePage: boolean;
  refreshUsage: () => Promise<void>;
}

const PLAN_CONFIGS: Record<string, PlanLimits> = {
  free: {
    maxPages: 3,
    hasAdvancedAnalytics: false,
    hasCustomBranding: false,
    hasPrioritySupport: false,
    hasAPIAccess: false
  },
  builder: {
    maxPages: 10,
    hasAdvancedAnalytics: true,
    hasCustomBranding: true,
    hasPrioritySupport: true,
    hasAPIAccess: false
  },
  pro: {
    maxPages: Infinity,
    hasAdvancedAnalytics: true,
    hasCustomBranding: true,
    hasPrioritySupport: true,
    hasAPIAccess: true
  }
};

export const usePlanLimits = (): PlanLimitsHook => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats>({
    pagesUsed: 0,
    submissionsCount: 0,
    pagesRemaining: 0,
    usagePercentage: 0,
    isNearLimit: false,
    isAtLimit: false
  });
  const [loading, setLoading] = useState(true);

  const plan = user?.plan || 'free';
  const limits = PLAN_CONFIGS[plan];

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await planApi.getPlanUsage();
      
      setUsage({
        pagesUsed: response.data.usage.pagesUsed,
        submissionsCount: 0, // We don't track submissions in plan usage anymore
        pagesRemaining: response.data.usage.pagesRemaining,
        usagePercentage: response.data.usage.usagePercentage,
        isNearLimit: response.data.usage.isNearLimit,
        isAtLimit: response.data.usage.isAtLimit
      });
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      // Fallback to old method if new API fails
      setUsage({
        pagesUsed: 0,
        submissionsCount: 0,
        pagesRemaining: limits.maxPages === Infinity ? 'Unlimited' : limits.maxPages,
        usagePercentage: 0,
        isNearLimit: false,
        isAtLimit: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user, plan]);

  const canCreatePage = !usage.isAtLimit || plan === 'pro';

  return {
    limits,
    usage,
    loading,
    canCreatePage,
    refreshUsage: fetchUsage
  };
};