import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';

interface PlanLimits {
  maxPages: number;
  maxSubmissions?: number;
  hasAdvancedAnalytics: boolean;
  hasCustomBranding: boolean;
  hasPrioritySupport: boolean;
  hasAPIAccess: boolean;
}

interface UsageStats {
  pagesUsed: number;
  submissionsCount: number;
  pagesRemaining: number;
  usagePercentage: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
}

interface PlanLimitsHook {
  limits: PlanLimits;
  usage: UsageStats;
  loading: boolean;
  canCreatePage: boolean;
  trialDaysLeft: number;
  isTrialExpired: boolean;
  refreshUsage: () => Promise<void>;
}

const PLAN_CONFIGS: Record<string, PlanLimits> = {
  free: {
    maxPages: 10,
    hasAdvancedAnalytics: false,
    hasCustomBranding: false,
    hasPrioritySupport: false,
    hasAPIAccess: false
  },
  builder: {
    maxPages: 25,
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
      const [pagesResponse, submissionsResponse] = await Promise.all([
        apiClient.getUserPages(),
        apiClient.getUserSubmissions()
      ]);

      const pagesUsed = pagesResponse.data?.pages?.length || 0;
      const submissionsCount = submissionsResponse.data?.submissions?.length || 0;
      const pagesRemaining = limits.maxPages === Infinity ? Infinity : Math.max(0, limits.maxPages - pagesUsed);
      const usagePercentage = limits.maxPages === Infinity ? 0 : (pagesUsed / limits.maxPages) * 100;
      const isNearLimit = usagePercentage >= 80;
      const isAtLimit = pagesUsed >= limits.maxPages;

      setUsage({
        pagesUsed,
        submissionsCount,
        pagesRemaining,
        usagePercentage,
        isNearLimit,
        isAtLimit
      });
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user, plan]);

  const getTrialDaysLeft = (): number => {
    if (!user?.trialExpiresAt) return 0;
    const now = new Date();
    const trialEnd = new Date(user.trialExpiresAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isTrialExpired = (): boolean => {
    if (!user?.trialExpiresAt) return false;
    return new Date() > new Date(user.trialExpiresAt);
  };

  const canCreatePage = !usage.isAtLimit || plan === 'pro';

  return {
    limits,
    usage,
    loading,
    canCreatePage,
    trialDaysLeft: getTrialDaysLeft(),
    isTrialExpired: isTrialExpired(),
    refreshUsage: fetchUsage
  };
}; 