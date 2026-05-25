import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

// ==========================================
// 1. REUSABLE UI BADGE COMPONENT (The Missing Component!)
// ==========================================
export const Badge = ({ 
  children, 
  variant = "primary", 
  className = "", 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-150 select-none";
  
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-dark-surface text-gray-400 border border-dark-border",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    danger: "bg-error/10 text-error border border-error/20",
    ghost: "bg-transparent text-gray-500 border border-transparent"
  };

  return (
    <span 
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
};

// ==========================================
// 2. SAFE UI AVATAR COMPONENT
// ==========================================
export const Avatar = ({ src, alt = "User profile", size = "md", className = "" }) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl"
  };

  const computedSize = sizeClasses[size] || sizeClasses.md;
  const hasValidSrc = src && typeof src === 'string' && src.trim() !== "";
  
  const finalSrc = hasValidSrc 
    ? src 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=7C3AED&color=fff`;

  return (
    <div className={`relative flex-shrink-0 rounded-full bg-dark-border overflow-hidden ${computedSize} ${className}`}>
      <img
        src={finalSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=7C3AED&color=fff`;
        }}
      />
    </div>
  );
};

// ==========================================
// 3. REUSABLE UI BUTTON COMPONENT
// ==========================================
export const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  disabled = false, 
  onClick, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20",
    secondary: "bg-dark-surface text-gray-200 border border-dark-border hover:bg-dark-border",
    ghost: "bg-transparent text-gray-400 hover:bg-dark-surface hover:text-gray-200",
    danger: "bg-error text-white hover:bg-error/90 shadow-lg shadow-error/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-4 text-lg"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// ==========================================
// 4. REUSABLE UI INPUT COMPONENT
// ==========================================
export const Input = ({ 
  label, 
  placeholder, 
  type = "text", 
  className = "", 
  error, 
  ...props 
}) => {
  return (
    <div className="w-full text-left space-y-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:border-primary ${error ? 'border-error/60 focus:border-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-error font-medium pl-1">{error}</p>
      )}
    </div>
  );
};

// ==========================================
// 5. REUSABLE UI MODAL COMPONENT
// ==========================================
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  className = "" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-md bg-[#121214] border border-dark-border rounded-3xl p-6 shadow-2xl flex flex-col space-y-6 animate-scale-up ${className}`}>
        
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-gray-100">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors duration-150 p-1 rounded-lg hover:bg-dark-surface"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-gray-300 text-sm overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-dark-border">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};