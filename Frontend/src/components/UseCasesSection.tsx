
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Calendar, 
  CreditCard, 
  Heart,
  ShoppingCart,
  Users,
  Zap,
  Trophy
} from 'lucide-react';

const UseCasesSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = [
    {
      id: 'digital-products',
      title: 'Digital Products',
      icon: Download,
      description: 'Sell courses, ebooks, software, and digital downloads',
      features: ['Instant delivery', 'License keys', 'Download protection', 'Customer portal'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'event-tickets',
      title: 'Event Tickets',
      icon: Calendar,
      description: 'Event registration and ticket sales made simple',
      features: ['QR code tickets', 'Attendee management', 'Check-in system', 'Email confirmations'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions',
      icon: CreditCard,
      description: 'Recurring billing for memberships and services',
      features: ['Monthly/Yearly plans', 'Trial periods', 'Dunning management', 'Usage tracking'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'donations',
      title: 'Donations & Services',
      icon: Heart,
      description: 'Accept donations and sell professional services',
      features: ['Custom amounts', 'Donor management', 'Tax receipts', 'Campaign tracking'],
      color: 'from-red-500 to-orange-500'
    }
  ];

  return (
    <section id="use-cases" className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Perfect for any 
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {' '}business model
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're selling digital products, event tickets, or subscriptions, Sellify has you covered
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-12 gap-4">
          {useCases.map((useCase, index) => {
            const IconComponent = useCase.icon;
            return (
              <motion.button
                key={useCase.id}
                onClick={() => setActiveTab(index)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === index
                    ? 'bg-white shadow-lg text-indigo-600'
                    : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-md'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-5 h-5" />
                <span>{useCase.title}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className={`w-16 h-16 bg-gradient-to-r ${useCases[activeTab].color} rounded-2xl flex items-center justify-center mb-6`}>
                {React.createElement(useCases[activeTab].icon, { className: "w-8 h-8 text-white" })}
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {useCases[activeTab].title}
              </h3>
              
              <p className="text-xl text-gray-600 mb-8">
                {useCases[activeTab].description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {useCases[activeTab].features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className={`w-2 h-2 bg-gradient-to-r ${useCases[activeTab].color} rounded-full`}></div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <motion.div
                className={`w-full h-80 bg-gradient-to-br ${useCases[activeTab].color} rounded-2xl flex items-center justify-center`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {React.createElement(useCases[activeTab].icon, { className: "w-24 h-24 text-white/30" })}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCasesSection;
