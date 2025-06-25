import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Copy,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  User,
  AlertTriangle,
  CheckCircle,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutPage, pagesApi, stripeApi } from '@/lib/api';

const Dashboard = () => {
  const [pages, setPages] = useState<CheckoutPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeConnecting, setStripeConnecting] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isStripeConnected = !!user?.stripeAccountId;

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await pagesApi.getUserPages();
      if (response.data?.pages) {
        setPages(response.data.pages);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStripeConnect = async () => {
    setStripeConnecting(true);
    try {
      const response = await stripeApi.connectAccount();
      if (response.data?.onboardingUrl) {
        // Redirect to Stripe Connect onboarding
        window.location.href = response.data.onboardingUrl;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Stripe account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setStripeConnecting(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await pagesApi.delete(pageId);
      setPages(pages.filter(page => page._id !== pageId));
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      });
    }
  };

  const copyPageUrl = (slug: string) => {
    const url = `${window.location.origin}/page/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Page URL copied to clipboard",
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'builder': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaxPages = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Unlimited';
      case 'builder': return '25';
      default: return '10';
    }
  };

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Sellify
              </h1>
              <Badge className={getPlanBadgeColor(user?.plan || 'free')}>
                {user?.plan?.toUpperCase() || 'FREE'}
              </Badge>
              {isStripeConnected ? (
                <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Stripe Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="border-blue-600 text-blue-700 bg-blue-50">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Preview Mode
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/submissions')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Submissions
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Manage your checkout pages and track your sales performance.
          </p>
        </div>

        {/* Stripe Connection Status */}
        {!isStripeConnected && (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Connect Stripe to accept payments</strong>
                  <p className="text-sm mt-1">
                    You can create and preview checkout pages, but you'll need to connect Stripe to accept payments from customers.
                  </p>
                </div>
                <Button 
                  onClick={handleStripeConnect}
                  disabled={stripeConnecting}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {stripeConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Connect Stripe
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isStripeConnected && (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Stripe account connected!</strong>
                  <p className="text-sm mt-1">
                    You can now create checkout pages and receive payments.
                  </p>
                </div>
                <Badge variant="outline" className="border-green-600 text-green-700">
                  Connected
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pages.length}</div>
              <p className="text-xs text-muted-foreground">
                of {getMaxPages(user?.plan || 'free')} allowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                7.2% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,345</div>
              <p className="text-xs text-muted-foreground">
                +15.3% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pages Section */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Your Pages</h3>
          <Button
            onClick={() => navigate('/create-page')}
            className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Page
          </Button>
        </div>

        {/* Pages Grid */}
        {pages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pages yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first checkout page to start selling
              </p>
              <Button
                onClick={() => navigate('/create-page')}
                className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <motion.div
                key={page._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {page.productName} • ${page.price}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {page.layoutStyle}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <p className="truncate">/{page.slug}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created {new Date(page.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/edit-page/${page._id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyPageUrl(page.slug)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePage(page._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 