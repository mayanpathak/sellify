
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            
            <motion.div 
              className="font-bold text-3xl bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent mb-4"
              whileHover={{ scale: 1.02 }}
            >
              Sellify
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>

      {/* Right side - Image/Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-indigo-600 to-sky-500 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center text-white z-10"
        >
          <div className="mb-8">
            <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <div className="w-16 h-16 bg-white/30 rounded-2xl"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Start selling in minutes</h2>
          <p className="text-xl text-white/80 max-w-md">
            Create beautiful checkout pages without any coding knowledge required
          </p>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-2xl"
        />
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-32 right-32 w-12 h-12 bg-white/10 rounded-xl"
        />
        <motion.div
          animate={{ y: [-5, 15, -5] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/2 right-16 w-8 h-8 bg-white/10 rounded-lg"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
