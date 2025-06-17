import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
}) => {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? {
        whileHover: { scale: 1.02 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...hoverProps}
    >
      {children}
    </Component>
  );
};