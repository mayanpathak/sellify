
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does Sellify work?',
      answer: 'Sellify is a no-code platform that lets you create custom checkout pages in minutes. Simply choose a template, customize it with our drag-and-drop builder, connect your Stripe account, and start accepting payments. No technical skills required!'
    },
    {
      question: 'What are the transaction fees?',
      answer: 'Sellify charges 0% transaction fees! You only pay standard Stripe processing fees (2.9% + 30¢ per transaction). This means you keep more of your revenue compared to other platforms.'
    },
    {
      question: 'Can I use my own domain?',
      answer: 'Yes! With our Starter and Pro plans, you can use custom domains to match your brand. You can also embed checkout pages directly into your existing website.'
    },
    {
      question: 'How do I integrate with Stripe?',
      answer: 'Integration is simple - just connect your Stripe account in one click. Sellify handles all the complex payment processing, security, and compliance automatically.'
    },
    {
      question: 'Can I customize the checkout pages?',
      answer: 'Absolutely! You can customize colors, fonts, logos, form fields, and layout. Add your branding, product images, and create a checkout experience that matches your business.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 7-day free trial with full access to all features. No credit card required to start. You can build and test your checkout pages before committing to a paid plan.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently asked 
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {' '}questions
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Got questions? We've got answers. If you can't find what you're looking for, reach out to our support team.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <motion.button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                whileHover={{ backgroundColor: '#f9fafb' }}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
