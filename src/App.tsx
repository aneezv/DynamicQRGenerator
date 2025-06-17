import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { DynamicQRPage } from './pages/DynamicQRPage';
import { DashboardPage } from './pages/DashboardPage';
import { RedirectPage } from './pages/RedirectPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dynamic" element={<DynamicQRPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/r/:shortId" element={<RedirectPage />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;