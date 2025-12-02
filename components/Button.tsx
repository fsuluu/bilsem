import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, color = 'bg-blue-500', className = '', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${color} text-white font-bold py-4 px-8 rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.1)] 
        active:shadow-[0_2px_0_rgba(0,0,0,0.1)] active:translate-y-1 transition-all
        text-2xl tracking-wide disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;