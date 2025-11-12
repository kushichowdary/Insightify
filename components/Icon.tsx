import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  type?: 'solid' | 'regular' | 'brands';
}

const Icon: React.FC<IconProps> = ({ name, className, type = 'solid' }) => {
  const iconTypeClass = {
      solid: 'fa-solid',
      regular: 'fa-regular',
      brands: 'fa-brands',
  }[type];
  
  return <i className={`${iconTypeClass} fa-${name} ${className || ''}`}></i>;
};

export default Icon;