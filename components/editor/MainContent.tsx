
import React, { useRef, useEffect, useState } from 'react';
import type { EditMode, BatchImage, ViewMode } from '../../types';
import Icon from '../Icon';
import HomeView from '../views/HomeView';

interface MainContentProps {
    view: ViewMode;
    editMode: EditMode;
    isProcessing: boolean;
    
    // Editor Canvas Props
    currentImage: HTMLImageElement | null;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    onCanvasClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    
    // Crop Props
    cropRect: { x: number, y: number, width: number, height: number } | null;
    onCropRectChange: (rect: { x: number, y: number, width: number, height: number }) => void;
    onCropDoubleClick?: () => void;
    
    // Gallery/Batch Props
    batchImages: BatchImage[];
    selectedIds: Set<string>;
    onSelectImage: (id: string, multi: boolean) => void;
    onSelectAll: () => void;
    onRemoveImage: (id: string) => void;
    onEditImage: (id: string) => void;
    onAddImages: () => void;

    // Collage Images (Rendered if in collage mode)
    collageImages: HTMLImageElement[];
    
    // Navigation Props
    onHomeNavigation: (mode: 'gallery' | EditMode) => void;
}

const CropOverlay: React.FC<{
    rect: { x: number, y: number, width: number, height: number };
    imageWidth: number;
    imageHeight: number;
    onChange: (rect: { x: number, y: number, width: number, height: number }) => void;
    onDoubleClick?: () => void;
}> = ({ rect, imageWidth, imageHeight, onChange, onDoubleClick }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragHandle, setDragHandle] = useState<string | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startRect, setStartRect] = useState(rect);

    const handleMouseDown = (e: React.MouseEvent, handle: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragHandle(handle);
        setStartPos({ x: e.clientX, y: e.clientY });
        setStartRect(rect);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startPos.x;
            const deltaY = e.clientY - startPos.y;
            let newRect = { ...startRect };

            if (dragHandle === 'move') {
                newRect.x = startRect.x + deltaX;
                newRect.y = startRect.y + deltaY;
            } else if (dragHandle) {
                if (dragHandle.includes('w')) { newRect.x = startRect.x + deltaX; newRect.width = startRect.width - deltaX; }
                if (dragHandle.includes('e')) { newRect.width = startRect.width + deltaX; }
                if (dragHandle.includes('n')) { newRect.y = startRect.y + deltaY; newRect.height = startRect.height - deltaY; }
                if (dragHandle.includes('s')) { newRect.height = startRect.height + deltaY; }
            }

            if (newRect.width < 20) newRect.width = 20;
            if (newRect.height < 20) newRect.height = 20;
            if (newRect.x < 0) newRect.x = 0;
            if (newRect.y < 0) newRect.y = 0;
            if (newRect.x + newRect.width > imageWidth) {
                if (dragHandle === 'move') newRect.x = imageWidth - newRect.width;
                else newRect.width = imageWidth - newRect.x;
            }
            if (newRect.y + newRect.height > imageHeight) {
                if (dragHandle === 'move') newRect.y = imageHeight - newRect.height;
                else newRect.height = imageHeight - newRect.y;
            }
             if (newRect.width < 0) { newRect.x += newRect.width; newRect.width = Math.abs(newRect.width); }
             if (newRect.height < 0) { newRect.y += newRect.height; newRect.height = Math.abs(newRect.height); }

            onChange(newRect);
        };

        const handleMouseUp = () => { setIsDragging(false); setDragHandle(null); };
        if (isDragging) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [isDragging, dragHandle, startPos, startRect, imageWidth, imageHeight, onChange]);

    return (
        <div className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] box-border"
            style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height, cursor: 'move' }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            onDoubleClick={(e) => { e.stopPropagation(); if (onDoubleClick) onDoubleClick(); }}>
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white opacity-30 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-1/3 w-px bg-white opacity-30 pointer-events-none" />
            <div className="absolute left-0 right-0 top-1/3 h-px bg-white opacity-30 pointer-events-none" />
            <div className="absolute left-0 right-0 bottom-1/3 h-px bg-white opacity-30 pointer-events-none" />
            {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((pos) => (
                <div key={pos} className="absolute w-3 h-3 bg-[var(--color-accent)] border border-white rounded-full"
                    style={{ cursor: `${pos}-resize`, top: pos.includes('n') ? '-6px' : pos.includes('s') ? 'calc(100% - 6px)' : 'calc(50% - 6px)', left: pos.includes('w') ? '-6px' : pos.includes('e') ? 'calc(100% - 6px)' : 'calc(50% - 6px)' }}
                    onMouseDown={(e) => handleMouseDown(e, pos)} />
            ))}
        </div>
    );
};


