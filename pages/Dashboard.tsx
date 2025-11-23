import React from 'react';
import MagicBento from '../components/MagicBento';
import ScrambledText from '../components/ScrambledText';
import Squares from '../components/Squares';
import { AccentColor, Theme } from '../types';

interface DashboardProps {
    onTabChange: (tabId: string) => void;
    accentColor: AccentColor | null;
    theme: Theme;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange, accentColor, theme }) => {
  const titleStyle: React.CSSProperties = {
    color: accentColor ? accentColor.main : 'var(--color-primary)',
    textShadow: `0 0 25px ${accentColor ? accentColor.glow : 'var(--color-primary-glow)'}`
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Squares theme={theme} />
      </div>
      <div className="relative z-10 w-full flex flex-col items-center justify-center gap-12 animate-float p-4">
        <ScrambledText 
          className="!text-5xl md:!text-7xl !font-bold text-center !m-0"
          style={titleStyle}
          radius={200}
          scrambleChars='*<>/'
        >
          Sentilytics
        </ScrambledText>
        <MagicBento 
          onTabChange={onTabChange}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
        />
      </div>
    </div>
  );
};

export default Dashboard;
