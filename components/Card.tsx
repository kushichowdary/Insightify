
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-light-surface/80 dark:bg-dark-surface backdrop-blur-xl border border-light-border dark:border-dark-border rounded-2xl shadow-lg dark:shadow-black/20 p-6 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-xl dark:hover:shadow-glow-magenta ${className}`}>
      {children}
    </div>
  );
};

export default Card;