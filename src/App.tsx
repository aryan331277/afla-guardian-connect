import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import SplashScreen from "./pages/SplashScreen";
import LogoScreen from "./pages/LogoScreen";
import PrivacyAgreement from "./pages/PrivacyAgreement";
import LanguageSelection from "./pages/LanguageSelection";
import RoleSelection from "./pages/RoleSelection";
import PhoneAuth from "./pages/PhoneAuth";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerProfile from "./pages/FarmerProfile";
import ScanHistory from "./pages/ScanHistory";
import InsightsHistory from "./pages/InsightsHistory";
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
import AuthGuard from "./components/AuthGuard";

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
          <Route path="/" element={<LogoScreen />} />
          <Route path="/language" element={<LanguageSelection />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/privacy-agreement" element={<PrivacyAgreement />} />
          <Route path="/phone-auth" element={<PhoneAuth />} />
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/farmer" element={<AuthGuard requiredRole="farmer"><FarmerDashboard /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><FarmerProfile /></AuthGuard>} />
          <Route path="/scan-history" element={<AuthGuard><ScanHistory /></AuthGuard>} />
          <Route path="/insights-history" element={<AuthGuard><InsightsHistory /></AuthGuard>} />
          <Route path="/buyer" element={<AuthGuard requiredRole="buyer"><BuyerDashboard /></AuthGuard>} />
          <Route path="/government" element={<AuthGuard requiredRole="government"><GovernmentDashboard /></AuthGuard>} />
          <Route path="/scan" element={<AuthGuard><ScanWizard /></AuthGuard>} />
          <Route path="/scan-results" element={<AuthGuard><ScanResults /></AuthGuard>} />
          <Route path="/buyer-scan" element={<AuthGuard><BuyerScan /></AuthGuard>} />
          <Route path="/community" element={<AuthGuard><Community /></AuthGuard>} />
          <Route path="/upgrade" element={<AuthGuard><UpgradePlan /></AuthGuard>} />
          <Route path="/chat" element={<AuthGuard><Chat /></AuthGuard>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
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
