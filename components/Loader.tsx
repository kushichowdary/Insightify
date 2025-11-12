
import React from 'react';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Analyzing... Please wait' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 backdrop-blur-sm">
      <div className="bg-light-surface dark:bg-slate-800/80 rounded-lg p-8 text-center shadow-xl flex flex-col items-center border border-light-border dark:border-dark-border">
        <div className="w-12 h-12 border-4 border-light-border dark:border-slate-600 border-t-brand-primary rounded-full animate-spin mb-4"></div>
        <p className="text-light-text dark:text-dark-text font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loader;