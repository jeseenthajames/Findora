import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ItemDetailPage from './pages/ItemDetailPage';
import ReportLostPage from './pages/ReportLostPage';
import ReportFoundPage from './pages/ReportFoundPage';
import EditItemPage from './pages/EditItemPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0a1128',
              color: '#ffffff',
              fontSize: '0.875rem',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(10, 17, 40, 0.25)',
              padding: '0.75rem 1rem'
            },
            success: {
              iconTheme: {
                primary: '#14b8a6',
                secondary: '#ffffff'
              }
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#ffffff'
              }
            }
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/report-lost" element={<ReportLostPage />} />
              <Route path="/report-found" element={<ReportFoundPage />} />
              <Route path="/items/:id/edit" element={<EditItemPage />} />
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
