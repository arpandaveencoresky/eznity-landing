import { Toaster } from "@/components/ui/toaster";
import "./product-styles.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import {
  DashboardLayout,
  DashboardLayoutNoSidebar,
} from "./components/layout/DashboardLayout";
import { PageLayout } from "./components/layout/PageLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectReels from "./pages/ProjectReels";
import Upload from "./pages/Upload";
import Editor from "./pages/Editor";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import Profile from "./pages/auth/Profile";
import ChangePassword from "./pages/auth/ChangePassword";
import Settings from "./pages/auth/Settings";
import OAuthCallback from "./pages/auth/OAuthCallback";
import "./styles/editor.css";
import "./styles/template-cards.css";
import ReelDetails from "./pages/ReelDetails";
import AllVideos from "./pages/AllVideos";
import Subscription from "./pages/Subscription";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* BrowserRouter removed for integration */}
    <WebSocketProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes - redirect to dashboard if authenticated */}
                <Route
                  path="login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="signup"
                  element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  }
                />
                <Route
                  path="forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="verify-otp"
                  element={
                    <PublicRoute>
                      <VerifyOTP />
                    </PublicRoute>
                  }
                />
                <Route
                  path="auth/redirect"
                  element={
                    <ProtectedRoute>
                      <OAuthCallback />
                    </ProtectedRoute>
                  }
                />
                {/* Landing page for product sub-app */}
                <Route index element={<Index />} />

                {/* Protected routes with DashboardLayout (has sidebar) */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="projects" element={<Projects />} />
                </Route>
                {/* Protected routes with DashboardLayout but no sidebar */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayoutNoSidebar />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="project/:projectId/reels"
                    element={<ProjectReels />}
                  />
                </Route>

                {/* Protected routes with PageLayout (no sidebar) */}
                <Route
                  element={
                    <ProtectedRoute>
                      <PageLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="upload" element={<Upload />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="change-password" element={<ChangePassword />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="subscription" element={<Subscription />} />
                </Route>

                {/* Protected routes with custom/specialized layouts */}
                <Route
                  path="editor/:reelId"
                  element={
                    <ProtectedRoute>
                      <Editor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="videos"
                  element={
                    <ProtectedRoute>
                      <AllVideos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reel/:reelId"
                  element={
                    <ProtectedRoute>
                      <ReelDetails />
                    </ProtectedRoute>
                  }
                />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    </WebSocketProvider>
  </QueryClientProvider>
);

export default App;
