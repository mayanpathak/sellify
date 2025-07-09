import React, { useState, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapUtils';
import { Check, Star, Zap, Crown } from 'lucide-react';

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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
      popular: false,
      icon: Star,
      color: 'from-gray-500 to-gray-700',
      bgColor: 'from-gray-50 to-gray-100'
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
      popular: true,
      icon: Zap,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50'
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
      popular: false,
      icon: Crown,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([titleRef.current, toggleRef.current], { opacity: 0, y: 30 });
      gsap.set('.pricing-card', { opacity: 0, y: 50, rotationY: 15 });

      // Create main timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate title
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      })
      .to(toggleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4");

      // Animate pricing cards with stagger
      tl.to('.pricing-card', {
        opacity: 1,
        y: 0,
        rotationY: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
      }, "-=0.2");

      // Add floating animation to popular badge
      gsap.to('.popular-badge', {
        y: -5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Add continuous glow animation to popular card
      gsap.to('.popular-card', {
        boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleToggle = () => {
    const newValue = !isYearly;
    setIsYearly(newValue);

    // Animate toggle
    gsap.to('.toggle-slider', {
      x: newValue ? 30 : 2,
      duration: 0.3,
      ease: "power2.out"
    });

    // Animate price changes
    gsap.to('.price-value', {
      scale: 0.8,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });

    // Animate save badge
    if (newValue) {
      gsap.fromTo('.save-badge', 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    } else {
      gsap.to('.save-badge', {
        scale: 0,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      });
    }
  };

  const handleCardHover = (e: React.MouseEvent, isPrimary = false) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.plan-icon');
    const button = card.querySelector('.plan-button');
    
    gsap.to(card, {
      y: -15,
      scale: 1.03,
      boxShadow: isPrimary 
        ? "0 30px 60px rgba(99, 102, 241, 0.4)" 
        : "0 20px 40px rgba(0, 0, 0, 0.15)",
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(icon, {
      scale: 1.2,
      rotation: 360,
      duration: 0.5,
      ease: "back.out(1.7)"
    });

    gsap.to(button, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleCardLeave = (e: React.MouseEvent, isPrimary = false) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.plan-icon');
    const button = card.querySelector('.plan-button');
    
    gsap.to(card, {
      y: 0,
      scale: 1,
      boxShadow: isPrimary 
        ? "0 10px 30px rgba(99, 102, 241, 0.2)" 
        : "0 4px 6px rgba(0, 0, 0, 0.1)",
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(icon, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(button, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    const button = e.currentTarget;
    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  };

  return (
    <section ref={sectionRef} id="pricing" className="py-20 bg-gradient-to-br from-gray-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full opacity-20 floating"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Simple,{' '}
            <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Start free, then choose the plan that scales with your business
          </p>
        </div>

        {/* Enhanced Toggle */}
        <div ref={toggleRef} className="flex items-center justify-center mb-12">
          <span className={`mr-4 text-lg font-semibold transition-colors ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
              isYearly ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'
            }`}
            onClick={handleToggle}
          >
            <div className="toggle-slider absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 transform translate-x-0.5"></div>
          </button>
          <span className={`ml-4 text-lg font-semibold transition-colors ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          <div className={`save-badge ml-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1 rounded-full font-bold ${isYearly ? 'opacity-100' : 'opacity-0'}`}>
            Save 20%
          </div>
        </div>

        {/* Enhanced Pricing Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`pricing-card ${plan.popular ? 'popular-card' : ''} relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-all duration-300 cursor-pointer ${
                plan.popular 
                  ? 'border-indigo-300 transform scale-105 z-10' 
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
              onMouseEnter={(e) => handleCardHover(e, plan.popular)}
              onMouseLeave={(e) => handleCardLeave(e, plan.popular)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgColor} rounded-3xl opacity-50`}></div>
              
              {/* Popular Badge */}
              {plan.popular && (
                <div className="popular-badge absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="relative z-10">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`plan-icon w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-8">
                  <div className="price-value text-6xl font-black text-gray-900 mb-2">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </div>
                  <span className="text-gray-600 text-lg">
                    /{plan.price.monthly === 0 ? 'trial' : 'month'}
                  </span>
                  {isYearly && plan.price.monthly > 0 && (
                    <div className="text-sm text-green-600 font-semibold mt-1">
                      Save ${(plan.price.monthly - plan.price.yearly) * 12}/year
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={feature} className="flex items-center group">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`plan-button w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300'
                  }`}
                  onClick={handleButtonClick}
                >
                  {plan.cta}
                </button>

                {/* Plan Highlight */}
                {plan.popular && (
                  <div className="text-center mt-4">
                    <span className="text-sm text-indigo-600 font-semibold">
                      ⚡ Most chosen by our customers
                    </span>
                  </div>
                )}
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-6 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 border border-gray-200 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">30-day money-back guarantee</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Cancel anytime</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">No setup fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
