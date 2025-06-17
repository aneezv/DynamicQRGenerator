import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, BarChart3, Link as LinkIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DynamicQRForm } from '../components/qr/DynamicQRForm';
import { AuthModal } from '../components/auth/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';

export const DynamicQRPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const benefits = [
    {
      icon: LinkIcon,
      title: 'Short URLs',
      description: 'Get clean, branded short URLs for your QR codes',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track scans, locations, and user behavior',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Shield,
      title: 'Always Editable',
      description: 'Change destination URLs without reprinting codes',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Updates take effect immediately across all codes',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text">
              {editId ? 'Edit QR Code' : 'Dynamic QR Codes'}
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              {editId 
                ? 'Update your QR code content and customization settings'
                : 'Create smart QR codes that you can edit anytime, track analytics, and manage from your dashboard.'
              }
            </p>
          </motion.div>

          {/* Benefits Grid - Only show for new QR codes */}
          {!editId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Card className="h-full p-6 text-center transition-all duration-300 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl">
                    <div className={`w-12 h-12 bg-gradient-to-r ${benefit.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Dynamic QR Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DynamicQRForm 
              onAuthRequired={handleAuthRequired}
              editId={editId}
            />
          </motion.div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};