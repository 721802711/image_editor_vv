
import React from 'react';
import Icon from '../Icon';

interface HeaderProps {
    onCancel: () => void;
    onUndo: () => void;
    onDownload: () => void;
    onSave: () => void;
    imageName: string;
    isImageLoaded: boolean;
    historyIndex: number;
    onOpenSettings: () => void;
    isBatchMode?: boolean;
    onBackToBatch?: () => void;
    onBatchDownload?: () => void;
    hasSelection?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    onCancel, 
    onUndo, 
    onDownload, 
    onSave, 
    imageName, 
    isImageLoaded, 
    historyIndex, 
    onOpenSettings, 
    isBatchMode, 
    onBackToBatch,
    onBatchDownload,
    hasSelection
}) => {
    return (
        <header className="bg-[var(--bg-panel)] h-20 flex items-center justify-between px-6 text-[var(--color-text)] border-b border-[var(--bg-secondary)] z-20 flex-shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-4">
                {isBatchMode && onBackToBatch ? (
                    <button onClick={onBackToBatch} className="flex items-center gap-2 text-base px-4 py-2 rounded hover:bg-[var(--bg-secondary)] transition-colors font-medium text-[var(--color-accent)]">
                         <Icon name="layers" className="w-5 h-5" />
                         Back to Batch
                    </button>
                ) : (
                    <button onClick={onCancel} className="text-base px-4 py-2 rounded hover:bg-[var(--bg-secondary)] transition-colors">Cancel</button>
                )}
                
                <div className="w-px h-10 bg-[var(--bg-secondary)] mx-2"></div>
                <button onClick={onUndo} disabled={historyIndex <= 0} className="p-3 rounded-full hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors">
                    <Icon name="undo" className="w-6 h-6" />
                </button>
            </div>
            <div className="text-base text-[var(--color-text)] truncate max-w-sm opacity-70" title={imageName}>
                {isImageLoaded && imageName ? imageName : 'No Image Loaded'}
            </div>
            <div className="flex items-center gap-6">
                {isBatchMode && onBatchDownload && (
                     <button 
                        onClick={onBatchDownload} 
                        disabled={!hasSelection}
                        title="Download Selected" 
                        className="p-3 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
                     >
                        <Icon name="download" className="w-6 h-6" />
                     </button>
                )}
                
                {!isBatchMode && (
                    <button onClick={onDownload} disabled={!isImageLoaded} title="Download File" className="p-3 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
                        <Icon name="download" className="w-6 h-6" />
                    </button>
                )}
                {!isBatchMode && (
                    <button
                        onClick={onSave}
                        disabled={!isImageLoaded}
                        className={`flex items-center gap-3 text-base px-4 py-2 rounded-md font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-[var(--color-accent)] text-black hover:opacity-90`}
                    >
                        <Icon name="save" className="w-6 h-6" />
                        <span>Save</span>
                    </button>
                )}
                <button 
                    onClick={onOpenSettings} 
                    className="p-3 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
                    title="Theme Settings"
                >
                    <Icon name="settings" className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};

export default Header;
