import React from 'react';
import type { EditMode } from '../../types';
import ToolbarButton from '../ToolbarButton';

interface ToolbarProps {
    editMode: EditMode;
    isImageLoaded: boolean;
    onUpload: () => void;
    onModeChange: (mode: EditMode) => void;
    onHome: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ editMode, isImageLoaded, onUpload, onModeChange, onHome }) => {
    return (
        <aside className="w-24 bg-[var(--bg-panel)] flex flex-col shadow-lg z-10 border-r border-[var(--bg-secondary)] transition-colors duration-300 h-full">
            {/* Scrollable Tools Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 flex flex-col items-center space-y-4">
                <ToolbarButton icon="upload" label="Upload" onClick={onUpload} />
                <ToolbarButton icon="crop" label="Crop" onClick={() => onModeChange('crop')} disabled={!isImageLoaded} isActive={editMode === 'crop'} />
                <ToolbarButton icon="rotate" label="Rotate" onClick={() => onModeChange('rotate')} disabled={!isImageLoaded} isActive={editMode === 'rotate'} />
                <ToolbarButton icon="resize" label="Resize" onClick={() => onModeChange('resize')} disabled={!isImageLoaded} isActive={editMode === 'resize'} />
                <ToolbarButton icon="grayscale" label="Grayscale" onClick={() => onModeChange('grayscale')} disabled={!isImageLoaded} isActive={editMode === 'grayscale'} />
                <ToolbarButton icon="erase" label="Cutout" onClick={() => onModeChange('remove-bg')} disabled={!isImageLoaded} isActive={editMode === 'remove-bg'} />
                <ToolbarButton icon="palette" label="Adjust" onClick={() => onModeChange('color-adjust')} disabled={!isImageLoaded} isActive={editMode === 'color-adjust'} />
                <ToolbarButton icon="collage" label="Collage" onClick={() => onModeChange('collage')} isActive={editMode === 'collage'} />
                <ToolbarButton icon="file-type" label="Converter" onClick={() => onModeChange('convert')} disabled={!isImageLoaded} isActive={editMode === 'convert'}/>
            </div>

            {/* Fixed Bottom Area */}
            <div className="p-2 border-t border-[var(--bg-secondary)] flex flex-col items-center shrink-0 bg-[var(--bg-panel)]">
                <ToolbarButton icon="home" label="Home" onClick={onHome} />
            </div>
        </aside>
    );
};

export default Toolbar;