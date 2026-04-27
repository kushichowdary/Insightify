
import React from 'react';
import Icon from './Icon';

interface FakeReviewGaugeProps {
  probability: number;
}

const FakeReviewGauge: React.FC<FakeReviewGaugeProps> = ({ probability }) => {
  const isHigh = probability > 60;
  const isMedium = probability > 30 && probability <= 60;

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-light-border dark:border-dark-border">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-200 dark:text-slate-800"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (251.2 * probability) / 100}
            className={`transition-all duration-1000 ease-out ${
              isHigh ? 'text-red-500' : isMedium ? 'text-amber-500' : 'text-emerald-500'
            }`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-lg font-bold">{probability}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
          Suspicious Activity
        </p>
        <div className={`mt-1 flex items-center justify-center gap-1 text-sm font-bold ${
          isHigh ? 'text-red-500' : isMedium ? 'text-amber-500' : 'text-emerald-500'
        }`}>
          <Icon name={isHigh ? 'exclamation-triangle' : isMedium ? 'info-circle' : 'check-circle'} />
          {isHigh ? 'High Risk' : isMedium ? 'Moderate Risk' : 'Low Risk'}
        </div>
      </div>
    </div>
  );
};

export default FakeReviewGauge;
