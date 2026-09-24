import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

import AuthCallback from "@/pages/AuthCallback";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Onboarding from "@/pages/Onboarding";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import Templates from "@/pages/Templates";
import Agents from "@/pages/Agents";
import AgentDetail from "@/pages/AgentDetail";
import Integrations from "@/pages/Integrations";
import Usage from "@/pages/Usage";
import ImportFlow from "@/pages/ImportFlow";
import ProjectWorkspace from "@/pages/ProjectWorkspace";
import ComingSoon from "@/pages/ComingSoon";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import { AppShell } from "@/components/AppShell";
import { PageSkeleton } from "@/components/PageSkeleton";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (!user.onboarding_completed && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (user) return <Navigate to={user.onboarding_completed ? "/home" : "/onboarding"} replace />;
  return children;
}

function AppRouter() {
  const location = useLocation();
  // Detect OAuth callback synchronously during render to avoid race conditions.
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/project/:id" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/import" element={<ImportFlow />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--ac-elevated)",
                border: "1px solid var(--ac-border)",
                color: "var(--ac-text)",
                borderRadius: "10px",
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
