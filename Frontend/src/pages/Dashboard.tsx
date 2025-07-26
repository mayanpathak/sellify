import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap, scrollAnimations } from '@/lib/gsapUtils';
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
  Link as LinkIcon,
  TrendingUp,
  DollarSign,
  Users,
  Activity
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

  // Refs for animations
  const dashboardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const pagesGridRef = useRef<HTMLDivElement>(null);

  const isStripeConnected = !!user?.stripeAccountId;

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    // Dashboard entrance animations
    const ctx = gsap.context(() => {
      // Header slide down
      gsap.fromTo(headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );

      // Welcome section fade in
      gsap.fromTo(welcomeRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "power2.out" }
      );

      // Stats cards stagger animation
      gsap.fromTo('.stat-card',
        { y: 30, opacity: 0, scale: 0.9 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.1, 
          delay: 0.4,
          ease: "back.out(1.7)" 
        }
      );

      // Page cards stagger animation
      gsap.fromTo('.page-card',
        { y: 40, opacity: 0, rotationX: 15 },
        { 
          y: 0, 
          opacity: 1, 
          rotationX: 0,
          duration: 0.6, 
          stagger: 0.08, 
          delay: 0.6,
          ease: "power2.out" 
        }
      );

      // Add floating animation to create button
      gsap.to('.create-button', {
        y: -5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    }, dashboardRef);

    return () => ctx.revert();
  }, [pages]);

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
    const pageCard = document.querySelector(`[data-page-id="${pageId}"]`);
    
    if (!confirm('Are you sure you want to delete this page?')) return;

    // Animate page deletion
    if (pageCard) {
      gsap.to(pageCard, {
        scale: 0,
        opacity: 0,
        rotationY: 90,
        duration: 0.5,
        ease: "power2.in",
        onComplete: async () => {
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
            // Restore the card if deletion failed
            gsap.to(pageCard, {
              scale: 1,
              opacity: 1,
              rotationY: 0,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        }
      });
    }
  };

  const copyPageUrl = (slug: string) => {
    const url = `${window.location.origin}/page/${slug}`;
    navigator.clipboard.writeText(url);
    
    // Success animation
    gsap.to('.copy-success', {
      scale: 1.2,
      opacity: 1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });

    toast({
      title: "Copied!",
      description: "Page URL copied to clipboard",
    });
  };

  const handleCardHover = (e: React.MouseEvent) => {
    const card = e.currentTarget;
    gsap.to(card, {
      y: -10,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleCardLeave = (e: React.MouseEvent) => {
    const card = e.currentTarget;
    gsap.to(card, {
      y: 0,
      scale: 1,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      duration: 0.3,
      ease: "power2.out"
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

  // Mock stats data - in real app, this would come from API
  const stats = [
    {
      title: "Total Revenue",
      value: "_",
      change: "",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Total Visitors",
      value: "_",
      change: "",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "+0.5%",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Active Pages",
      value: pages.length.toString(),
      change: `${pages.length} total`,
      icon: Activity,
      color: "from-orange-500 to-red-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="gsap-spinner mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Enhanced Header */}
      <header ref={headerRef} className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-black gradient-text">
                Sellify
              </h1>
              <Badge className={`${getPlanBadgeColor(user?.plan || 'free')} font-bold px-3 py-1`}>
                {user?.plan?.toUpperCase() || 'FREE'}
              </Badge>
              {isStripeConnected ? (
                <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50 font-semibold">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Stripe status : ``
                </Badge>
              ) : (
                <Badge variant="outline" className="border-blue-600 text-blue-700 bg-blue-50 font-semibold">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Preview Mode
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/analytics')}
                className="magnetic-button hover:bg-blue-50 hover:border-blue-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/submissions')}
                className="magnetic-button hover:bg-purple-50 hover:border-purple-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                Submissions
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/settings')}
                className="magnetic-button hover:bg-gray-50 hover:border-gray-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="magnetic-button hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Welcome Section */}
        <div ref={welcomeRef} className="mb-8">
          <h2 className="text-4xl font-black text-gray-900 mb-3">
            Welcome , <span className="gradient-text">{user?.name?.split(' ')[0]}!</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Manage your checkout pages and track your sales performance.
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title}
              className="stat-card relative overflow-hidden cursor-pointer group"
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardLeave}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plan Usage Warning */}
        {user?.plan === 'free' && pages.length >= 8 && (
          <Alert className="mb-6 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Approaching page limit</strong>
                  <p className="text-sm mt-1">
                    You're using {pages.length} of 10 pages. Upgrade to create more checkout pages.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/plans')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  Upgrade Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stripe Connection Alert */}
        {!isStripeConnected && (
          <Alert className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Connect your Stripe account</strong>
                  <p className="text-sm mt-1">
                    Connect Stripe to start accepting real payments on your checkout pages.
                  </p>
                </div>
                <Button 
                  onClick={handleStripeConnect} 
                  disabled={stripeConnecting}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  {stripeConnecting ? 'Connecting...' : 'Connect Stripe'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Pages Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Your Checkout Pages</h3>
            <p className="text-gray-600">
              {pages.length} of {getMaxPages(user?.plan || 'free')} pages created
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/create-page')}
            className="create-button bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
            disabled={user?.plan === 'free' && pages.length >= 10}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Page
          </Button>
        </div>

        {/* Enhanced Pages Grid */}
        <div ref={pagesGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card 
              key={page._id}
              data-page-id={page._id}
              className="page-card group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-indigo-200"
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardLeave}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {page.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 mt-1">
                      /{page.slug}
                    </CardDescription>
                  </div>
                                     <Badge 
                     variant="default"
                     className="bg-green-100 text-green-800"
                   >
                     Active
                   </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Price: ${page.price}</span>
                                     <span className="flex items-center">
                     <Eye className="w-4 h-4 mr-1" />
                     0 views
                   </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/create-page?edit=${page._id}`)}
                    className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyPageUrl(page.slug)}
                    className="copy-success hover:bg-green-50 hover:border-green-300"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                    className="hover:bg-purple-50 hover:border-purple-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeletePage(page._id)}
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {pages.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create your first checkout page
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by creating your first checkout page. It only takes a few minutes!
              </p>
              <Button 
                onClick={() => navigate('/create-page')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Page
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 