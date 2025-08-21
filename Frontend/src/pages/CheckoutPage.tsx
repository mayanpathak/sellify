import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, AlertTriangle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckoutPage as CheckoutPageType, pagesApi, submissionsApi, stripeApi, authApi, User } from '@/lib/api';

const CheckoutPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CheckoutPageType | null>(null);
  const [pageOwner, setPageOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const isStripeConnected = !!pageOwner?.stripeAccountId;

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await pagesApi.getBySlug(slug!);
      if (response.data?.page) {
        setPage(response.data.page);
        // Initialize form data
        const initialData: Record<string, any> = {};
        response.data.page.fields.forEach(field => {
          initialData[field.label] = field.type === 'checkbox' ? false : '';
        });
        setFormData(initialData);
        
        // Set page owner's Stripe connection status from API response
        setPageOwner({ 
          stripeAccountId: response.data.isStripeConnected ? 'connected' : undefined 
        } as User);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Page not found",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldLabel: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldLabel]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;

    // Validate required fields
    const missingFields = page.fields
      .filter(field => field.required && !formData[field.label])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Always submit form data first
      await submissionsApi.submit(slug!, formData);
      
      if (isStripeConnected) {
        // Create Stripe checkout session if connected (public - no auth required)
        const stripeResponse = await stripeApi.createPublicSession(page._id);
        
        if (stripeResponse.data?.url) {
          // Redirect to Stripe checkout
          window.location.href = stripeResponse.data.url;
        } else {
          throw new Error('Failed to create checkout session');
        }
      } else {
        // Show success message for form submission without payment
        toast({
          title: "Form Submitted!",
          description: "Your information has been submitted successfully. The page owner will be notified.",
        });
        
        // Reset form
        const initialData: Record<string, any> = {};
        page.fields.forEach(field => {
          initialData[field.label] = field.type === 'checkbox' ? false : '';
        });
        setFormData(initialData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process submission",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: any, index: number) => {
    const value = formData[field.label] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <div key={index}>
            <Label htmlFor={`field-${index}`}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={`field-${index}`}
              value={value}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`field-${index}`}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(field.label, checked)}
              required={field.required}
            />
            <Label htmlFor={`field-${index}`}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        );

      default:
        return (
          <div key={index}>
            <Label htmlFor={`field-${index}`}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`field-${index}`}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
            />
          </div>
        );
    }
  };

  const getLayoutStyles = (style: string) => {
    switch (style) {
      case 'modern':
        return 'bg-gradient-to-br from-indigo-50 to-sky-50';
      case 'minimalist':
        return 'bg-white';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-gray-600">The checkout page you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getLayoutStyles(page.layoutStyle)} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {page.title}
              </CardTitle>
              {page.description && (
                <CardDescription className="text-gray-600 mt-2">
                  {page.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>
              {/* Product Information */}
              <div className="bg-gradient-to-r from-indigo-50 to-sky-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {page.productName}
                    </h3>
                    <p className="text-gray-600">
                      Get instant access after purchase
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-600">
                      {page.currency.toUpperCase()} {page.price}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {page.fields.map((field, index) => renderField(field, index))}
                </div>

                {/* Stripe Connection Warning */}
                {!isStripeConnected && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Preview Mode</strong>
                      <p className="text-sm mt-1">
                        This is a preview of the checkout page. The page owner needs to connect their Stripe account to accept real payments.
                        You can still submit the form to test the functionality, but no actual payment will be processed.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3 text-lg ${
                      isStripeConnected 
                        ? 'bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white'
                        : 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {isStripeConnected ? 'Processing...' : 'Submitting...'}
                      </>
                    ) : isStripeConnected ? (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {`Complete Purchase - ${page.currency.toUpperCase()} ${page.price}`}
                      </>
                    ) : (
                      'Submit Form (Preview Mode)'
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  {isStripeConnected ? (
                    <>
                      <p>Secure checkout powered by Stripe</p>
                      <p className="mt-1">Your payment information is encrypted and secure</p>
                    </>
                  ) : (
                    <>
                      <p>Form submission for testing purposes</p>
                      <p className="mt-1">No payment will be processed in preview mode</p>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Money Back Guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Instant Access</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage; 