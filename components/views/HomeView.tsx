
import React from 'react';
import type { EditMode, IconName } from '../../types';
import Icon from '../Icon';

interface FeatureCardProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  primary?: boolean;
}
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, label, onClick, primary }) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl transition-all duration-200 focus:outline-none
        ${primary 
            ? 'bg-[var(--color-accent)] text-black hover:opacity-90 hover:ring-4 hover:ring-[var(--color-accent)]/30' 
            : 'bg-[var(--bg-secondary)] text-[var(--color-text)] hover:bg-[var(--bg-panel)] hover:ring-2 hover:ring-[var(--color-accent)]'}
        `}
    >
        <Icon name={icon} className="w-12 h-12 mb-3 opacity-80" />
        <span className="text-lg font-medium">{label}</span>
    </button>
);

interface HomeViewProps {
    onSelection: (selection: 'gallery' | EditMode) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onSelection }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center font-sans bg-[var(--bg-app)] text-[var(--color-text)] py-10 overflow-y-auto transition-colors duration-300">
            <h1 className="text-4xl font-bold mb-4">Image Editor</h1>
            <p className="text-lg opacity-70 mb-10">Select a task to get started</p>
            
            {/* Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-6 max-w-7xl">
                {/* Gallery - Primary Action */}
                <FeatureCard icon="image" label="Gallery" onClick={() => onSelection('gallery')} primary />
                
                {/* Multi-Image Tools */}
                <FeatureCard icon="collage" label="Collage" onClick={() => onSelection('collage')} />
                <FeatureCard icon="file-type" label="Converter" onClick={() => onSelection('convert')} />

                {/* Single-Image Tools */}
                <FeatureCard icon="crop" label="Crop" onClick={() => onSelection('crop')} />
                <FeatureCard icon="rotate" label="Rotate" onClick={() => onSelection('rotate')} />
                <FeatureCard icon="resize" label="Resize" onClick={() => onSelection('resize')} />
                <FeatureCard icon="grayscale" label="Grayscale" onClick={() => onSelection('grayscale')} />
                <FeatureCard icon="erase" label="Cutout" onClick={() => onSelection('remove-bg')} />
                <FeatureCard icon="palette" label="Adjust" onClick={() => onSelection('color-adjust')} />
            </div>
        </div>
    );
};

export default HomeView;
