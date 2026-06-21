import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Criminals from "./pages/Criminals";
import CriminalDetail from "./pages/CriminalDetail";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import Officers from "./pages/Officers";
import OfficerDetail from "./pages/OfficerDetail";
import Evidence from "./pages/Evidence";
import Reports from "./pages/Reports";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner message="Authenticating..." />
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/criminals" element={<ProtectedRoute><Criminals /></ProtectedRoute>} />
      <Route path="/criminals/:id" element={<ProtectedRoute><CriminalDetail /></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
      <Route path="/cases/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
      <Route path="/officers" element={<ProtectedRoute><Officers /></ProtectedRoute>} />
      <Route path="/officers/:id" element={<ProtectedRoute><OfficerDetail /></ProtectedRoute>} />
      <Route path="/evidence" element={<ProtectedRoute><Evidence /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
