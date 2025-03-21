
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import HashtagsPage from "./pages/HashtagsPage";
import SettingsPage from "./pages/SettingsPage";
import TikTokUsernameForm from "./pages/TikTokUsernameForm";
import BrandVoicePage from "./pages/BrandVoicePage";
import RepurposeDashboardPage from "./pages/RepurposeDashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hashtags" element={<HashtagsPage />} />
            <Route path="/brand-voice" element={<BrandVoicePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/tiktok-username" element={<TikTokUsernameForm />} />
            <Route path="/repurpose-dashboard" element={<RepurposeDashboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
