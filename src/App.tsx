import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import AddEvent from "./pages/AddEvent";
import MyEvents from "./pages/MyEvents";
import MyInvites from "./pages/MyInvites";
import AddHotel from "./pages/AddHotel";
import AllEvents from "./pages/AllEvents";
import Favorites from "./pages/Favorites";
import SentInvites from "./pages/SentInvites";
import Chats from "./pages/Chats";
import Profile from "./pages/Profile";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/add-event" element={<AddEvent />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/my-invites" element={<MyInvites />} />
            <Route path="/add-hotel" element={<AddHotel />} />
            <Route path="/all-events" element={<AllEvents />} />
            <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/sent-invites" element={<SentInvites />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;