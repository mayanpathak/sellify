import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, TrendingUp, Users, FileText, Calendar, Search, Eye } from 'lucide-react';
import { apiClient, CheckoutPage, Submission } from '../lib/api';
import { toast } from '../hooks/use-toast';

interface AnalyticsData {
  totalSubmissions: number;
  totalPages: number;
  submissionsThisMonth: number;
  submissionsThisWeek: number;
  topPerformingPages: Array<{
    pageId: string;
    title: string;
    slug: string;
    submissionCount: number;
  }>;
  submissionsByDate: Array<{
    date: string;
    count: number;
  }>;
  submissionsByPage: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pages, setPages] = useState<CheckoutPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [submissionsResponse, pagesResponse] = await Promise.all([
        apiClient.getUserSubmissions(),
        apiClient.getUserPages()
      ]);

      const allSubmissions = submissionsResponse.data?.submissions || [];
      const allPages = pagesResponse.data?.pages || [];

      setSubmissions(allSubmissions);
      setPages(allPages);

      // Process analytics data
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const submissionsThisMonth = allSubmissions.filter(
        sub => new Date(sub.createdAt) >= thirtyDaysAgo
      ).length;

      const submissionsThisWeek = allSubmissions.filter(
        sub => new Date(sub.createdAt) >= sevenDaysAgo
      ).length;

      // Group submissions by page
      const submissionsByPageId = allSubmissions.reduce((acc, sub) => {
        const pageId = typeof sub.pageId === 'string' ? sub.pageId : sub.pageId?._id;
        if (pageId) {
          acc[pageId] = (acc[pageId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topPerformingPages = allPages
        .map(page => ({
          pageId: page._id,
          title: page.title,
          slug: page.slug,
          submissionCount: submissionsByPageId[page._id] || 0
        }))
        .sort((a, b) => b.submissionCount - a.submissionCount)
        .slice(0, 5);

      // Group submissions by date (last 30 days)
      const submissionsByDate = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const count = allSubmissions.filter(sub => 
          sub.createdAt.startsWith(dateStr)
        ).length;
        submissionsByDate.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count
        });
      }

      // Pie chart data
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
      const submissionsByPage = topPerformingPages.map((page, index) => ({
        name: page.title,
        value: page.submissionCount,
        color: colors[index % colors.length]
      }));

      setAnalyticsData({
        totalSubmissions: allSubmissions.length,
        totalPages: allPages.length,
        submissionsThisMonth,
        submissionsThisWeek,
        topPerformingPages,
        submissionsByDate,
        submissionsByPage
      });
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

  const exportSubmissions = () => {
    const filteredSubmissions = getFilteredSubmissions();
    const csvContent = [
      ['Date', 'Page', 'Submission Data'],
      ...filteredSubmissions.map(sub => [
        new Date(sub.createdAt).toLocaleDateString(),
        typeof sub.pageId === 'string' ? 'Unknown' : sub.pageId?.title || 'Unknown',
        JSON.stringify(sub.formData)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredSubmissions = () => {
    return submissions.filter(sub => {
      const matchesSearch = searchTerm === '' || 
        JSON.stringify(sub.formData).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof sub.pageId !== 'string' && sub.pageId?.title?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPage = selectedPage === 'all' || 
        (typeof sub.pageId === 'string' ? sub.pageId === selectedPage : sub.pageId?._id === selectedPage);

      return matchesSearch && matchesPage;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track your form submissions and performance</p>
          </div>
          <Button onClick={exportSubmissions} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalSubmissions || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.submissionsThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.submissionsThisWeek || 0}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Pages</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalPages || 0}</div>
              <p className="text-xs text-muted-foreground">Total pages</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="pages">Page Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submissions Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData?.submissionsByDate || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submissions by Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.submissionsByPage || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData?.submissionsByPage?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Pages</CardTitle>
                <CardDescription>Pages with the most submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.topPerformingPages?.map((page, index) => (
                    <div key={page.pageId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{page.title}</p>
                          <p className="text-sm text-muted-foreground">/{page.slug}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{page.submissionCount}</p>
                        <p className="text-sm text-muted-foreground">submissions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Submissions</CardTitle>
                <CardDescription>View and filter all form submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages</SelectItem>
                      {pages.map(page => (
                        <SelectItem key={page._id} value={page._id}>
                          {page.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredSubmissions().slice(0, 50).map((submission) => (
                      <TableRow key={submission._id}>
                        <TableCell>
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {typeof submission.pageId === 'string' 
                            ? 'Unknown' 
                            : submission.pageId?.title || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {Object.entries(submission.formData).map(([key, value]) => (
                              <span key={key} className="text-sm">
                                {key}: {String(value)} 
                              </span>
                            )).slice(0, 2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Performance</CardTitle>
                <CardDescription>Detailed performance metrics for each page</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData?.topPerformingPages || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="submissionCount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics; 