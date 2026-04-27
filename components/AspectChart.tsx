
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { AspectSentiment } from '../types';

interface AspectChartProps {
  aspects: AspectSentiment[];
}

const AspectChart: React.FC<AspectChartProps> = ({ aspects }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={aspects}>
          <PolarGrid stroke="var(--color-border)" opacity={0.3} />
          <PolarAngleAxis 
            dataKey="aspect" 
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AspectChart;
