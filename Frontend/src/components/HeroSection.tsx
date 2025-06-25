import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    navigate('/signup');
  };

  const handleLiveDemo = () => {
    const useCasesSection = document.getElementById('use-cases');
    if (useCasesSection) {
      useCasesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-indigo-300 to-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-sky-300 to-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <motion.h1 
            className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Custom checkout pages 
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {' '}that convert
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Accept payments with 0% transaction fees on any website, powered by Stripe — without needing to code
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={handleStartTrial}
              className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start 7-Day Free Trial
            </motion.button>
            <motion.button
              onClick={handleLiveDemo}
              className="border-2 border-indigo-200 text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              See a Live Demo
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="bg-gradient-to-br from-indigo-500 to-sky-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Checkout Page</h3>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="h-4 bg-white/40 rounded mb-2"></div>
                  <div className="h-3 bg-white/30 rounded w-3/4"></div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="h-4 bg-white/40 rounded mb-2"></div>
                  <div className="h-3 bg-white/30 rounded w-1/2"></div>
                </div>
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg p-3 text-center font-semibold">
                  Complete Payment
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
