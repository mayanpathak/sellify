
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { 
  PlusCircle, 
  Settings, 
  CreditCard, 
  Share2, 
  BarChart3 
} from 'lucide-react';

const WorkflowSlider = () => {
  const slides = [
    {
      icon: PlusCircle,
      title: 'Create Page',
      description: 'Start with a beautiful template or build from scratch using our intuitive page builder',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Settings,
      title: 'Customize Fields',
      description: 'Add custom form fields, product options, and personalize the checkout experience',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CreditCard,
      title: 'Add Payment Options',
      description: 'Connect Stripe and configure payment methods, pricing, and subscription options',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Share2,
      title: 'Share & Launch',
      description: 'Get your custom URL or embed code and start accepting payments immediately',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: 'Track Sales',
      description: 'Monitor conversions, revenue, and customer data with detailed analytics',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            From idea to sales in 
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {' '}5 minutes
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how easy it is to create high-converting checkout pages with Sellify
          </p>
        </motion.div>

        <div className="relative">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              bulletActiveClass: 'swiper-pagination-bullet-active !bg-indigo-600',
              bulletClass: 'swiper-pagination-bullet !bg-gray-300'
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            loop={true}
            className="pb-12"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 h-full"
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${slide.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                    <slide.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                    {slide.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="flex justify-center mt-6">
                    <div className={`w-8 h-1 bg-gradient-to-r ${slide.color} rounded-full`}></div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSlider;
