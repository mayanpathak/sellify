
import React from 'react';
import { motion } from 'framer-motion';

const IntegrationsSection = () => {
  const integrations = [
    { name: 'Stripe', logo: '💳', color: 'from-blue-500 to-purple-600' },
    { name: 'Zapier', logo: '⚡', color: 'from-orange-500 to-red-500' },
    { name: 'Google Sheets', logo: '📊', color: 'from-green-500 to-emerald-500' },
    { name: 'Webhooks', logo: '🔗', color: 'from-gray-600 to-gray-800' },
    { name: 'Meta Pixel', logo: '📱', color: 'from-blue-600 to-indigo-600' },
    { name: 'WordPress', logo: '📝', color: 'from-indigo-500 to-purple-500' },
    { name: 'Webflow', logo: '🌊', color: 'from-cyan-500 to-blue-500' },
    { name: 'Framer', logo: '🎨', color: 'from-pink-500 to-rose-500' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Integrates with your 
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {' '}favorite tools
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect Sellify with the tools you already use to automate your workflow and boost productivity
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
              }}
              className="bg-gradient-to-br from-gray-50 to-indigo-50 p-6 rounded-2xl border border-gray-100 text-center group cursor-pointer"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${integration.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-2xl`}>
                {integration.logo}
              </div>
              <h3 className="font-semibold text-gray-900">
                {integration.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
