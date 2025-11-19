
import React, { useRef, useEffect, useState } from 'react';
import type { EditMode } from '../../types';
import Icon from '../Icon';

interface MainContentProps {
    editMode: EditMode;
    isProcessing: boolean;
    currentImage: HTMLImageElement | null;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    onCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    onUploadClick: () => void;
    collageImages: HTMLImageElement[];
    onAddCollageImagesClick: () => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    // Crop props
    cropRect: { x: number, y: number, width: number, height: number } | null;
    onCropRectChange: (rect: { x: number, y: number, width: number, height: number }) => void;
    onCropDoubleClick?: () => void;
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
        e.stopPropagation(); // Prevent parent from panning
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
                // Resize logic
                if (dragHandle.includes('w')) {
                    newRect.x = startRect.x + deltaX;
                    newRect.width = startRect.width - deltaX;
                }
                if (dragHandle.includes('e')) {
                    newRect.width = startRect.width + deltaX;
                }
                if (dragHandle.includes('n')) {
                    newRect.y = startRect.y + deltaY;
                    newRect.height = startRect.height - deltaY;
                }
                if (dragHandle.includes('s')) {
                    newRect.height = startRect.height + deltaY;
                }
            }

            // Constraints
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
             // Correct negative width/height if flipping
             if (newRect.width < 0) {
                 newRect.x = newRect.x + newRect.width;
                 newRect.width = Math.abs(newRect.width);
             }
             if (newRect.height < 0) {
                 newRect.y = newRect.y + newRect.height;
                 newRect.height = Math.abs(newRect.height);
             }


            onChange(newRect);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setDragHandle(null);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragHandle, startPos, startRect, imageWidth, imageHeight, onChange]);


    return (
        <div
            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] box-border"
            style={{
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                cursor: 'move'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (onDoubleClick) onDoubleClick();
            }}
        >
            {/* Grid Lines */}
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white opacity-30 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-1/3 w-px bg-white opacity-30 pointer-events-none" />
            <div className="absolute left-0 right-0 top-1/3 h-px bg-white opacity-30 pointer-events-none" />
            <div className="absolute left-0 right-0 bottom-1/3 h-px bg-white opacity-30 pointer-events-none" />

            {/* Handles */}
            {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((pos) => (
                <div
                    key={pos}
                    className="absolute w-3 h-3 bg-[var(--color-accent)] border border-white rounded-full"
                    style={{
                        cursor: `${pos}-resize`,
                        top: pos.includes('n') ? '-6px' : pos.includes('s') ? 'calc(100% - 6px)' : 'calc(50% - 6px)',
                        left: pos.includes('w') ? '-6px' : pos.includes('e') ? 'calc(100% - 6px)' : 'calc(50% - 6px)',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, pos)}
                />
            ))}
        </div>
    );
};


const MainContent: React.FC<MainContentProps> = ({
    editMode,
    isProcessing,
    currentImage,
    canvasRef,
    onCanvasClick,
    onUploadClick,
    collageImages,
    onAddCollageImagesClick,
    zoom,
    onZoomChange,
    cropRect,
    onCropRectChange,
    onCropDoubleClick
}) => {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Reset pan when image changes
    useEffect(() => {
        setPan({ x: 0, y: 0 });
    }, [currentImage]);

    const handleWheel = (e: React.WheelEvent) => {
        // Prevent default page scroll behavior if needed, though React synthetic events handle this generally
        // We zoom based on deltaY
        const sensitivity = 0.1;
        const delta = -e.deltaY * sensitivity;
        
        // Calculate new zoom
        let newZoom = zoom + delta;
        
        // Clamp zoom levels
        newZoom = Math.min(Math.max(newZoom, 10), 500);
        
        onZoomChange(newZoom);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only left click (button 0) starts dragging
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

    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    return (
        <main className="flex-1 bg-[var(--bg-app)] flex flex-col items-center justify-center p-4 overflow-hidden relative transition-colors duration-300">
            {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-accent)]"></div>
                </div>
            )}
            {editMode === 'collage' ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="mb-4">
                        <button onClick={onAddCollageImagesClick} className="flex items-center gap-2 bg-[var(--color-accent)] hover:opacity-90 text-black font-bold py-2 px-4 rounded-md transition-opacity">
                            <Icon name="add" /> Add Images
                        </button>
                    </div>
                    <div className="flex-1 w-full bg-[var(--bg-panel)]/50 rounded-lg p-4 overflow-y-auto flex flex-wrap gap-4 justify-center content-start">
                        {collageImages.length === 0 && <p className="text-[var(--color-text)]">Upload images to start building your collage.</p>}
                        {collageImages.map((img, index) => (
                            <img key={index} src={img.src} alt={`collage-thumb-${index}`} className="h-24 w-auto object-contain rounded-md border-2 border-[var(--bg-panel)]" />
                        ))}
                    </div>
                </div>
            ) : !currentImage ? (
                <div className="text-center">
                    <button onClick={onUploadClick} className="flex flex-col items-center gap-4 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
                        <Icon name="upload" className="w-24 h-24" />
                        <span className="text-xl font-semibold">Click to upload an image</span>
                    </button>
                    <p className="mt-4 text-[var(--color-text)] opacity-70">or start by creating a collage.</p>
                </div>
            ) : (
                <>
                    {editMode === 'remove-bg' && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[var(--bg-panel)] text-[var(--color-text)] py-1 px-3 rounded-md text-sm z-10 pointer-events-none border border-[var(--bg-secondary)]">
                            Click on a color in the image to remove it.
                        </div>
                    )}
                    
                    {/* Viewport Container */}
                    <div 
                        className={`w-full h-full overflow-hidden relative flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div 
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                                transformOrigin: 'center center', // Zoom from center of image
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                width: currentImage.width,
                                height: currentImage.height,
                                position: 'absolute'
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                onClick={onCanvasClick}
                                className={`block w-full h-full ${editMode === 'remove-bg' ? 'cursor-crosshair' : ''}`}
                                style={{
                                    // Updated checkerboard pattern to #ffffff and #cccccc
                                    backgroundImage: 'conic-gradient(#ffffff 0.25turn, #cccccc 0.25turn 0.5turn, #ffffff 0.5turn 0.75turn, #cccccc 0.75turn)',
                                    backgroundSize: '20px 20px'
                                }}
                            />
                            
                            {editMode === 'crop' && cropRect && (
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

                    {/* Zoom Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xs bg-[var(--bg-panel)] bg-opacity-90 p-2 rounded-lg shadow-lg flex items-center gap-3 z-30 border border-[var(--bg-secondary)]">
                        <span className="text-xs text-[var(--color-text)] w-10 text-center">{Math.round(zoom)}%</span>
                        <input
                            type="range"
                            min="10"
                            max="500"
                            step="1"
                            value={zoom}
                            onChange={(e) => onZoomChange(Number(e.target.value))}
                            className="w-full h-1.5 bg-[var(--bg-app)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                        />
                        <button 
                            onClick={() => { onZoomChange(100); setPan({x:0, y:0}); }}
                            className="text-xs text-[var(--color-accent)] hover:opacity-80 font-medium whitespace-nowrap"
                        >
                            Reset
                        </button>
                    </div>
                </>
            )}
        </main>
    );
};

export default MainContent;
