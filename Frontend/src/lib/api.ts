const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sellify-o36c.onrender.com';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  plan: 'free' | 'builder' | 'pro';
  trialExpiresAt: string;
  stripeAccountId?: string;
  createdAt: string;
}

export interface CheckoutPage {
  _id: string;
  userId: string;
  slug: string;
  title: string;
  productName: string;
  description?: string;
  price: number;
  currency: string;
  fields: Array<{
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea' | 'checkbox';
    required: boolean;
  }>;
  successRedirectUrl?: string;
  cancelRedirectUrl?: string;
  layoutStyle: 'standard' | 'modern' | 'minimalist';
  orderBumps?: Array<{
    title: string;
    price: number;
    recurring: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  _id: string;
  pageId: string | CheckoutPage;
  formData: Record<string, any>;
  createdAt: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  results?: number;
  errors?: Array<{ msg: string; field: string }>;
}

export interface AuthResponse<T> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  token?: string;
  results?: number;
  errors?: Array<{ msg: string; field: string }>;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Always get fresh token from localStorage
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Always get fresh token from localStorage for each request
    const currentToken = localStorage.getItem('authToken');
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid JSON response: ${response.statusText}`);
      }

      if (!response.ok) {
        console.error(`❌ HTTP ${response.status} error:`, data);
        
        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          this.token = null;
        }
        
        // Handle validation errors specifically
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          throw new Error(data.errors[0].msg || data.message || `HTTP error! status: ${response.status}`);
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth Methods
  async register(userData: { name: string; email: string; password: string }): Promise<AuthResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }) as AuthResponse<{ user: User; token: string }>;
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }) as AuthResponse<{ user: User; token: string }>;
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    const response = await this.request('/api/auth/logout', { method: 'POST' });
    this.removeToken();
    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/api/auth/me');
  }

  // Pages Methods
  async createPage(pageData: Partial<CheckoutPage>) {
    return this.request<{ page: CheckoutPage }>('/api/pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  }

  async getUserPages() {
    return this.request<{ pages: CheckoutPage[] }>('/api/pages');
  }

  async getPageBySlug(slug: string) {
    return this.request<{ page: CheckoutPage; isStripeConnected: boolean }>(`/api/pages/${slug}`);
  }

  async updatePage(id: string, pageData: Partial<CheckoutPage>) {
    return this.request<{ page: CheckoutPage }>(`/api/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pageData),
    });
  }

  async deletePage(id: string) {
    return this.request(`/api/pages/${id}`, { method: 'DELETE' });
  }

  // Submissions Methods
  async submitForm(slug: string, formData: Record<string, any>) {
    return this.request<{ submissionId: string }>(`/api/pages/${slug}/submit`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async getUserSubmissions() {
    return this.request<{ submissions: Submission[] }>('/api/submissions');
  }

  async getPageSubmissions(pageId: string) {
    return this.request<{ submissions: Submission[] }>(`/api/pages/${pageId}/submissions`);
  }

  // Stripe Methods
  async connectStripeAccount() {
    return this.request<{ 
      stripeAccountId: string; 
      onboardingUrl?: string; 
      alreadyConnected?: boolean;
      message: string;
    }>('/api/stripe/connect', {
      method: 'POST',
    });
  }

  async getStripeConnectionStatus() {
    return this.request<{
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
    }>('/api/stripe/status');
  }

  async disconnectStripeAccount() {
    return this.request<{ message: string }>('/api/stripe/disconnect', {
      method: 'DELETE',
    });
  }

  async createCheckoutSession(pageId: string) {
    return this.request<{ url: string; sessionId: string }>(`/api/stripe/session/${pageId}`, {
      method: 'POST',
    });
  }

  // Public checkout session creation (no auth required)
  async createPublicCheckoutSession(pageId: string) {
    const response = await fetch(`${this.baseURL}/api/stripe/session/${pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

    async getStripeAccountStatus() {
    return this.request<{
      connected: boolean;
      accountId: string | null;
      details: any;
    }>('/api/analytics/stripe-status');
  }

  // Plan management
  async getPlans() {
    return this.request<{
      plans: Array<{
        id: string;
        name: string;
        description: string;
        maxPages: number | string;
        price: number;
        features: string[];
        popular?: boolean;
        current: boolean;
      }>;
      currentPlan: {
        id: string;
        maxPages: number;
        pagesUsed: number;
        pagesRemaining: number | string;
        usagePercentage: number;
      };
    }>('/api/plans');
  }

  async upgradePlan(planId: string) {
    return this.request<{
      message: string;
      user: User;
    }>('/api/plans/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async getPlanUsage() {
    return this.request<{
      plan: string;
      limits: {
        maxPages: number;
      };
      usage: {
        pagesUsed: number;
        pagesRemaining: number | string;
        usagePercentage: number;
        isNearLimit: boolean;
        isAtLimit: boolean;
      };
    }>('/api/plans/usage');
  }

  // Analytics Methods
  async getPaymentAnalytics() {
    return this.request<{
      stats: any;
      recentPayments: any[];
      monthlyRevenue: any[];
      totalRevenue: number;
      totalTransactions: number;
    }>('/api/analytics/payments');
  }

  async getPageAnalytics(pageId: string) {
    return this.request<{
      page: any;
      paymentStats: any[];
      submissionStats: any[];
      conversionRate: number;
      totalSubmissions: number;
      totalPayments: number;
      recentPayments: any[];
      recentSubmissions: any[];
    }>(`/api/analytics/pages/${pageId}`);
  }

  async getPaymentStatus(sessionId?: string, pageId?: string) {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    if (pageId) params.append('pageId', pageId);
    
    return this.request<{ payment: any }>(`/api/analytics/payments/status?${params.toString()}`);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual methods for easier use
export const authApi = {
  register: (userData: { name: string; email: string; password: string }) =>
    apiClient.register(userData),
  login: (credentials: { email: string; password: string }) =>
    apiClient.login(credentials),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),
};

export const pagesApi = {
  create: (pageData: Partial<CheckoutPage>) => apiClient.createPage(pageData),
  getUserPages: () => apiClient.getUserPages(),
  getBySlug: (slug: string) => apiClient.getPageBySlug(slug),
  update: (id: string, pageData: Partial<CheckoutPage>) =>
    apiClient.updatePage(id, pageData),
  delete: (id: string) => apiClient.deletePage(id),
};

export const submissionsApi = {
  submit: (slug: string, formData: Record<string, any>) =>
    apiClient.submitForm(slug, formData),
  getUserSubmissions: () => apiClient.getUserSubmissions(),
  getPageSubmissions: (pageId: string) => apiClient.getPageSubmissions(pageId),
};

export const stripeApi = {
  connectAccount: () => apiClient.connectStripeAccount(),
  getConnectionStatus: () => apiClient.getStripeConnectionStatus(),
  disconnectAccount: () => apiClient.disconnectStripeAccount(),
  createSession: (pageId: string) => apiClient.createCheckoutSession(pageId),
  createPublicSession: (pageId: string) => apiClient.createPublicCheckoutSession(pageId),
  getAccountStatus: () => apiClient.getStripeAccountStatus(), // Keep for backward compatibility
};

export const analyticsApi = {
  getPaymentAnalytics: () => apiClient.getPaymentAnalytics(),
  getPageAnalytics: (pageId: string) => apiClient.getPageAnalytics(pageId),
  getPaymentStatus: (sessionId?: string, pageId?: string) => apiClient.getPaymentStatus(sessionId, pageId),
};

export const planApi = {
  getPlans: () => apiClient.getPlans(),
  upgradePlan: (planId: string) => apiClient.upgradePlan(planId),
  getPlanUsage: () => apiClient.getPlanUsage(),
}; 