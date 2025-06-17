// src/components/ui/Icon.tsx

import React from 'react';
import {
  LucideProps,
  // Icons for HomePage
  Zap, Palette, Shield, BarChart3, ArrowRight,
  // Icons for DynamicQRForm
  Link, Save, Eye, EyeOff, ArrowLeft,
  // Icons for QRTypeSelector
  FileText, Mail, MessageSquare, Wifi, Contact,
} from 'lucide-react';

// Central mapping of all icons used in the app
const iconMap = {
  Zap, Palette, Shield, BarChart3, ArrowRight,
  Link, Save, Eye, EyeOff, ArrowLeft,
  FileText, Mail, MessageSquare, Wifi, Contact,
};

export type IconName = keyof typeof iconMap;

interface IconProps extends LucideProps {
  name: IconName;
}

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = iconMap[name];

  // TypeScript should prevent this, but it's good practice for safety
  if (!LucideIcon) {
    return null; 
  }

  return <LucideIcon {...props} />;
};