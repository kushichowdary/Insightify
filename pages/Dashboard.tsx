
import React from 'react';
import MagicBento from '../components/MagicBento';

interface DashboardProps {
    onTabChange: (tabId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  return (
    <div className="w-full min-h-full flex items-center justify-center">
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
  );
};

export default Dashboard;