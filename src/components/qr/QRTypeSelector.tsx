import React from 'react';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Check } from 'lucide-react';
import { Card } from '../ui/Card';

interface QRTypeSelectorProps {
  selectedType: 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';
  onTypeChange: (type: 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard') => void;
}

export const QRTypeSelector: React.FC<QRTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const types = [
    {
      id: 'url' as const,
      name: 'Website URL',
      description: 'Link to any website',
      icon: '🌐',
    },
    {
      id: 'text' as const,
      name: 'Plain Text',
      description: 'Any text content',
      icon: '📝',
    },
    {
      id: 'email' as const,
      name: 'Email',
      description: 'Email address',
      icon: '📧',
    },
    {
      id: 'phone' as const,
      name: 'Phone',
      description: 'Phone number',
      icon: '📞',
    },
    {
      id: 'wifi' as const,
      name: 'WiFi',
      description: 'WiFi credentials',
      icon: '📶',
    },
    {
      id: 'vcard' as const,
      name: 'Contact',
      description: 'Contact information',
      icon: '👤',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Choose QR Code Type
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {types.map((type) => (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTypeChange(type.id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedType === type.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
              }
            `}
          >
            {selectedType === type.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {type.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {type.description}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};