const MainContent: React.FC<MainContentProps> = ({
    view,
    editMode,
    isProcessing,
    currentImage,
    canvasRef,
    onCanvasClick,
    zoom,
    onZoomChange,
    cropRect,
    onCropRectChange,
    onCropDoubleClick,
    batchImages,
    selectedIds,
    onSelectImage,
    onSelectAll,
    onRemoveImage,
    onEditImage,
    onAddImages,
    onHomeNavigation
}) => {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => { setPan({ x: 0, y: 0 }); }, [currentImage]);

    const handleWheel = (e: React.WheelEvent) => {
        const sensitivity = 0.1;
        const delta = -e.deltaY * sensitivity;
        let newZoom = zoom + delta;
        newZoom = Math.min(Math.max(newZoom, 10), 500);
        onZoomChange(newZoom);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => { setIsDragging(false); };

    if (view === 'home') {
        return (
             <main className="flex-1 bg-[var(--bg-app)] overflow-hidden relative transition-colors duration-300">
                <HomeView onSelection={onHomeNavigation} />
             </main>
        );
    }

    // --- Render Gallery View ---
    if (view === 'gallery') {
        return (
            <main className="flex-1 bg-[var(--bg-app)] flex flex-col p-6 overflow-hidden relative transition-colors duration-300">
                 {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 rounded-lg">
                        <div className="flex flex-col items-center gap-3 bg-[var(--bg-panel)] p-6 rounded-lg border border-[var(--color-accent)]">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-accent)]"></div>
                            <span className="text-[var(--color-text)] font-medium">Processing...</span>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-[var(--color-text)]">
                            {editMode === 'none' ? 'Gallery' : `Gallery - Select Images for ${editMode}`}
                        </h2>
                        <span className="text-sm text-[var(--color-text)] opacity-60">
                            {batchImages.length} items ({selectedIds.size} selected)
                        </span>
                        {batchImages.length > 0 && (
                            <button onClick={onSelectAll} className="text-xs text-[var(--color-accent)] hover:underline ml-2">
                                {selectedIds.size === batchImages.length ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>
                    <button onClick={onAddImages} className="flex items-center gap-2 bg-[var(--color-accent)] hover:opacity-90 text-black font-bold py-2 px-4 rounded-md transition-opacity shadow-lg">
                        <Icon name="add" /> Add Images
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-[var(--bg-panel)] rounded-xl border border-[var(--bg-secondary)] p-4 custom-scrollbar">
                     {batchImages.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center opacity-50 text-[var(--color-text)]">
                             <Icon name="image" className="w-20 h-20 mb-6 opacity-50" />
                             <p className="text-lg font-medium">No images yet</p>
                             <p className="text-sm mt-2">Click "Add Images" to upload assets to your Gallery</p>
                         </div>
                     ) : (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                             {batchImages.map(img => {
                                 const isSelected = selectedIds.has(img.id);
                                 
                                 // Extract extension for display
                                 let ext = 'png';
                                 if (img.currentFormat === 'image/jpeg') ext = 'jpg';
                                 else if (img.currentFormat === 'image/webp') ext = 'webp';
                                 else if (img.currentFormat === 'image/avif') ext = 'avif';
                                 else if (img.currentFormat === 'image/bmp') ext = 'bmp';
                                 else if (img.currentFormat === 'image/x-icon') ext = 'ico';
                                 else if (img.currentFormat === 'image/tiff') ext = 'tiff';
                                 else if (img.currentFormat === 'image/svg+xml') ext = 'svg';
                                 
                                 return (
                                     <div 
                                        key={img.id} 
                                        onClick={(e) => {
                                            // Simple click selects only this one, Ctrl/Shift allows multi
                                            onSelectImage(img.id, e.ctrlKey || e.metaKey || e.shiftKey);
                                        }}
                                        className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer
                                            ${isSelected ? 'border-[var(--color-accent)] bg-[var(--bg-secondary)] shadow-[0_0_10px_rgba(0,0,0,0.5)]' : 'border-transparent hover:border-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]'}
                                        `}
                                     >
                                         <div className="aspect-square relative bg-[var(--bg-app)] m-1 rounded overflow-hidden">
                                             <img src={img.processedUrl || img.previewUrl} alt={img.file.name} className="w-full h-full object-contain" />
                                             
                                             {/* Selection Icon (Square Checkbox) */}
                                             <div 
                                                className="absolute top-2 left-2 z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectImage(img.id, true);
                                                }}
                                             >
                                                  <Icon 
                                                     name={isSelected ? 'checkbox-on' : 'checkbox-off'} 
                                                     className={`w-6 h-6 transition-colors duration-200 drop-shadow-md
                                                         ${isSelected ? 'text-[var(--color-accent)]' : 'text-white/70 hover:text-white'}
                                                     `}
                                                  />
                                             </div>

                                             {/* Top Right: Format Tag */}
                                             <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                                                 <span className="bg-[var(--color-accent)] text-black text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shadow-sm border border-black/20">
                                                     {ext}
                                                 </span>
                                             </div>
                                         </div>
                                         
                                         <div className="p-2 flex items-center justify-between">
                                             <div className="truncate flex-1 pr-2 flex flex-col">
                                                 <p className={`text-xs font-medium truncate ${isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`} title={img.file.name}>{img.file.name}</p>
                                                 <p className="text-[10px] opacity-60">{Math.round(img.currentWidth)} × {Math.round(img.currentHeight)}</p>
                                             </div>
                                             <div className="flex gap-1">
                                                 <button 
                                                     onClick={(e) => { e.stopPropagation(); onEditImage(img.id); }}
                                                     className="text-[var(--color-text)] hover:text-[var(--color-accent)] p-1 rounded hover:bg-[var(--bg-panel)]"
                                                     title="Edit"
                                                 >
                                                     <Icon name="pencil" className="w-4 h-4" />
                                                 </button>
                                                 <button 
                                                     onClick={(e) => { e.stopPropagation(); onRemoveImage(img.id); }}
                                                     className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/30"
                                                     title="Remove"
                                                 >
                                                     <Icon name="trash" className="w-4 h-4" />
                                                 </button>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                     )}
                </div>
            </main>
        );
    }

    // --- Render Canvas Editor View ---
    return (
        <main className="flex-1 bg-[var(--bg-app)] flex flex-col items-center justify-center p-4 overflow-hidden relative transition-colors duration-300">
            {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-accent)]"></div>
                </div>
            )}
            
            {!currentImage && editMode !== 'collage' ? (
                <div className="text-[var(--color-text)] opacity-50">No Image Loaded</div>
            ) : (
                <>
                    {editMode === 'remove-bg' && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[var(--bg-panel)] text-[var(--color-text)] py-1 px-3 rounded-md text-sm z-10 pointer-events-none border border-[var(--bg-secondary)] shadow-lg">
                            Click to pick transparent color
                        </div>
                    )}
                    
                    <div 
                        className={`w-full h-full overflow-hidden relative flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => setIsDragging(false)}
                    >
                        <div 
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                                transformOrigin: 'center center',
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                width: currentImage ? currentImage.width : 800,
                                height: currentImage ? currentImage.height : 600,
                                position: 'absolute'
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                onClick={onCanvasClick}
                                className={`block w-full h-full ${editMode === 'remove-bg' ? 'cursor-crosshair' : ''} shadow-2xl`}
                                style={{
                                    backgroundImage: 'conic-gradient(#ffffff 0.25turn, #cccccc 0.25turn 0.5turn, #ffffff 0.5turn 0.75turn, #cccccc 0.75turn)',
                                    backgroundSize: '20px 20px'
                                }}
                            />
                            
                            {editMode === 'crop' && cropRect && currentImage && (
                                <CropOverlay 
                                    rect={cropRect} 
                                    imageWidth={currentImage.width} 
                                    imageHeight={currentImage.height} 
                                    onChange={onCropRectChange} 
                                    onDoubleClick={onCropDoubleClick}
                                />
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--bg-panel)]/90 p-2 rounded-lg shadow-lg flex items-center gap-3 z-30 border border-[var(--bg-secondary)] backdrop-blur-sm">
                        <button onClick={() => onZoomChange(Math.max(10, zoom - 10))} className="text-[var(--color-text)] hover:text-[var(--color-accent)]">-</button>
                        <span className="text-xs text-[var(--color-text)] w-10 text-center font-mono">{Math.round(zoom)}%</span>
                        <button onClick={() => onZoomChange(Math.min(500, zoom + 10))} className="text-[var(--color-text)] hover:text-[var(--color-accent)]">+</button>
                        <div className="w-px h-4 bg-[var(--color-text)]/20 mx-1"></div>
                        <button 
                            onClick={() => { onZoomChange(100); setPan({x:0, y:0}); }}
                            className="text-xs text-[var(--color-accent)] hover:underline whitespace-nowrap"
                        >
                            Reset View
                        </button>
                    </div>
                </>
            )}
        </main>
    );
};

export default MainContent;
