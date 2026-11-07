import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EmergencyPreviewPage from './pages/EmergencyPreviewPage';
import EmergencyCardPage from './pages/EmergencyCardPage';
import NotFoundPage from './pages/NotFoundPage';

// Marketing & Auth Layout (Dark Theme + Floating Glass Nav Pill + Footer)
function MarketingLayout() {
  return (
    <div className="page-dark-wrap">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

// Application Layout (Solid Light Theme + Solid Light Header)
function AppLayout() {
  return (
    <div className="page-plain-wrap theme-light">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Marketing & Auth Routes */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Owner Dashboard (Solid Light Application Layout) */}
      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Emergency Preview Page (Owner preview banner, solid light theme) */}
      <Route
        path="/dashboard/preview"
        element={
          <ProtectedRoute>
            <EmergencyPreviewPage />
          </ProtectedRoute>
        }
      />

      {/* Public Emergency View (Route /e/:token) - High contrast solid light, no nav clutter */}
      <Route path="/e/:token" element={<EmergencyCardPage />} />
    </Routes>
  );
}
