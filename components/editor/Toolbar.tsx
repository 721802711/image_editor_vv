
import React from 'react';
import type { EditMode, ViewMode } from '../../types';
import ToolbarButton from '../ToolbarButton';

interface ToolbarProps {
    viewMode: ViewMode;
    editMode: EditMode;
    isImageLoaded: boolean; // If we have an active canvas
    selectedCount: number; // How many items selected in gallery
    onUpload: () => void;
    onModeChange: (mode: EditMode) => void;
    onHome: () => void;
    onGallery: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ viewMode, editMode, isImageLoaded, selectedCount, onUpload, onModeChange, onHome, onGallery }) => {
    
    // If we are on the Home screen, we don't show the side toolbar
    if (viewMode === 'home') {
        return null;
    }

    // Logic for enabling buttons
    
    // Single Edit tools require exactly 1 image OR an active canvas loaded
    // OR multiple images selected (Batch Mode)
    const canEdit = isImageLoaded || selectedCount > 0;
    
    // Multi Edit tools (Collage) require > 1 OR active canvas (if we allow adding later, but simple logic: >0)
    const canCollage = selectedCount > 0; 
    
    // Batch requires >= 1
    const canBatch = selectedCount > 0;

    return (
        <aside className="w-24 bg-[var(--bg-panel)] flex flex-col shadow-lg z-10 border-r border-[var(--bg-secondary)] transition-colors duration-300 h-full">
            {/* Scrollable Tools Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 flex flex-col items-center space-y-4 pt-4">
                {/* Navigation / Views */}
                <ToolbarButton icon="image" label="Gallery" onClick={onGallery} isActive={viewMode === 'gallery'} />
                
                <div className="w-10 h-px bg-[var(--bg-secondary)] my-2"></div>
                
                {/* Tools */}
                <ToolbarButton icon="crop" label="Crop" onClick={() => onModeChange('crop')} disabled={!canEdit} isActive={editMode === 'crop'} />
                <ToolbarButton icon="rotate" label="Rotate" onClick={() => onModeChange('rotate')} disabled={!canEdit} isActive={editMode === 'rotate'} />
                <ToolbarButton icon="resize" label="Resize" onClick={() => onModeChange('resize')} disabled={!canEdit} isActive={editMode === 'resize'} />
                <ToolbarButton icon="grayscale" label="Grayscale" onClick={() => onModeChange('grayscale')} disabled={!canEdit} isActive={editMode === 'grayscale'} />
                <ToolbarButton icon="erase" label="Cutout" onClick={() => onModeChange('remove-bg')} disabled={!canEdit} isActive={editMode === 'remove-bg'} />
                <ToolbarButton icon="palette" label="Adjust" onClick={() => onModeChange('color-adjust')} disabled={!canEdit} isActive={editMode === 'color-adjust'} />
                
                <div className="w-10 h-px bg-[var(--bg-secondary)] my-2"></div>
                
                <ToolbarButton icon="collage" label="Collage" onClick={() => onModeChange('collage')} disabled={!canCollage} isActive={editMode === 'collage'} />
                <ToolbarButton icon="file-type" label="Converter" onClick={() => onModeChange('convert')} disabled={!canBatch} isActive={editMode === 'convert'}/>
            </div>

            {/* Fixed Bottom Area */}
            <div className="p-2 border-t border-[var(--bg-secondary)] flex flex-col items-center shrink-0 bg-[var(--bg-panel)]">
                <ToolbarButton icon="home" label="Home" onClick={onHome} />
            </div>
        </aside>
    );
};

export default Toolbar;
