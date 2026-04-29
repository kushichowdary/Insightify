
import React from 'react';
import { WordCloudItem } from '../types';

interface WordCloudProps {
  words: WordCloudItem[];
}

const WordCloud: React.FC<WordCloudProps> = ({ words = [] }) => {
  if (!words || words.length === 0) return <div className="text-light-text-secondary dark:text-dark-text-secondary text-sm p-4">No word cloud data available.</div>;
  
  // Normalize sizes
  const sMax = Math.max(...words.map(w => w.value));
  const sMin = Math.min(...words.map(w => w.value));

  const getSize = (value: number) => {
    if (sMax === sMin) return 'text-sm';
    const normalized = (value - sMin) / (sMax - sMin);
    if (normalized > 0.8) return 'text-2xl font-bold';
    if (normalized > 0.6) return 'text-xl font-semibold';
    if (normalized > 0.4) return 'text-lg font-medium';
    if (normalized > 0.2) return 'text-base';
    return 'text-sm';
  };

  const getOpacity = (value: number) => {
    const normalized = (value - sMin) / (sMax - sMin);
    return 0.4 + (normalized * 0.6);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 p-4">
      {words.map((word, idx) => (
        <span 
          key={idx}
          className={`${getSize(word.value)} transition-all duration-300 hover:text-brand-primary cursor-default select-none`}
          style={{ 
            opacity: getOpacity(word.value),
            color: idx % 3 === 0 ? 'var(--color-primary)' : 'inherit'
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};

export default WordCloud;
