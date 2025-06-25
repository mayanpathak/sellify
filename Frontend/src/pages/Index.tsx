
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import WorkflowSlider from '@/components/WorkflowSlider';
import UseCasesSection from '@/components/UseCasesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import PricingSection from '@/components/PricingSection';
import IntegrationsSection from '@/components/IntegrationsSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <motion.div 
      className="min-h-screen bg-white font-inter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <WorkflowSlider />
      <UseCasesSection />
      <TestimonialsSection />
      <PricingSection />
      <IntegrationsSection />
      <FAQSection />
      <Footer />
    </motion.div>
  );
};

export default Index;
