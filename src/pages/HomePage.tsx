import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Import the specific icons needed for this component
import { ArrowRight, Zap, Shield, BarChart3, Palette } from 'lucide-react';
import { QRCodeGenerator } from '../components/qr/QRCodeGenerator';
import { AuthModal } from '../components/auth/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const features = [
    {
      icon: Zap, // Pass the component directly
      title: 'Instant Generation',
      description: 'Create QR codes instantly without any signup required',
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      icon: Palette, // Pass the component directly
      title: 'Full Customization',
      description: 'Customize colors, size, error correction, and add your logo',
      gradient: 'from-pink-400 to-purple-500',
    },
    {
      icon: Shield, // Pass the component directly
      title: 'Dynamic QR Codes',
      description: 'Create trackable QR codes that you can edit anytime',
      gradient: 'from-green-400 to-blue-500',
    },
    {
      icon: BarChart3, // Pass the component directly
      title: 'Analytics & Insights',
      description: 'Track scans, locations, and get detailed analytics',
      gradient: 'from-blue-400 to-indigo-500',
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl dark:text-gray-100">
              Create Beautiful{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600">
                QR Codes
              </span>
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-xl text-gray-600 dark:text-gray-300">
              Generate stunning QR codes instantly with custom logos, colors, and analytics. 
              Perfect for businesses, events, and personal use.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={handleGetStarted}>
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                icon={ArrowRight} // Pass the imported icon component
                iconPosition="right"
                onClick={handleGetStarted}
              >
                Try Dynamic QR
              </Button>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="h-full p-6 text-center transition-all duration-300 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {/* Render the icon component from the features array */}
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* QR Code Generator */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
                Static QR Code Generator
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Create a QR code instantly - no signup required
              </p>
            </div>
            <QRCodeGenerator />
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <div className="relative overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-purple-600 to-pink-600 opacity-90"></div>
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <Card className="relative p-8 text-center text-white bg-transparent border-0 shadow-2xl">
                <div className="max-w-2xl mx-auto">
                  <h3 className="mb-4 text-2xl font-bold">
                    Ready for Advanced Features?
                  </h3>
                  <p className="mb-6 text-primary-100">
                    Create dynamic QR codes with analytics, custom domains, and management features. 
                    Track every scan and optimize your campaigns.
                  </p>
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    icon={ArrowRight} // Pass the imported icon component
                    iconPosition="right"
                    onClick={handleGetStarted}
                  >
                    Create Dynamic QR Code
                  </Button>
                </div>
              </Card>
            </div>
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