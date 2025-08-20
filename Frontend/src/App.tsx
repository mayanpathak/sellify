import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { gsap, pageTransitions } from "@/lib/gsapUtils";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import CreatePage from "./pages/CreatePage";
import CheckoutPage from "./pages/CheckoutPage";
import Submissions from "./pages/Submissions";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import PlanManagement from "./pages/PlanManagement";
import StripeReturn from "./pages/StripeReturn";
import StripeRefresh from "./pages/StripeRefresh";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Scroll Progress Component
const ScrollProgress = () => {
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      gsap.to('.scroll-progress', {
        width: `${scrollPercent}%`,
        duration: 0.1,
        ease: "none"
      });
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return <div className="scroll-progress"></div>;
};

// Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    // Page transition animation
    gsap.fromTo('main', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, [location]);

  return <main>{children}</main>;
};

const AppContent = () => {
  useEffect(() => {

    // Add smooth scrolling behavior
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.slice(1);
        const targetElement = document.getElementById(targetId || '');
        
        if (targetElement) {
          gsap.to(window, {
            duration: 1,
            scrollTo: { y: targetElement, offsetY: 80 },
            ease: "power2.inOut"
          });
        }
      });
    });

    // Add loading animation for page transitions
    const handleRouteChange = () => {
      gsap.fromTo('.page-loader', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <>
      <ScrollProgress />
      <Routes>
        <Route path="/" element={
          <PageTransition>
            <Index />
          </PageTransition>
        } />
        <Route path="/signin" element={
          <PageTransition>
            <SignIn />
          </PageTransition>
        } />
        <Route path="/signup" element={
          <PageTransition>
            <SignUp />
          </PageTransition>
        } />
        <Route path="/page/:slug" element={
          <PageTransition>
            <CheckoutPage />
          </PageTransition>
        } />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-page" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <CreatePage />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/submissions" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <Submissions />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <Settings />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <Analytics />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/plans" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <PlanManagement />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stripe/return" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <StripeReturn />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stripe/refresh" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <StripeRefresh />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment/success" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <PaymentSuccess />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment/failed" 
          element={
            <ProtectedRoute>
              <PageTransition>
                <PaymentFailed />
              </PageTransition>
            </ProtectedRoute>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        } />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
