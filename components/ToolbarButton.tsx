
import React from 'react';
import type { IconName } from '../types';
import Icon from './Icon';

interface ToolbarButtonProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, onClick, isActive = false, disabled = false }) => {
  const baseClasses = 'flex flex-col items-center justify-center w-[72px] h-[72px] p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-panel)] focus:ring-[var(--color-accent)]';
  const activeClasses = 'bg-[var(--color-accent)] text-black';
  const inactiveClasses = 'text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-black';
  const disabledClasses = 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-[var(--color-text)]';

  const finalClasses = `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''}`;

  return (
    <button onClick={onClick} className={finalClasses} disabled={disabled}>
      <Icon name={icon} className="w-7 h-7 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default ToolbarButton;
