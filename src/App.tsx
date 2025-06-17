import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { DynamicQRPage } from './pages/DynamicQRPage';
import { DashboardPage } from './pages/DashboardPage';
import { RedirectPage } from './pages/RedirectPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route 1: Main Application Routes */}
        {/* These routes will all be rendered inside the MainLayout component */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="dynamic" element={<DynamicQRPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>

        {/* Route 2: Isolated Redirect Route */}
        {/* This route does NOT use the MainLayout. It renders on its own. */}
        {/* This is the crucial fix. */}
        <Route path="/r/:shortId" element={<RedirectPage />} />

        {/* You can add other isolated routes here, like a 404 page */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;