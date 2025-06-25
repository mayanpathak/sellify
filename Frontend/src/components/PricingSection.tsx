
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Free Trial',
      price: { monthly: 0, yearly: 0 },
      description: '7-day free trial with full access',
      features: [
        'Unlimited checkout pages',
        'Basic customization',
        'Stripe integration',
        'Email support',
        'Basic analytics'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Starter',
      price: { monthly: 29, yearly: 24 },
      description: 'Perfect for small businesses',
      features: [
        'Everything in Free Trial',
        'Custom branding',
        'Advanced analytics',
        'Order bumps & upsells',
        'Priority support',
        'No Sellify branding'
      ],
      cta: 'Get Started',
      popular: true
    },
    {
      name: 'Pro',
      price: { monthly: 79, yearly: 65 },
      description: 'For growing businesses',
      features: [
        'Everything in Starter',
        'Advanced integrations',
        'A/B testing',
        'Custom domains',
        'API access',
        'White-label solution'
      ],
      cta: 'Go Pro',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-indigo-50 to-sky-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, 
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {' '}transparent pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, then choose the plan that scales with your business
          </p>
        </motion.div>

        <div className="flex items-center justify-center mb-12">
          <span className={`mr-3 ${!isYearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
            Monthly
          </span>
          <motion.button
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isYearly ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
            onClick={() => setIsYearly(!isYearly)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ x: isYearly ? 30 : 2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </motion.button>
          <span className={`ml-3 ${isYearly ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="ml-2 bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
              Save 20%
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white rounded-2xl p-8 shadow-xl border-2 relative ${
                plan.popular 
                  ? 'border-indigo-500 scale-105' 
                  : 'border-gray-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{plan.price.monthly === 0 ? 'trial' : 'month'}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
