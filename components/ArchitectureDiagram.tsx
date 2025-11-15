
import React from 'react';
import Icon from './Icon';

const ArchitectureDiagram: React.FC = () => {
  const Node: React.FC<{ icon: string; title: string; subtitle: string; color: string; }> = ({ icon, title, subtitle, color }) => (
    <div className="flex flex-col items-center space-y-1">
      <div className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-${color}-500/20`}>
        <Icon name={icon} className={`text-${color}-400 text-2xl sm:text-3xl`}/>
      </div>
      <p>{title}</p>
      <p className="text-xs text-brand-text-secondary font-normal">{subtitle}</p>
    </div>
  );

  return (
    <div className="p-4 bg-brand-surface rounded-lg border border-brand-border animate-fade-in-up">
        <div className="flex justify-around items-center text-center text-xs sm:text-sm font-semibold text-brand-text">
            
            <Node icon="desktop" title="Frontend" subtitle="(React)" color="blue" />
            
            <Icon name="long-arrow-alt-right" className="text-gray-600 text-2xl mx-1 sm:mx-2 flex-shrink-0"/>

            <Node icon="server" title="Backend API" subtitle="(Node/Python)" color="purple" />

            <Icon name="long-arrow-alt-right" className="text-gray-600 text-2xl mx-1 sm:mx-2 flex-shrink-0"/>

            <Node icon="robot" title="Gemini API" subtitle="(AI Model)" color="green" />

            <div className="hidden sm:flex items-center">
                 <Icon name="long-arrow-alt-right" className="text-gray-600 text-2xl mx-1 sm:mx-2 flex-shrink-0"/>
                 <Node icon="database" title="Database" subtitle="(SQL/NoSQL)" color="yellow" />
            </div>
        </div>
    </div>
  );
};

export default ArchitectureDiagram;
