import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, User, Moon, Sun, Menu, X, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';
import { AuthModal } from '../auth/AuthModal';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: QrCode },
    { name: 'Dynamic QR', href: '/dynamic', icon: QrCode, requiresAuth: true },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresAuth: true },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600"
              >
                <QrCode className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                DynoQR Generator
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden space-x-8 md:flex">
              {navigation.map((item) => {
                if (item.requiresAuth && !user) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${
                        isActivePath(item.href)
                          ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Auth section */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="hidden text-sm text-gray-700 sm:block dark:text-gray-300">
                    {user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={LogOut}
                    onClick={signOut}
                    className="hidden sm:flex"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={User}
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden sm:flex"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-500 md:hidden hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-4 border-t border-gray-200 md:hidden dark:border-gray-700"
            >
              <div className="space-y-2">
                {navigation.map((item) => {
                  if (item.requiresAuth && !user) return null;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                        ${
                          isActivePath(item.href)
                            ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  {user ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {user.email}
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 space-x-2 text-sm text-gray-700 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 space-x-2 text-sm text-gray-700 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};