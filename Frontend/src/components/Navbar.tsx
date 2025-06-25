
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Features', 'Use Cases', 'Case Studies', 'Pricing'];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.toLowerCase().replace(' ', '-'));
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            <a href="/">Sellify</a>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {item}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <motion.a
              href="/signin"
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              Sign in
            </motion.a>
            <motion.a
              href="/signup"
              className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
