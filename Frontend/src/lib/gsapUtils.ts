import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Animation presets
export const animations = {
  // Fade in from bottom
  fadeInUp: {
    from: { y: 50, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
  },
  
  // Fade in from left
  fadeInLeft: {
    from: { x: -50, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
  },
  
  // Fade in from right
  fadeInRight: {
    from: { x: 50, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
  },
  
  // Scale in
  scaleIn: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
  },
  
  // Stagger animation
  staggerFadeIn: {
    from: { y: 30, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
    stagger: 0.1
  }
};

// Text animation utilities
export const textAnimations = {
  typewriter: (element: string, text: string, duration = 2) => {
    return gsap.to(element, {
      duration,
      text: {
        value: text,
        delimiter: ""
      },
      ease: "none"
    });
  },
  
  splitReveal: (element: string) => {
    const chars = gsap.utils.toArray(`${element} .char`);
    return gsap.fromTo(chars, 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.02, ease: "power2.out" }
    );
  }
};

// Scroll-triggered animations
export const scrollAnimations = {
  parallax: (element: string, speed = 0.5) => {
    return gsap.to(element, {
      yPercent: -50 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  },
  
  fadeInOnScroll: (element: string, delay = 0) => {
    return gsap.fromTo(element, 
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );
  },
  
  staggerOnScroll: (elements: string, staggerDelay = 0.1) => {
    return gsap.fromTo(elements, 
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: staggerDelay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: elements,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }
};

// Interactive hover animations
export const hoverAnimations = {
  lift: (element: string) => {
    const el = document.querySelector(element);
    if (!el) return;
    
    el.addEventListener('mouseenter', () => {
      gsap.to(element, { y: -10, scale: 1.05, duration: 0.3, ease: "power2.out" });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(element, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
    });
  },
  
  glow: (element: string) => {
    const el = document.querySelector(element);
    if (!el) return;
    
    el.addEventListener('mouseenter', () => {
      gsap.to(element, { 
        boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)", 
        duration: 0.3, 
        ease: "power2.out" 
      });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(element, { 
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", 
        duration: 0.3, 
        ease: "power2.out" 
      });
    });
  }
};



// Page transition animations
export const pageTransitions = {
  fadeIn: (element: string) => {
    return gsap.fromTo(element, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  },
  
  slideIn: (element: string, direction = 'right') => {
    const xValue = direction === 'right' ? 100 : -100;
    return gsap.fromTo(element, 
      { x: xValue, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    );
  }
};

// Loading animations
export const loadingAnimations = {
  pulseLoader: (element: string) => {
    return gsap.to(element, {
      scale: 1.2,
      opacity: 0.7,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });
  },
  
  spinLoader: (element: string) => {
    return gsap.to(element, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: "none"
    });
  }
};

// Utility functions
export const gsapUtils = {
  // Kill all animations on an element
  killAnimations: (element: string) => {
    gsap.killTweensOf(element);
  },
  
  // Create a timeline
  createTimeline: (options = {}) => {
    return gsap.timeline(options);
  },
  
  // Batch animate elements
  batchAnimate: (elements: string, animation: any, stagger = 0.1) => {
    return gsap.fromTo(elements, animation.from, {
      ...animation.to,
      stagger
    });
  },
  
  // Refresh ScrollTrigger (useful after DOM changes)
  refreshScrollTrigger: () => {
    ScrollTrigger.refresh();
  }
};

export { gsap }; 