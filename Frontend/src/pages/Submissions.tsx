import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Submission, submissionsApi } from '@/lib/api';

const Submissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await submissionsApi.getUserSubmissions();
      if (response.data?.submissions) {
        setSubmissions(response.data.submissions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportSubmissions = () => {
    if (submissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions to export",
        variant: "destructive",
      });
      return;
    }

    // Convert submissions to CSV
    const headers = ['Date', 'Page', 'Email', 'Data'];
    const csvData = submissions.map(submission => {
      const pageTitle = typeof submission.pageId === 'object' 
        ? submission.pageId.title 
        : 'Unknown Page';
      
      const email = submission.formData['Email Address'] || 
                   submission.formData['email'] || 
                   submission.formData['Email'] || 
                   'N/A';
      
      const dataString = Object.entries(submission.formData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');

      return [
        new Date(submission.createdAt).toLocaleDateString(),
        pageTitle,
        email,
        dataString
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Submissions exported successfully",
    });
  };

  const filteredSubmissions = submissions.filter(submission => {
    const searchLower = searchTerm.toLowerCase();
    const pageTitle = typeof submission.pageId === 'object' 
      ? submission.pageId.title.toLowerCase() 
      : '';
    
    const formDataString = Object.values(submission.formData)
      .join(' ')
      .toLowerCase();

    return pageTitle.includes(searchLower) || formDataString.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
            </div>
            
            <Button
              onClick={exportSubmissions}
              disabled={submissions.length === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => 
                  new Date(s.createdAt).getMonth() === new Date().getMonth()
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => 
                  new Date(s.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Submissions Table */}
        {filteredSubmissions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-500">
                Submissions will appear here when customers fill out your forms
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                All form submissions from your checkout pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Customer Info</TableHead>
                      <TableHead>Form Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission._id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(submission.createdAt).toLocaleDateString()}
                            <div className="text-xs text-gray-500">
                              {new Date(submission.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeof submission.pageId === 'object' 
                              ? submission.pageId.title 
                              : 'Unknown Page'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {submission.formData['Full Name'] || 
                               submission.formData['Name'] || 
                               'N/A'}
                            </div>
                            <div className="text-gray-500">
                              {submission.formData['Email Address'] || 
                               submission.formData['email'] || 
                               submission.formData['Email'] || 
                               'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <details className="cursor-pointer">
                              <summary className="text-sm text-indigo-600 hover:text-indigo-700">
                                View Details
                              </summary>
                              <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                                {Object.entries(submission.formData).map(([key, value]) => (
                                  <div key={key} className="mb-1">
                                    <strong>{key}:</strong> {String(value)}
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Submissions; 