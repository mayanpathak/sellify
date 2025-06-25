
import React from 'react';
import { motion } from 'framer-motion';
import { 
  MousePointer2, 
  BarChart3, 
  Palette, 
  TrendingUp, 
  Globe, 
  Code 
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: MousePointer2,
      title: 'Point & Click Page Builder',
      description: 'Create beautiful checkout pages with our intuitive drag-and-drop builder'
    },
    {
      icon: BarChart3,
      title: 'Track Sales & Analytics',
      description: 'Monitor your performance with detailed analytics and conversion tracking'
    },
    {
      icon: Palette,
      title: 'Custom Fields & Branding',
      description: 'Match your brand with custom colors, logos, and form fields'
    },
    {
      icon: TrendingUp,
      title: 'Order Bumps & Upsells',
      description: 'Increase revenue with smart upsells and order bump features'
    },
    {
      icon: Globe,
      title: 'Hosted or Embedded Pages',
      description: 'Host on our platform or embed directly into your existing website'
    },
    {
      icon: Code,
      title: 'No Code Needed',
      description: 'Build professional checkout pages without writing a single line of code'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to 
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {' '}sell online
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to maximize your conversions and streamline your sales process
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              className="bg-gradient-to-br from-indigo-50 to-sky-50 p-8 rounded-2xl border border-indigo-100 hover:border-indigo-200 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-sky-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
