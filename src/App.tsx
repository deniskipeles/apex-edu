import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Components
import Navbar from './components/Navbar';
import PaymentModal from './components/PaymentModal';
import AssignmentFormModal from './components/AssignmentFormModal';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TutorProfiles from './pages/TutorProfiles';
import Courses from './pages/Courses';
import AuthPage from './pages/AuthPage';
import React, { useEffect, useState } from 'react';

// Simple Route Protection Guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useStore();
  const navigate = useNavigate();

  // Safely trigger navigation side-effects on state transitions unconditionally
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-600/30 border-t-sky-600 rounded-full animate-spin mb-4" />
        <span className="text-xs text-slate-500 font-semibold">Synchronizing secure credentials...</span>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}

// Global App Layout wrapper to access React Router location hooks safely
function AppLayout() {
  const { init, isAuthenticated, currentUser } = useStore();
  const [depositOpen, setDepositOpen] = useState(false);
  const [newAssignmentOpen, setNewAssignmentOpen] = useState(false);

  // Initialize data stores on startup
  useEffect(() => {
    init();
  }, []); // Run exactly once on mount

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 selection:bg-sky-500/10 selection:text-sky-700 transition-colors duration-200">
      {/* Dynamic Header */}
      <Navbar
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenNewAssignment={() => setNewAssignmentOpen(true)}
      />

      {/* Main Page Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  onOpenDeposit={() => setDepositOpen(true)}
                  onOpenNewAssignment={() => setNewAssignmentOpen(true)}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tutors"
            element={
              <ProtectedRoute>
                <TutorProfiles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses onOpenNewAssignment={() => setNewAssignmentOpen(true)} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer credits */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/60 py-6 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors duration-200">
        <p>© {new Date().getFullYear()} EduSolve. All rights reserved. Powered by secure ApexKit ledger storage.</p>
      </footer>

      {/* Global Modals */}
      <PaymentModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <AssignmentFormModal isOpen={newAssignmentOpen} onClose={() => setNewAssignmentOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
