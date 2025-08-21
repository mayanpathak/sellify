import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Webhook, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ArrowLeft,
  RefreshCw,
  Filter,
  Eye,
  Calendar,
  TrendingUp,
  Zap,
  Code,
  ExternalLink,
  Search
} from 'lucide-react';
import { webhookApi } from '../lib/api';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface WebhookEvent {
  _id: string;
  stripeEventId: string;
  eventType: string;
  status: 'received' | 'processing' | 'completed' | 'failed' | 'retrying';
  processedAt?: string;
  processingError?: string;
  createdAt: string;
  pageId?: {
    _id: string;
    title: string;
    slug: string;
    productName: string;
  };
  paymentId?: {
    _id: string;
    amount: number;
    currency: string;
    status: string;
    customerEmail?: string;
  };
}

interface WebhookStats {
  totalEvents: number;
  completedEvents: number;
  failedEvents: number;
  successRate: number;
  eventTypeStats: Array<{
    _id: string;
    count: number;
    completed: number;
    failed: number;
  }>;
}

const WebhookManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [filters, setFilters] = useState({
    eventType: '',
    status: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchWebhookData();
  }, [filters]);

  const fetchWebhookData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, statsResponse] = await Promise.allSettled([
        webhookApi.getEvents(filters),
        webhookApi.getStats(30)
      ]);

      if (eventsResponse.status === 'fulfilled') {
        setEvents(eventsResponse.value.data.docs || []);
      }

      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.data);
      }
    } catch (error) {
      console.error('Failed to fetch webhook data:', error);
      toast({
        title: "Error",
        description: "Failed to load webhook information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWebhookData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Webhook data has been updated",
    });
  };

  const handleViewDetails = async (event: WebhookEvent) => {
    try {
      const response = await webhookApi.getEventDetails(event._id);
      setSelectedEvent(response.data.event);
      setShowEventDetails(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-600 text-white', icon: CheckCircle },
      failed: { color: 'bg-red-600 text-white', icon: XCircle },
      processing: { color: 'bg-blue-600 text-white', icon: Clock },
      retrying: { color: 'bg-yellow-600 text-white', icon: RefreshCw },
      received: { color: 'bg-gray-600 text-white', icon: Activity }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.received;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'checkout.session.completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'payment_intent.succeeded':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'payment_intent.payment_failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'account.updated':
        return <Activity className="w-4 h-4 text-purple-600" />;
      default:
        return <Webhook className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  if (loading && !events.length) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-3">
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
            onClick={() => navigate('/stripe/manage')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stripe Management
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webhook Management</h1>
            <p className="text-muted-foreground">Monitor and manage Stripe webhook events</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold">{stats.totalEvents}</p>
                  </div>
                  <Webhook className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedEvents}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failedEvents}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
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
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={filters.eventType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All event types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All event types</SelectItem>
                    <SelectItem value="checkout.session.completed">Checkout Completed</SelectItem>
                    <SelectItem value="payment_intent.succeeded">Payment Succeeded</SelectItem>
                    <SelectItem value="payment_intent.payment_failed">Payment Failed</SelectItem>
                    <SelectItem value="account.updated">Account Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="retrying">Retrying</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ eventType: '', status: '', page: 1, limit: 20 })}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Webhook Events
            </CardTitle>
            <CardDescription>
              {events.length > 0 ? `Showing ${events.length} events` : 'No events found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getEventTypeIcon(event.eventType)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{formatEventType(event.eventType)}</p>
                          {getStatusBadge(event.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                        {event.pageId && (
                          <p className="text-xs text-blue-600">
                            Page: {event.pageId.title}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {event.status === 'failed' && (
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(event)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No webhook events yet</h3>
                <p className="text-gray-600 mb-4">
                  Webhook events will appear here when customers interact with your checkout pages.
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

        {/* Event Type Statistics */}
        {stats && stats.eventTypeStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Event Type Breakdown</CardTitle>
              <CardDescription>Distribution of webhook events by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.eventTypeStats.map((eventStat) => (
                  <div key={eventStat._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(eventStat._id)}
                      <span className="font-medium">{formatEventType(eventStat._id)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {eventStat.count} total
                      </span>
                      <Badge variant="outline" className="text-green-600">
                        {eventStat.completed} success
                      </Badge>
                      {eventStat.failed > 0 && (
                        <Badge variant="outline" className="text-red-600">
                          {eventStat.failed} failed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription>How to set up webhooks in your Stripe dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Webhook Endpoint:</strong> Your webhook URL is configured to receive events at{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {window.location.origin}/api/webhooks/stripe
                </code>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Stripe Webhook Dashboard
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://stripe.com/docs/webhooks" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Webhook Documentation
                </a>
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Required Events:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>checkout.session.completed</li>
                <li>payment_intent.succeeded</li>
                <li>payment_intent.payment_failed</li>
                <li>account.updated</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Event Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEventDetails(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Type</Label>
                  <p className="font-medium">{formatEventType(selectedEvent.eventType)}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedEvent.status)}</div>
                </div>
                <div>
                  <Label>Event ID</Label>
                  <p className="font-mono text-sm">{selectedEvent.stripeEventId}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p>{new Date(selectedEvent.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedEvent.processingError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Processing Error:</strong> {selectedEvent.processingError}
                  </AlertDescription>
                </Alert>
              )}

              {selectedEvent.pageId && (
                <div>
                  <Label>Related Page</Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-medium">{selectedEvent.pageId.title}</p>
                    <p className="text-sm text-blue-600">{selectedEvent.pageId.productName}</p>
                  </div>
                </div>
              )}

              {selectedEvent.paymentId && (
                <div>
                  <Label>Payment Details</Label>
                  <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-medium">
                      ${(selectedEvent.paymentId.amount / 100).toFixed(2)} {selectedEvent.paymentId.currency.toUpperCase()}
                    </p>
                    <p className="text-sm text-green-600">
                      Status: {selectedEvent.paymentId.status}
                    </p>
                    {selectedEvent.paymentId.customerEmail && (
                      <p className="text-sm">Customer: {selectedEvent.paymentId.customerEmail}</p>
                    )}
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

export default WebhookManagement;
