
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Ben Friedmann',
      company: 'The New York Sun',
      quote: 'Game changer in our ability to rapidly test conversion funnels. We started selling subscriptions in 30 minutes.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      rating: 5
    },
    {
      name: 'Sarah Chen',
      company: 'Digital Marketing Pro',
      quote: 'Saved us 5-figures in development costs. The drag-and-drop builder is incredibly intuitive and powerful.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b193?w=100&h=100&fit=crop&crop=face',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      company: 'E-Learning Academy',
      quote: 'Our course sales increased by 40% after switching to Sellify. The checkout experience is seamless.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 5
    }
  ];

  return (
    <section id="case-studies" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Trusted by 
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {' '}thousands
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our customers are saying about their success with Sellify
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-indigo-50 to-sky-50 p-8 rounded-2xl border border-indigo-100"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
