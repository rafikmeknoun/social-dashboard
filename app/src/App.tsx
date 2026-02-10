import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import SocialPage from './pages/SocialPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PostsPage from './pages/PostsPage';
import AccountsPage from './pages/AccountsPage';
import SettingsPage from './pages/SettingsPage';
import DataImportPage from './pages/DataImportPage';
import RevenuePage from './pages/RevenuePage';
import FacebookDashboard from './pages/platforms/FacebookDashboard';
import YouTubeDashboard from './pages/platforms/YouTubeDashboard';
import InstagramDashboard from './pages/platforms/InstagramDashboard';
import TikTokDashboard from './pages/platforms/TikTokDashboard';
import AdSenseDashboard from './pages/platforms/AdSenseDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="social" element={<SocialPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="posts" element={<PostsPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="import" element={<DataImportPage />} />
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="platform/facebook" element={<FacebookDashboard />} />
              <Route path="platform/youtube" element={<YouTubeDashboard />} />
              <Route path="platform/instagram" element={<InstagramDashboard />} />
              <Route path="platform/tiktok" element={<TikTokDashboard />} />
              <Route path="platform/adsense" element={<AdSenseDashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
