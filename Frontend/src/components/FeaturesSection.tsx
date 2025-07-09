import React, { useEffect, useRef } from 'react';
import { gsap, scrollAnimations } from '@/lib/gsapUtils';
import { 
  MousePointer2, 
  BarChart3, 
  Palette, 
  TrendingUp, 
  Globe, 
  Code 
} from 'lucide-react';

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: MousePointer2,
      title: 'Point & Click Page Builder',
      description: 'Create beautiful checkout pages with our intuitive drag-and-drop builder',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: BarChart3,
      title: 'Track Sales & Analytics',
      description: 'Monitor your performance with detailed analytics and conversion tracking',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Palette,
      title: 'Custom Fields & Branding',
      description: 'Match your brand with custom colors, logos, and form fields',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      icon: TrendingUp,
      title: 'Order Bumps & Upsells',
      description: 'Increase revenue with smart upsells and order bump features',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    },
    {
      icon: Globe,
      title: 'Hosted or Embedded Pages',
      description: 'Host on our platform or embed directly into your existing website',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200'
    },
    {
      icon: Code,
      title: 'No Code Needed',
      description: 'Build professional checkout pages without writing a single line of code',
      color: 'from-teal-500 to-blue-500',
      bgColor: 'from-teal-50 to-blue-50',
      borderColor: 'border-teal-200'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([titleRef.current, subtitleRef.current], { opacity: 0, y: 50 });
      gsap.set('.feature-card', { opacity: 0, y: 30, scale: 0.9 });

      // Create main timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate title and subtitle
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4");

      // Animate feature cards with stagger
      tl.to('.feature-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }, "-=0.2");

      // Add continuous floating animation to icons
      gsap.to('.feature-icon', {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.2,
          repeat: -1
        }
      });

      // Add hover effects
      const featureCards = document.querySelectorAll('.feature-card');
      featureCards.forEach(card => {
        const icon = card.querySelector('.feature-icon');
        const title = card.querySelector('.feature-title');
        
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.05,
            y: -10,
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            duration: 0.3,
            ease: "power2.out"
          });
          
          gsap.to(icon, {
            scale: 1.2,
            rotation: 360,
            duration: 0.5,
            ease: "back.out(1.7)"
          });

          gsap.to(title, {
            color: "#6366f1",
            duration: 0.3,
            ease: "power2.out"
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            duration: 0.3,
            ease: "power2.out"
          });
          
          gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.out"
          });

          gsap.to(title, {
            color: "#111827",
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });

      // Add parallax effect to background elements
      gsap.to('.bg-blob', {
        y: -50,
        duration: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-blob absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="bg-blob absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="bg-blob absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full opacity-30 floating"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Everything you need to{' '}
            <span className="gradient-text">sell online</span>
          </h2>
          <p ref={subtitleRef} className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Powerful features designed to maximize your conversions and streamline your sales process
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`feature-card bg-gradient-to-br ${feature.bgColor} p-8 rounded-3xl border-2 ${feature.borderColor} hover:border-opacity-50 transition-all cursor-pointer group relative overflow-hidden backdrop-blur-sm`}
            >
              {/* Card Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
              </div>

              <div className="relative z-10">
                <div className={`feature-icon w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="feature-title text-2xl font-bold text-gray-900 mb-4 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              </div>

              {/* Interactive Elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60"></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200 shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Join 10,000+ businesses already using Sellify
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
