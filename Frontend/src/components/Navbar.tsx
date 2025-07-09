import React, { useState, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapUtils';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
      
      // Animate navbar background
      gsap.to(navRef.current, {
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0)',
        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
        boxShadow: isScrolled ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 0 0 rgba(0, 0, 0, 0)',
        duration: 0.3,
        ease: "power2.out"
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Initial navbar animation
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );

      // Stagger animate nav items
      gsap.fromTo('.nav-item', 
        { y: -20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.5, 
          stagger: 0.1, 
          delay: 0.3,
          ease: "power2.out" 
        }
      );

      // Logo animation
      gsap.fromTo(logoRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, delay: 0.2, ease: "back.out(1.7)" }
      );

    }, navRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Mobile menu animation
    if (mobileMenuOpen) {
      gsap.fromTo(mobileMenuRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      
      gsap.fromTo('.mobile-nav-item',
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.1, delay: 0.2, ease: "power2.out" }
      );
    } else if (mobileMenuRef.current) {
      gsap.to(mobileMenuRef.current,
        { x: '100%', opacity: 0, duration: 0.3, ease: "power2.in" }
      );
    }
  }, [mobileMenuOpen]);

  const navItems = [
    { name: 'Features', id: 'features' },
    { name: 'Use Cases', id: 'use-cases' },
    { name: 'Testimonials', id: 'testimonials' },
    { name: 'Pricing', id: 'pricing' }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: element, offsetY: 80 },
        ease: "power2.inOut"
      });
    }
    setMobileMenuOpen(false);
  };

  const handleNavItemHover = (e: React.MouseEvent) => {
    const target = e.currentTarget;
    gsap.to(target, {
      y: -3,
      scale: 1.05,
      color: "#6366f1",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleNavItemLeave = (e: React.MouseEvent) => {
    const target = e.currentTarget;
    gsap.to(target, {
      y: 0,
      scale: 1,
      color: "#374151",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleLogoHover = () => {
    gsap.to(logoRef.current, {
      scale: 1.1,
      rotation: 5,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleLogoLeave = () => {
    gsap.to(logoRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleButtonHover = (e: React.MouseEvent) => {
    const target = e.currentTarget;
    gsap.to(target, {
      scale: 1.05,
      y: -2,
      boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleButtonLeave = (e: React.MouseEvent) => {
    const target = e.currentTarget;
    gsap.to(target, {
      scale: 1,
      y: 0,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              ref={logoRef}
              className="font-black text-3xl gradient-text cursor-pointer"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
            >
              <a href="/">Sellify</a>
            </div>
            
            {/* Desktop Navigation */}
            <div ref={menuRef} className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  onMouseEnter={handleNavItemHover}
                  onMouseLeave={handleNavItemLeave}
                  className="nav-item text-gray-700 font-semibold text-lg transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="/signin"
                className="signin-highlight relative px-6 py-2.5 rounded-xl font-bold text-lg transition-all duration-300 group overflow-hidden border-2 border-transparent hover:border-indigo-200"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                  Sign in
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl animate-pulse"></div>
              </a>
              <a
                href="/signup"
                className="magnetic-button bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg transition-all relative overflow-hidden group"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <span className="relative z-10">Start Free Trial</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 transform translate-x-full ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 pt-20">
          <div className="space-y-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className="mobile-nav-item block w-full text-left text-xl font-semibold text-gray-700 hover:text-indigo-600 transition-colors py-3 border-b border-gray-100"
              >
                {item.name}
              </button>
            ))}
            
            <div className="pt-6 space-y-4">
              <a
                href="/signin"
                className="mobile-signin-highlight block w-full text-center py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden group border-2 border-indigo-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Sign in
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-xl animate-pulse"></div>
              </a>
              <a
                href="/signup"
                className="mobile-nav-item block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
