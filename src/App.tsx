import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ShieldCheck } from 'lucide-react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { RaiseComplaintPage } from './pages/RaiseComplaintPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaintsPage } from './pages/AdminComplaintsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicComplaintsPage } from './pages/PublicComplaintsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route helper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
}> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, user, switchRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-lg w-full shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Municipal Admin Access Required
          </h2>
          <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
            You are currently browsing in <strong className="text-slate-900 capitalize font-semibold">{user?.role || 'Citizen'} Mode</strong> as <em>{user?.name}</em>.
            To access the Municipal Operations Console, Zonal Dispatch, Reports, and System Settings, switch to Municipal Officer / Admin mode.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => switchRole('admin')}
              className="w-full sm:w-auto px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>⚡ Switch to Admin Mode</span>
            </button>
            <Link
              to="/login?role=admin"
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Login as Admin Account
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Back to Citizen Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ComplaintProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
              <Navbar />

              <div className="flex-1 flex flex-col">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/track" element={<TrackComplaintPage />} />
                  <Route path="/public-complaints" element={<PublicComplaintsPage />} />

                  {/* Citizen / Authenticated routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <CitizenDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/raise-complaint"
                    element={
                      <ProtectedRoute>
                        <RaiseComplaintPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-complaints"
                    element={
                      <ProtectedRoute>
                        <MyComplaintsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Municipal Admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/complaints"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminComplaintsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminSettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>

              {/* Mobile Thumb Navigation */}
              <MobileBottomNav />
            </div>
          </ComplaintProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
