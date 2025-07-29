import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import SplashScreen from "./pages/SplashScreen";
import LanguageSelection from "./pages/LanguageSelection";
import RoleSelection from "./pages/RoleSelection";
import PhoneAuth from "./pages/PhoneAuth";
import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import ScanWizard from "./pages/ScanWizard";
import ScanResults from "./pages/ScanResults";
import BuyerScan from "./pages/BuyerScan";
import Community from "./pages/Community";
import UpgradePlan from "./pages/UpgradePlan";
import Chat from "./pages/Chat";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import AdBanner from "./components/AdBanner";

const queryClient = new QueryClient();

const AppContent = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/language" element={<LanguageSelection />} />
          <Route path="/role" element={<RoleSelection />} />
          <Route path="/auth" element={<PhoneAuth />} />
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/buyer" element={<BuyerDashboard />} />
          <Route path="/government" element={<GovernmentDashboard />} />
          <Route path="/scan" element={<ScanWizard />} />
          <Route path="/scan-results" element={<ScanResults />} />
          <Route path="/buyer-scan" element={<BuyerScan />} />
          <Route path="/community" element={<Community />} />
          <Route path="/upgrade" element={<UpgradePlan />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AdBanner />
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
