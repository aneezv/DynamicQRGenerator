import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './Header'; // Make sure this path is correct

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main>
        {/* The <Outlet> component will render the matched child route */}
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            // Using CSS variables for theming is a great practice
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #000)',
          },
        }}
      />
    </div>
  );
};