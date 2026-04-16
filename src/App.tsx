import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import TelltaleList from "./pages/TelltaleList";
import AddTelltale from "./pages/AddTelltale";
import TelltaleDetail from "./pages/TelltaleDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PendingApproval from "./pages/PendingApproval";
import AdminUsers from "./pages/AdminUsers";
import AdminStandards from "./pages/AdminStandards";
import AdminAnalytics from "./pages/AdminAnalytics";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pending" element={<PendingApproval />} />

            {/* Protected routes - require approved status */}
            <Route path="/" element={<ProtectedRoute requireApproved><Dashboard /></ProtectedRoute>} />
            <Route path="/telltales" element={<ProtectedRoute requireApproved><TelltaleList /></ProtectedRoute>} />
            <Route path="/telltales/new" element={<ProtectedRoute requireApproved><AddTelltale /></ProtectedRoute>} />
            <Route path="/telltales/:id" element={<ProtectedRoute requireApproved><TelltaleDetail /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute requireApproved><Favorites /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/standards" element={<ProtectedRoute requireAdmin><AdminStandards /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><AdminAnalytics /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
