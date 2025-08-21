import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  Globe,
  Calendar,
  Plus,
  ExternalLink,
  Power,
  PowerOff,
  Settings,
  Activity
} from 'lucide-react';
import { pagesApi } from '../lib/api';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutPage {
  _id: string;
  title: string;
  slug: string;
  productName: string;
  description?: string;
  price: number;
  currency: string;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalSubmissions: number;
    completedSubmissions: number;
    pendingSubmissions: number;
    freeSubmissions: number;
    conversionRate: number;
  };
}

interface PageAnalytics {
  pageInfo: {
    id: string;
    title: string;
    slug: string;
    productName: string;
    price: number;
    currency: string;
    createdAt: string;
  };
  summary: {
    totalSubmissions: number;
    recentSubmissions: number;
    completedSubmissions: number;
    pendingSubmissions: number;
    freeSubmissions: number;
    conversionRate: number;
  };
  submissionsOverTime: Array<{
    _id: string;
    count: number;
  }>;
  topFormFields: Array<{
    fieldName: string;
    submissionCount: number;
    sampleValues: string[];
  }>;
}

const PageManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState<CheckoutPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPage, setSelectedPage] = useState<CheckoutPage | null>(null);
  const [selectedAnalytics, setSelectedAnalytics] = useState<PageAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await pagesApi.getUserPages(true);
      setPages(response.data.pages || []);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      toast({
        title: "Error",
        description: "Failed to load pages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPages();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Page data has been updated",
    });
  };

  const handleViewAnalytics = async (page: CheckoutPage) => {
    try {
      setActionLoading(`analytics-${page._id}`);
      const response = await pagesApi.getAnalytics(page._id, 30);
      setSelectedAnalytics(response.data as PageAnalytics);
      setSelectedPage(page);
      setShowAnalytics(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load page analytics",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (page: CheckoutPage) => {
    try {
      setActionLoading(`duplicate-${page._id}`);
      const response = await pagesApi.duplicate(page._id);
      toast({
        title: "Success",
        description: `Page "${page.title}" has been duplicated`,
      });
      await fetchPages(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to duplicate page",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (page: CheckoutPage) => {
    try {
      setActionLoading(`toggle-${page._id}`);
      const response = await pagesApi.toggleStatus(page._id);
      toast({
        title: "Success",
        description: (response.data as any)?.message || "Page status updated",
      });
      await fetchPages(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update page status",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (page: CheckoutPage) => {
    if (!window.confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(`delete-${page._id}`);
      await pagesApi.delete(page._id);
      toast({
        title: "Success",
        description: `Page "${page.title}" has been deleted`,
      });
      await fetchPages(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete page",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (page: CheckoutPage) => {
    const isActive = page.active !== false; // Default to true if not set
    return (
      <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600" : "bg-gray-500"}>
        {isActive ? (
          <>
            <Power className="w-3 h-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <PowerOff className="w-3 h-3 mr-1" />
            Inactive
          </>
        )}
      </Badge>
    );
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = !filters.search || 
      page.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      page.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
      page.slug.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && page.active !== false) ||
      (filters.status === 'inactive' && page.active === false);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aValue = a[filters.sortBy as keyof CheckoutPage] as any;
    const bValue = b[filters.sortBy as keyof CheckoutPage] as any;
    
    if (filters.sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });

  const getTotalStats = () => {
    const totalSubmissions = pages.reduce((sum, page) => sum + (page.stats?.totalSubmissions || 0), 0);
    const totalCompleted = pages.reduce((sum, page) => sum + (page.stats?.completedSubmissions || 0), 0);
    const totalRevenue = pages.reduce((sum, page) => {
      return sum + ((page.stats?.completedSubmissions || 0) * page.price);
    }, 0);
    const averageConversion = pages.length > 0 
      ? Math.round(pages.reduce((sum, page) => sum + (page.stats?.conversionRate || 0), 0) / pages.length)
      : 0;

    return { totalSubmissions, totalCompleted, totalRevenue, averageConversion };
  };

  const stats = getTotalStats();

  if (loading && !pages.length) {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Page Management</h1>
            <p className="text-muted-foreground">Manage your checkout pages and view detailed analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/create-page')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pages</p>
                  <p className="text-2xl font-bold">{pages.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Conversion</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageConversion}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search pages..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortBy">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortOrder">Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: 'asc' | 'desc') => setFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pages Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Pages</CardTitle>
                <CardDescription>
                  {filteredPages.length > 0 
                    ? `Showing ${filteredPages.length} of ${pages.length} pages`
                    : 'No pages found'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPages.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.map((page) => (
                      <TableRow key={page._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{page.title}</div>
                            <div className="text-sm text-gray-500">{page.productName}</div>
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              /{page.slug}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(page)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {page.price > 0 
                              ? formatCurrency(page.price, page.currency)
                              : 'Free'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          {page.stats ? (
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium">{page.stats.totalSubmissions}</span> submissions
                              </div>
                              <div className="text-sm text-green-600">
                                <span className="font-medium">{page.stats.completedSubmissions}</span> paid
                              </div>
                              <div className="text-xs text-purple-600">
                                {page.stats.conversionRate}% conversion
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(page.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                              title="View Page"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAnalytics(page)}
                              disabled={actionLoading === `analytics-${page._id}`}
                              title="View Analytics"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(page)}
                              disabled={actionLoading === `duplicate-${page._id}`}
                              title="Duplicate Page"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(page)}
                              disabled={actionLoading === `toggle-${page._id}`}
                              title={`${page.active !== false ? 'Deactivate' : 'Activate'} Page`}
                            >
                              {page.active !== false ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(page)}
                              disabled={actionLoading === `delete-${page._id}`}
                              title="Delete Page"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.status !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Create your first checkout page to get started.'
                  }
                </p>
                <Button
                  onClick={() => navigate('/create-page')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && selectedAnalytics && selectedPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Page Analytics - {selectedPage.title}
                  </CardTitle>
                  <CardDescription>
                    Detailed performance metrics for the last 30 days
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalytics(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Page Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Page Title</Label>
                  <p className="font-medium">{selectedAnalytics.pageInfo.title}</p>
                </div>
                <div>
                  <Label>Product</Label>
                  <p className="font-medium">{selectedAnalytics.pageInfo.productName}</p>
                </div>
                <div>
                  <Label>URL</Label>
                  <p className="font-medium text-blue-600">/{selectedAnalytics.pageInfo.slug}</p>
                </div>
                <div>
                  <Label>Price</Label>
                  <p className="font-medium">
                    {selectedAnalytics.pageInfo.price > 0 
                      ? formatCurrency(selectedAnalytics.pageInfo.price, selectedAnalytics.pageInfo.currency)
                      : 'Free'
                    }
                  </p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedAnalytics.summary.totalSubmissions}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedAnalytics.summary.completedSubmissions}</p>
                    <p className="text-sm text-gray-600">Paid</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedAnalytics.summary.freeSubmissions}</p>
                    <p className="text-sm text-gray-600">Free</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{selectedAnalytics.summary.pendingSubmissions}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedAnalytics.summary.conversionRate}%</p>
                    <p className="text-sm text-gray-600">Conversion</p>
                  </CardContent>
                </Card>
              </div>

              {/* Form Fields Analysis */}
              {selectedAnalytics.topFormFields.length > 0 && (
                <div>
                  <Label>Most Used Form Fields</Label>
                  <div className="mt-2 space-y-2">
                    {selectedAnalytics.topFormFields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{field.fieldName}</p>
                          <p className="text-sm text-gray-600">
                            Sample values: {field.sampleValues.join(', ')}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {field.submissionCount} submissions
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submissions Over Time */}
              {selectedAnalytics.submissionsOverTime.length > 0 && (
                <div>
                  <Label>Submissions Over Time (Last 30 Days)</Label>
                  <div className="mt-2 h-32 flex items-end gap-1">
                    {selectedAnalytics.submissionsOverTime.map((day, index) => {
                      const maxCount = Math.max(...selectedAnalytics.submissionsOverTime.map(d => d.count));
                      const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                      
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-blue-500 rounded-t min-h-[4px] opacity-80 hover:opacity-100 transition-opacity"
                          style={{ height: `${height}%` }}
                          title={`${day._id}: ${day.count} submissions`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PageManagement;
