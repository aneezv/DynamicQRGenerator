import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// This type removes any standard button attributes that conflict with MotionProps.
type CleanButtonAttributes = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  keyof MotionProps
>;

// Our final ButtonProps interface.
export interface ButtonProps extends CleanButtonAttributes, MotionProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;

  /**
   * THE FINAL FIX IS HERE.
   * We explicitly define `children` as a standard `React.ReactNode`.
   * This overrides the conflicting `children` type from `MotionProps`
   * (which can be a MotionValue), resolving the type error.
   */
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  // Our custom props
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 focus:ring-gray-500',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-primary-500',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-9',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-11',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();
  
  const iconSizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const iconMarginClass = children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : '';

  return (
    <motion.button
      whileHover={props.whileHover ?? { scale: disabled || loading ? 1 : 1.02 }}
      whileTap={props.whileTap ?? { scale: disabled || loading ? 1 : 0.98 }}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSizeClass} ${iconMarginClass} animate-spin`} />
      ) : (
        Icon && iconPosition === 'left' && <Icon className={`${iconSizeClass} ${iconMarginClass}`} />
      )}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className={`${iconSizeClass} ${iconMarginClass}`} />}
    </motion.button>
  );
};