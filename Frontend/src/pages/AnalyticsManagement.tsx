import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Download,
  Eye,
  Activity,
  CreditCard,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { analyticsApi } from '../lib/api';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface DashboardAnalytics {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    totalSubmissions: number;
    totalPages: number;
    overallConversionRate: number;
    averageOrderValue: number;
  };
  paymentStats: {
    completed: { count: number; totalAmount: number };
    pending: { count: number; totalAmount: number };
    failed: { count: number; totalAmount: number };
  };
  submissionStats: {
    completed: number;
    pending: number;
    none: number;
  };
  recentPayments: Array<{
    _id: string;
    amount: number;
    currency: string;
    status: string;
    customerEmail: string;
    createdAt: string;
    pageId: {
      title: string;
      productName: string;
    };
  }>;
  recentSubmissions: Array<{
    _id: string;
    formData: Record<string, any>;
    paymentStatus: string;
    createdAt: string;
    pageId: {
      title: string;
      productName: string;
    };
  }>;
  monthlyRevenue: Array<{
    _id: { year: number; month: number };
    revenue: number;
    count: number;
  }>;
  topPerformingPages: Array<{
    _id: string;
    pageTitle: string;
    pageSlug: string;
    revenue: number;
    transactionCount: number;
  }>;
  conversionRates: Array<{
    _id: string;
    pageTitle: string;
    pageSlug: string;
    totalSubmissions: number;
    completedSubmissions: number;
    conversionRate: number;
  }>;
  revenueByPage: Array<{
    name: string;
    value: number;
  }>;
}

interface RevenueAnalytics {
  revenueData: Array<{
    _id: any;
    revenue: number;
    transactionCount: number;
    averageOrderValue: number;
  }>;
  period: string;
  totalRevenue: number;
  totalTransactions: number;
}

const AnalyticsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const [filters, setFilters] = useState({
    days: 30,
    revenuePeriod: 'monthly',
    revenueDays: 365
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters.days]);

  useEffect(() => {
    if (selectedTab === 'revenue') {
      fetchRevenueData();
    }
  }, [selectedTab, filters.revenuePeriod, filters.revenueDays]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getDashboard(filters.days);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const response = await analyticsApi.getRevenueAnalytics(filters.revenuePeriod, filters.revenueDays);
      setRevenueData(response.data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      toast({
        title: "Error",
        description: "Failed to load revenue data",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    if (selectedTab === 'revenue') {
      await fetchRevenueData();
    }
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Analytics data has been updated",
    });
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-600 text-white', icon: CheckCircle, text: 'Completed' },
      pending: { color: 'bg-yellow-600 text-white', icon: AlertCircle, text: 'Pending' },
      failed: { color: 'bg-red-600 text-white', icon: AlertCircle, text: 'Failed' },
      none: { color: 'bg-blue-600 text-white', icon: FileText, text: 'Free' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const formatMonthlyData = (monthlyRevenue: DashboardAnalytics['monthlyRevenue']) => {
    return monthlyRevenue.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: item.revenue / 100, // Convert from cents
      transactions: item.count,
      name: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }));
  };

  const formatRevenueChartData = (revenueData: RevenueAnalytics['revenueData'], period: string) => {
    return revenueData.map(item => {
      let name = '';
      
      if (period === 'daily') {
        name = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        name = `${item._id.year}-W${item._id.week}`;
      } else {
        name = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      }

      return {
        name,
        revenue: item.revenue / 100,
        transactions: item.transactionCount,
        averageOrderValue: item.averageOrderValue / 100
      };
    });
  };

  if (loading && !dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-600 mb-4">Start creating pages and collecting payments to see analytics.</p>
          <Button onClick={() => navigate('/create-page')}>
            Create Your First Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analytics
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
            <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={filters.days.toString()}
              onValueChange={(value) => setFilters(prev => ({ ...prev, days: parseInt(value) }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData.summary.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold">{dashboardData.summary.totalTransactions}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submissions</p>
                  <p className="text-2xl font-bold">{dashboardData.summary.totalSubmissions}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pages</p>
                  <p className="text-2xl font-bold">{dashboardData.summary.totalPages}</p>
                </div>
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardData.summary.overallConversionRate.toFixed(1)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {formatCurrency(dashboardData.summary.averageOrderValue)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different analytics views */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Revenue Trend (Last 12 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={formatMonthlyData(dashboardData.monthlyRevenue)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value * 100), 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue by Page */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Revenue by Page
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.revenueByPage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {dashboardData.revenueByPage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Payment Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Completed Payments</p>
                      <p className="text-2xl font-bold text-green-900">
                        {dashboardData.paymentStats.completed.count}
                      </p>
                      <p className="text-sm text-green-700">
                        {formatCurrency(dashboardData.paymentStats.completed.totalAmount)}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Pending Payments</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {dashboardData.paymentStats.pending.count}
                      </p>
                      <p className="text-sm text-yellow-700">
                        {formatCurrency(dashboardData.paymentStats.pending.totalAmount)}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">Failed Payments</p>
                      <p className="text-2xl font-bold text-red-900">
                        {dashboardData.paymentStats.failed.count}
                      </p>
                      <p className="text-sm text-red-700">
                        {formatCurrency(dashboardData.paymentStats.failed.totalAmount)}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="flex items-center gap-4">
              <Select
                value={filters.revenuePeriod}
                onValueChange={(value) => setFilters(prev => ({ ...prev, revenuePeriod: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.revenueDays.toString()}
                onValueChange={(value) => setFilters(prev => ({ ...prev, revenueDays: parseInt(value) }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {revenueData && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analysis - {filters.revenuePeriod}</CardTitle>
                  <CardDescription>
                    Total: {formatCurrency(revenueData.totalRevenue)} • {revenueData.totalTransactions} transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={formatRevenueChartData(revenueData.revenueData, filters.revenuePeriod)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value * 100) : value,
                          name === 'revenue' ? 'Revenue' : name === 'transactions' ? 'Transactions' : 'Avg Order Value'
                        ]} 
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="transactions" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Pages (Revenue)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.topPerformingPages.map((page, index) => (
                      <div key={page._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{page.pageTitle}</p>
                            <p className="text-sm text-gray-600">/{page.pageSlug}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(page.revenue)}</p>
                          <p className="text-sm text-gray-600">{page.transactionCount} transactions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rates by Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.conversionRates.map((page, index) => (
                      <div key={page._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{page.pageTitle}</p>
                          <p className="text-sm text-gray-600">
                            {page.completedSubmissions} / {page.totalSubmissions} submissions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{page.conversionRate.toFixed(1)}%</p>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(page.conversionRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.recentPayments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell>{payment.customerEmail || 'N/A'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.pageId.title}</p>
                            <p className="text-sm text-gray-600">{payment.pageId.productName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest form submissions from all pages</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Customer Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.recentSubmissions.map((submission) => (
                      <TableRow key={submission._id}>
                        <TableCell>{formatDate(submission.createdAt)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{submission.pageId.title}</p>
                            <p className="text-sm text-gray-600">{submission.pageId.productName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {submission.formData['Full Name'] || submission.formData['Name'] || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {submission.formData['Email Address'] || submission.formData['Email'] || 'N/A'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.paymentStatus)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/submissions/manage')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsManagement;
