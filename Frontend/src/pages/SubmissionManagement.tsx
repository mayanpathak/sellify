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
  Download, 
  Eye,
  Calendar,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { submissionsApi } from '../lib/api';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface Submission {
  _id: string;
  formData: Record<string, any>;
  createdAt: string;
  paymentStatus: 'none' | 'pending' | 'completed' | 'failed';
  pageId: {
    _id: string;
    title: string;
    slug: string;
    productName: string;
    price?: number;
    currency?: string;
  };
  paymentId?: {
    _id: string;
    amount: number;
    currency: string;
    status: string;
    customerEmail?: string;
    customerName?: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

interface SubmissionStats {
  totalSubmissions: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  freeSubmissions: number;
  conversionRate: number;
  submissionsByPage: Array<{
    _id: string;
    pageTitle: string;
    pageSlug: string;
    count: number;
    completed: number;
    pending: number;
  }>;
  submissionsOverTime: Array<{
    _id: string;
    count: number;
  }>;
}

interface PageInfo {
  _id: string;
  title: string;
  slug: string;
  productName: string;
}

const SubmissionManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    pageId: '',
    paymentStatus: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    limit: 20
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });

  useEffect(() => {
    fetchSubmissionData();
  }, [filters]);

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      const [submissionsResponse, statsResponse] = await Promise.allSettled([
        submissionsApi.getUserSubmissionsWithFilters(filters),
        submissionsApi.getSubmissionStats(30)
      ]);

      if (submissionsResponse.status === 'fulfilled') {
        setSubmissions(submissionsResponse.value.data.submissions || []);
        setPages(submissionsResponse.value.data.pages || []);
        if (submissionsResponse.value.pagination) {
          setPagination(submissionsResponse.value.pagination);
        }
      }

      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.data);
      }
    } catch (error) {
      console.error('Failed to fetch submission data:', error);
      toast({
        title: "Error",
        description: "Failed to load submission information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubmissionData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Submission data has been updated",
    });
  };

  const handleViewDetails = async (submission: Submission) => {
    try {
      const response = await submissionsApi.getSubmissionDetails(submission._id);
      setSelectedSubmission(response.data.submission);
      setShowSubmissionDetails(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submission details",
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await submissionsApi.exportSubmissions({
        pageId: filters.pageId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        format: 'csv'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: "Submissions have been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export submissions",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-600 text-white', icon: CheckCircle, text: 'Paid' },
      pending: { color: 'bg-yellow-600 text-white', icon: Clock, text: 'Pending' },
      none: { color: 'bg-blue-600 text-white', icon: FileText, text: 'Free' },
      failed: { color: 'bg-red-600 text-white', icon: CheckCircle, text: 'Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.none;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) return null;
    return filters.sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />;
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

  const getCustomerInfo = (submission: Submission) => {
    const name = submission.paymentId?.customerName || 
                 submission.formData['Full Name'] || 
                 submission.formData['Name'] || 
                 'N/A';
    const email = submission.paymentId?.customerEmail || 
                  submission.formData['Email Address'] || 
                  submission.formData['Email'] || 
                  submission.formData['email'] || 
                  'N/A';
    return { name, email };
  };

  if (loading && !submissions.length) {
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
            onClick={() => navigate('/submissions')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Submissions
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Submission Management</h1>
            <p className="text-muted-foreground">Advanced submission analytics and management</p>
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
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className={`h-4 w-4 mr-2 ${exporting ? 'animate-spin' : ''}`} />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paid Submissions</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedSubmissions}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Free Submissions</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.freeSubmissions}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pageId">Page</Label>
                <Select
                  value={filters.pageId}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, pageId: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All pages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All pages</SelectItem>
                    {pages.map((page) => (
                      <SelectItem key={page._id} value={page._id}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={filters.paymentStatus}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="completed">Paid</SelectItem>
                    <SelectItem value="none">Free</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Date Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                  />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  pageId: '',
                  paymentStatus: 'all',
                  startDate: '',
                  endDate: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                  page: 1,
                  limit: 20
                })}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>
                  {pagination.totalCount > 0 
                    ? `Showing ${((pagination.currentPage - 1) * pagination.limit) + 1} to ${Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of ${pagination.totalCount} submissions`
                    : 'No submissions found'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {submissions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center gap-2">
                            Date
                            {getSortIcon('createdAt')}
                          </div>
                        </TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Form Data</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => {
                        const customerInfo = getCustomerInfo(submission);
                        return (
                          <TableRow key={submission._id}>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(submission.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {submission.pageId.title}
                                </Badge>
                                <p className="text-xs text-gray-500">
                                  {submission.pageId.productName}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{customerInfo.name}</div>
                                <div className="text-gray-500">{customerInfo.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(submission.paymentStatus)}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <details className="cursor-pointer">
                                  <summary className="text-sm text-indigo-600 hover:text-indigo-700">
                                    View Data ({Object.keys(submission.formData).length} fields)
                                  </summary>
                                  <div className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                                    {Object.entries(submission.formData).map(([key, value]) => (
                                      <div key={key} className="mb-1">
                                        <strong>{key}:</strong> {String(value)}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(submission)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!pagination.hasNextPage}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.pageId || filters.paymentStatus !== 'all' || filters.startDate || filters.endDate
                    ? 'Try adjusting your filters to see more results.'
                    : 'Submissions will appear here when customers fill out your checkout pages.'
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  View Checkout Pages
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Page Performance */}
        {stats && stats.submissionsByPage.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
              <CardDescription>Submission statistics by checkout page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.submissionsByPage.map((pageStat) => (
                  <div key={pageStat._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{pageStat.pageTitle}</h4>
                      <p className="text-sm text-gray-600">/{pageStat.pageSlug}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{pageStat.count}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{pageStat.completed}</p>
                        <p className="text-xs text-gray-600">Paid</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{pageStat.pending}</p>
                        <p className="text-xs text-gray-600">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {pageStat.count > 0 ? Math.round((pageStat.completed / pageStat.count) * 100) : 0}%
                        </p>
                        <p className="text-xs text-gray-600">Conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submission Details Modal */}
      {showSubmissionDetails && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Submission Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubmissionDetails(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Submission Date</Label>
                  <p className="font-medium">{formatDate(selectedSubmission.createdAt)}</p>
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSubmission.paymentStatus)}</div>
                </div>
              </div>

              {/* Page Info */}
              <div>
                <Label>Checkout Page</Label>
                <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="font-medium">{selectedSubmission.pageId.title}</p>
                  <p className="text-sm text-blue-600">{selectedSubmission.pageId.productName}</p>
                  <p className="text-xs text-gray-500">/{selectedSubmission.pageId.slug}</p>
                </div>
              </div>

              {/* Payment Info */}
              {selectedSubmission.paymentId && (
                <div>
                  <Label>Payment Details</Label>
                  <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-medium">
                      ${(selectedSubmission.paymentId.amount / 100).toFixed(2)} {selectedSubmission.paymentId.currency.toUpperCase()}
                    </p>
                    <p className="text-sm text-green-600">Status: {selectedSubmission.paymentId.status}</p>
                    {selectedSubmission.paymentId.customerEmail && (
                      <p className="text-sm">Customer: {selectedSubmission.paymentId.customerEmail}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Form Data */}
              <div>
                <Label>Form Data</Label>
                <div className="mt-2 space-y-2">
                  {Object.entries(selectedSubmission.formData).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-4 p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-700 min-w-0 flex-shrink-0 w-1/3">
                        {key}:
                      </div>
                      <div className="flex-1 break-words">
                        {String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <Label>Technical Information</Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700">IP Address</p>
                    <p className="text-sm text-gray-600">{selectedSubmission.ipAddress || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700">User Agent</p>
                    <p className="text-sm text-gray-600 truncate" title={selectedSubmission.userAgent}>
                      {selectedSubmission.userAgent || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubmissionManagement;
