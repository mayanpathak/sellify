import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: string[] = [];
    
    // Name validation
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (fullName.length < 2 || fullName.length > 50) {
      errors.push('Name must be between 2 and 50 characters');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Please provide a valid email address');
    }
    
    // Password validation
    if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(formData.password)) {
      errors.push('Password must contain at least one number');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms || isLoading) return;
    
    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors[0],
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const success = await register(fullName, formData.email, formData.password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Don't show additional toast here as AuthContext already handles it
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your 7-day free trial and build your first checkout page"
    >
      <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
        <p className="text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors underline decoration-2 underline-offset-2"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="mt-1"
              placeholder="First name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="mt-1"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              required
              className="pr-10"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="mt-1">
            <p className="text-sm text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className={`text-xs ${formData.password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                  ✓ At least 8 characters
                </div>
                <div className={`text-xs ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                  ✓ One lowercase letter
                </div>
                <div className={`text-xs ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                  ✓ One uppercase letter
                </div>
                <div className={`text-xs ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-red-500'}`}>
                  ✓ One number
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))
            }
            className="mt-1"
          />
          <Label htmlFor="agreeToTerms" className="text-sm leading-5">
            I agree to the{' '}
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700">
              Privacy Policy
            </Link>
          </Label>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={!formData.agreeToTerms || isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Start free trial'
            )}
          </Button>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
          <Button variant="outline" className="w-full">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
