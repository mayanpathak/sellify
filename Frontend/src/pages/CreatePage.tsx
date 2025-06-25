import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, AlertTriangle, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { pagesApi, stripeApi } from '@/lib/api';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import PlanUpgradePrompt from '@/components/PlanUpgradePrompt';

interface FormField {
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'checkbox';
  required: boolean;
}

const CreatePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    productName: '',
    description: '',
    price: '',
    currency: 'usd',
    layoutStyle: 'standard' as 'standard' | 'modern' | 'minimalist',
    successRedirectUrl: '',
    cancelRedirectUrl: '',
  });

  const [fields, setFields] = useState<FormField[]>([
    { label: 'Full Name', type: 'text', required: true },
    { label: 'Email Address', type: 'email', required: true },
  ]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canCreatePage, usage, limits, isTrialExpired } = usePlanLimits();

  const isStripeConnected = !!user?.stripeAccountId;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addField = () => {
    setFields([...fields, { label: '', type: 'text', required: false }]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.productName || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const pageData = {
        ...formData,
        price: parseFloat(formData.price),
        fields: fields.filter(field => field.label.trim() !== ''),
      };

      const response = await pagesApi.create(pageData);
      
      if (response.data?.page) {
        toast({
          title: "Success!",
          description: "Your checkout page has been created successfully",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeConnect = async () => {
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Page</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Plan Limit Warning */}
        {!canCreatePage && (
          <PlanUpgradePrompt
            feature="Page Limit Reached"
            description={`You've reached your plan limit of ${limits.maxPages} pages. Upgrade to create more checkout pages.`}
            variant="warning"
            className="mb-6"
          />
        )}

        {/* Trial Expiration Warning */}
        {isTrialExpired && (
          <PlanUpgradePrompt
            feature="Trial Expired"
            description="Your trial has expired. Upgrade now to continue creating and managing checkout pages."
            variant="warning"
            className="mb-6"
          />
        )}

        {!isStripeConnected && (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Preview Mode</strong>
                  <p className="text-sm mt-1">
                    You can create and preview your checkout page, but you'll need to connect Stripe to accept payments from customers.
                  </p>
                </div>
                <Button 
                  onClick={handleStripeConnect}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-700 hover:bg-blue-100"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect Stripe
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Show form only if user can create pages */}
          {!canCreatePage ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Cannot Create New Page
                </h3>
                <p className="text-gray-500 mb-6">
                  You've reached your plan limit or your trial has expired. Please upgrade your plan to continue.
                </p>
                <Button onClick={() => navigate('/plans')}>
                  View Plans
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set up the basic details for your checkout page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Premium Course Checkout"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="e.g., Complete Web Development Course"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="29.99"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD (C$)</SelectItem>
                      <SelectItem value="aud">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Form Fields</CardTitle>
              <CardDescription>
                Customize the fields customers will fill out
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <Label>Field Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="e.g., Phone Number"
                    />
                  </div>
                  
                  <div className="w-40">
                    <Label>Field Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value: any) => updateField(index, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(index, { required: !!checked })}
                    />
                    <Label className="text-sm">Required</Label>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addField}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </CardContent>
          </Card>

          {/* Design & Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Design & Settings</CardTitle>
              <CardDescription>
                Customize the appearance and behavior of your page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="layoutStyle">Layout Style</Label>
                <Select value={formData.layoutStyle} onValueChange={(value: any) => handleSelectChange('layoutStyle', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="successRedirectUrl">Success Redirect URL</Label>
                  <Input
                    id="successRedirectUrl"
                    name="successRedirectUrl"
                    type="url"
                    value={formData.successRedirectUrl}
                    onChange={handleInputChange}
                    placeholder="https://yoursite.com/thank-you"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cancelRedirectUrl">Cancel Redirect URL</Label>
                  <Input
                    id="cancelRedirectUrl"
                    name="cancelRedirectUrl"
                    type="url"
                    value={formData.cancelRedirectUrl}
                    onChange={handleInputChange}
                    placeholder="https://yoursite.com/cancelled"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Page'
              )}
            </Button>
          </div>
          </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePage; 