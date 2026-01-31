import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IDE } from "./components/layout/IDE";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { ClawdbotChat } from "@/components/ClawdbotChat";
import HouseholdDetail from "@/pages/HouseholdDetail";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IDE />} />
          <Route path="/household/:id" element={<HouseholdDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ClawdbotChat />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
