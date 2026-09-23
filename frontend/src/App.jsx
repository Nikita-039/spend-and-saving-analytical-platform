import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RecordsProvider } from './context/RecordsContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DataTablePage from './pages/DataTablePage';
import Navbar from './components/ui/Navbar';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh' }}>
      <div className="loading-spinner" />
      <span>Loading SpendIQ...</span>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Navbar />
    <div className="page-wrapper">
      <main className="main-content">{children}</main>
    </div>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <RecordsProvider>
            <AppLayout><DashboardPage /></AppLayout>
          </RecordsProvider>
        </ProtectedRoute>
      } />
      <Route path="/data" element={
        <ProtectedRoute>
          <RecordsProvider>
            <AppLayout><DataTablePage /></AppLayout>
          </RecordsProvider>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#131929',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
