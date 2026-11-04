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

// Standard layout with Navbar and Footer
function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Standard Public & Owner Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Owner Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Emergency Preview Page (Owner preview with banner, no standard nav) */}
      <Route
        path="/dashboard/preview"
        element={
          <ProtectedRoute>
            <EmergencyPreviewPage />
          </ProtectedRoute>
        }
      />

      {/* Public Emergency View (Route /e/:token) - No navigation clutter */}
      <Route path="/e/:token" element={<EmergencyCardPage />} />
    </Routes>
  );
}
