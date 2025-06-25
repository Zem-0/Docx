import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DocumentProcessor from "./pages/DocumentProcessor";
import SettingsPageContainer from './pages/Settings';
import ResearchAgentPageContainer from './pages/ResearchAgent';
import LibraryPageContainer from './pages/Library';
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import { useEffect, useRef } from "react";
import { supabase } from "./lib/supabaseClient";

const queryClient = new QueryClient();

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    // On mount, check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      wasLoggedIn.current = !!session;
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect if the user just signed in (was not logged in before)
      if (
        event === "SIGNED_IN" &&
        session &&
        !wasLoggedIn.current &&
        (location.pathname === "/" || location.pathname === "/login")
      ) {
        navigate("/dashboard", { replace: true });
      }
      // Update the ref for future events
      wasLoggedIn.current = !!session;
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/documents" element={
        <DashboardLayout>
          <DocumentProcessor />
        </DashboardLayout>
      } />
      <Route path="/settings" element={<SettingsPageContainer />} />
      <Route path="/research-agent" element={<ResearchAgentPageContainer />} />
      <Route path="/library" element={<LibraryPageContainer />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
