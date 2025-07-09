import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap, scrollAnimations, textAnimations, hoverAnimations } from '@/lib/gsapUtils';

const HeroSection = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create main timeline
      const tl = gsap.timeline();

      // Animate floating blobs
      gsap.set([blob1Ref.current, blob2Ref.current, blob3Ref.current], { opacity: 0, scale: 0 });
      
      tl.to([blob1Ref.current, blob2Ref.current, blob3Ref.current], {
        opacity: 0.7,
        scale: 1,
        duration: 2,
        stagger: 0.3,
        ease: "power2.out"
      });

      // Continuous floating animation for blobs
      gsap.to(blob1Ref.current, {
        y: -30,
        x: 20,
        rotation: 45,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(blob2Ref.current, {
        y: 40,
        x: -30,
        rotation: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(blob3Ref.current, {
        y: -20,
        x: 40,
        rotation: 60,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Hero content animations
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current, mockupRef.current], { 
        opacity: 0, 
        y: 50 
      });

      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      }, 0.5)
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, 0.8)
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, 1.2)
      .to(mockupRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
      }, 1);

      // Typewriter effect for title
      const titleChars = titleRef.current?.textContent?.split('') || [];
      if (titleRef.current) {
        titleRef.current.innerHTML = titleChars.map(char => 
          char === ' ' ? ' ' : `<span class="char">${char}</span>`
        ).join('');
        
        gsap.fromTo(titleRef.current.querySelectorAll('.char'), 
          { opacity: 0, y: 50 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.05, 
            stagger: 0.03,
            delay: 1.5,
            ease: "power2.out"
          }
        );
      }

      // Parallax effect for mockup
      if (mockupRef.current) {
        scrollAnimations.parallax(mockupRef.current as any, 0.3);
      }

    }, heroRef);

    // Setup hover effects
    const setupHoverEffects = () => {
      const buttons = document.querySelectorAll('.hero-button');
      buttons.forEach((button, index) => {
        button.addEventListener('mouseenter', () => {
          gsap.to(button, { 
            scale: 1.05, 
            y: -5,
            boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)",
            duration: 0.3, 
            ease: "power2.out" 
          });
        });
        
        button.addEventListener('mouseleave', () => {
          gsap.to(button, { 
            scale: 1, 
            y: 0,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            duration: 0.3, 
            ease: "power2.out" 
          });
        });
      });
    };

    setupHoverEffects();

    return () => ctx.revert();
  }, []);

  const handleStartTrial = () => {
    // Button click animation
    gsap.to(buttonsRef.current?.children[0], {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => navigate('/signup')
    });
  };

  const handleLiveDemo = () => {
    // Button click animation
    gsap.to(buttonsRef.current?.children[1], {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        const useCasesSection = document.getElementById('use-cases');
        if (useCasesSection) {
          useCasesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  };

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 morphing-bg opacity-10"></div>
      
      {/* Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          ref={blob1Ref}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <div 
          ref={blob2Ref}
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <div 
          ref={blob3Ref}
          className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
      </div>

      {/* Particle System */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 floating"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center z-10">
        {/* Left Content */}
        <div className="text-center lg:text-left space-y-8">
          <h1 
            ref={titleRef}
            className="text-6xl lg:text-7xl font-black text-gray-900 leading-tight"
          >
            Custom checkout pages{' '}
            <span className="gradient-text">that convert</span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl"
          >
            Accept payments with <span className="font-bold text-indigo-600">0% transaction fees</span> on any website, powered by Stripe — without needing to code
          </p>
          
          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
          >
            <button
              onClick={handleStartTrial}
              className="hero-button magnetic-button bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Start 7-Day Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={handleLiveDemo}
              className="hero-button magnetic-button border-3 border-indigo-300 text-indigo-700 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all duration-300 backdrop-blur-sm bg-white/80"
            >
              See a Live Demo
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center lg:justify-start space-x-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">10k+</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">$2M+</div>
              <div className="text-sm text-gray-500">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">99.9%</div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right Content - Enhanced Mockup */}
        <div ref={mockupRef} className="relative">
          {/* Floating Elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full floating opacity-80"></div>
          <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full floating opacity-80" style={{ animationDelay: '2s' }}></div>
          
          {/* Main Mockup */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform hover:rotate-0 transition-transform duration-700 interactive-card">
            {/* Browser Bar */}
            <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-200">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 flex items-center px-3">
                <div className="text-xs text-gray-500">sellify.com/checkout</div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Premium Course</h3>
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="h-4 bg-white/40 rounded mb-3"></div>
                    <div className="h-3 bg-white/30 rounded w-3/4"></div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="h-4 bg-white/40 rounded mb-3"></div>
                    <div className="h-3 bg-white/30 rounded w-1/2"></div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl p-4 text-center font-bold text-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    Complete Payment - $297
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex justify-center space-x-4 mt-6 pt-4 border-t border-white/20">
                  <div className="text-xs opacity-80">🔒 SSL Secured</div>
                  <div className="text-xs opacity-80">💳 Stripe Powered</div>
                  <div className="text-xs opacity-80">⚡ Instant Access</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Success Notification */}
          <div className="absolute -top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg floating text-sm font-medium">
            ✅ Payment Successful!
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-indigo-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-indigo-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
