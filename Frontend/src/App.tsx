import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import CreatePage from "./pages/CreatePage";
import CheckoutPage from "./pages/CheckoutPage";
import Submissions from "./pages/Submissions";
import StripeReturn from "./pages/StripeReturn";
import StripeRefresh from "./pages/StripeRefresh";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/page/:slug" element={<CheckoutPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-page" 
              element={
                <ProtectedRoute>
                  <CreatePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/submissions" 
              element={
                <ProtectedRoute>
                  <Submissions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stripe/return" 
              element={
                <ProtectedRoute>
                  <StripeReturn />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stripe/refresh" 
              element={
                <ProtectedRoute>
                  <StripeRefresh />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
