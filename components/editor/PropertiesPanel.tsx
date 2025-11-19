import React from 'react';
import type { EditMode, CollageLayoutType, IconName } from '../../types';
import Icon from '../Icon';

// A generic panel wrapper
const PanelWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="flex flex-col space-y-4 h-full">
        <h3 className="text-lg font-bold text-center text-[var(--color-text)]">{title}</h3>
        {children}
    </div>
);

const SliderControl: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (newValue: number) => void;
}> = ({ label, value, min, max, onChange }) => (
    <div className="flex items-center justify-between text-sm text-[var(--color-text)] gap-3">
        <label className="w-20 shrink-0">{label}</label>
        {/* Updated: bg-secondary -> bg-panel for input background */}
        <div className="bg-[var(--bg-panel)] rounded-md w-16 text-center">
            <input
                type="number"
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full bg-transparent text-center p-1 focus:outline-none"
                min={min}
                max={max}
            />
        </div>
        {/* Updated: bg-app -> bg-panel for slider track */}
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg-panel)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
        />
    </div>
);

const ConvertPanel: React.FC<{
    format: string;
    onFormatChange: (f: string) => void;
    quality: number;
    onQualityChange: (q: number) => void;
    onExport: () => void;
}> = ({ format, onFormatChange, quality, onQualityChange, onExport }) => {
    const formats = [
        { label: 'PNG', value: 'image/png' },
        { label: 'JPEG', value: 'image/jpeg' },
        { label: 'WEBP', value: 'image/webp' },
    ];

    return (
        <PanelWrapper title="Format Conversion">
             <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-6">
                <div>
                    <p className="text-sm text-[var(--color-text)] mb-3 font-medium">Output Format</p>
                    <div className="grid grid-cols-3 gap-2">
                        {formats.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => onFormatChange(f.value)}
                                className={`py-2 px-1 rounded text-xs font-medium transition-colors ${
                                    format === f.value
                                        ? 'bg-[var(--color-accent)] text-black'
                                        : 'bg-[var(--bg-panel)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-black'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {format !== 'image/png' && (
                    <div className="pt-4 border-t border-[var(--bg-panel)]">
                        <p className="text-sm text-[var(--color-text)] mb-3 font-medium">Quality</p>
                         <SliderControl 
                            label="Quality" 
                            value={Math.round(quality * 100)} 
                            min={1} 
                            max={100} 
                            onChange={(val) => onQualityChange(val / 100)} 
                        />
                    </div>
                )}
            </div>

            <div className="flex-grow"></div>
            <button 
                onClick={onExport}
                className="w-full flex justify-center items-center gap-2 bg-[var(--color-accent)] hover:opacity-90 text-black font-bold py-3 px-4 rounded-md transition-opacity"
            >
                <Icon name="download" className="w-5 h-5" />
                Export Image
            </button>
        </PanelWrapper>
    )
};


// Panel for Crop
const CropPanel: React.FC<{
    onApplyCrop: () => void;
    setAspectRatio: (ratio: number | null) => void;
}> = ({ onApplyCrop, setAspectRatio }) => {
    
    const ratioButtons: { label: string; ratio: number | null; icon: IconName }[] = [
        { label: 'Free', ratio: null, icon: 'ratio-free' },
        { label: '1:1', ratio: 1, icon: 'ratio-1-1' },
        { label: '16:9', ratio: 16/9, icon: 'ratio-16-9' },
        { label: '4:3', ratio: 4/3, icon: 'ratio-4-3' },
    ];

    return (
        <PanelWrapper title="Crop Image">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-4">
                {/* Updated: border-bg-app -> border-bg-panel */}
                <p className="text-sm text-[var(--color-text)] font-medium border-b border-[var(--bg-panel)] pb-2">Aspect Ratio</p>
                <div className="grid grid-cols-2 gap-3">
                    {ratioButtons.map((btn) => (
                        <button 
                            key={btn.label}
                            onClick={() => setAspectRatio(btn.ratio)}
                            // Updated: Default bg to bg-panel, hover to accent
                            className="flex flex-row items-center justify-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] py-3 px-4 rounded-md transition-colors"
                        >
                            <Icon name={btn.icon} className="w-5 h-5" />
                            <span className="text-xs font-medium">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-grow"></div>
            
            <button 
                onClick={onApplyCrop}
                className="w-full bg-[var(--color-accent)] hover:opacity-90 text-black font-bold py-3 px-4 rounded-md transition-opacity"
            >
                Apply Crop
            </button>
        </PanelWrapper>
    );
};


// Panel for Rotate
const RotatePanel: React.FC<{ 
    onRotate90: (direction: 'left' | 'right') => void;
    onFlip: (direction: 'horizontal' | 'vertical') => void;
    rotationAngle: number;
    onRotationAngleChange: (angle: number) => void;
    onApplyCustomRotation: () => void;
}> = ({ onRotate90, onFlip, rotationAngle, onRotationAngleChange, onApplyCustomRotation }) => (
    <PanelWrapper title="Rotate & Transform">
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-6">
            {/* Rotate 90 Section */}
            <div>
                <p className="text-sm text-[var(--color-text)] mb-3 font-medium">Rotate 90°</p>
                <div className="grid grid-cols-2 gap-3">
                    {/* Updated: bg-panel for buttons */}
                    <button onClick={() => onRotate90('left')} className="flex flex-row items-center justify-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] py-3 px-4 rounded-md transition-colors">
                        <Icon name="rotate-left" className="w-5 h-5" />
                        <span className="text-xs font-medium">Left</span>
                    </button>
                    <button onClick={() => onRotate90('right')} className="flex flex-row items-center justify-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] py-3 px-4 rounded-md transition-colors">
                        <Icon name="rotate" className="w-5 h-5" />
                        <span className="text-xs font-medium">Right</span>
                    </button>
                </div>
            </div>

            {/* Flip Section */}
            {/* Updated: border-bg-app -> border-bg-panel */}
            <div className="pt-4 border-t border-[var(--bg-panel)]">
                <p className="text-sm text-[var(--color-text)] mb-3 font-medium">Flip</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onFlip('horizontal')} className="flex flex-row items-center justify-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] py-3 px-4 rounded-md transition-colors">
                        <Icon name="flip-horizontal" className="w-5 h-5" />
                        <span className="text-xs font-medium">Horizontal</span>
                    </button>
                    <button onClick={() => onFlip('vertical')} className="flex flex-row items-center justify-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] py-3 px-4 rounded-md transition-colors">
                        <Icon name="flip-vertical" className="w-5 h-5" />
                        <span className="text-xs font-medium">Vertical</span>
                    </button>
                </div>
            </div>

            {/* Custom Angle Section */}
            {/* Updated: border-bg-app -> border-bg-panel */}
            <div className="pt-4 border-t border-[var(--bg-panel)]">
                <p className="text-sm text-[var(--color-text)] mb-3 font-medium">Custom Angle</p>
                <SliderControl 
                    label="Angle" 
                    value={rotationAngle} 
                    min={0} 
                    max={360} 
                    onChange={onRotationAngleChange} 
                />
            </div>
        </div>

        <div className="flex-grow"></div>
        
        <button 
            onClick={onApplyCustomRotation} 
            disabled={rotationAngle === 0}
            className="w-full bg-[var(--color-accent)] hover:opacity-90 text-black font-bold py-3 px-4 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Apply Rotation
        </button>
    </PanelWrapper>
);

// Panel for Grayscale
const GrayscalePanel: React.FC<{ onGrayscale: (type: 'max' | 'average' | 'weighted') => void }> = ({ onGrayscale }) => (
    <PanelWrapper title="Grayscale">
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-3">
            <p className="text-sm text-[var(--color-text)] font-medium">Algorithms</p>
            
            <button 
                onClick={() => onGrayscale('max')} 
                className="w-full flex flex-row items-center justify-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] font-bold py-3 px-4 rounded-md transition-colors"
            >
                <Icon name="expand" className="w-5 h-5" />
                <span className="text-sm font-medium">Max Value (VFX)</span>
            </button>

            <button 
                onClick={() => onGrayscale('average')} 
                className="w-full flex flex-row items-center justify-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] font-bold py-3 px-4 rounded-md transition-colors"
            >
                <Icon name="palette" className="w-5 h-5" />
                <span className="text-sm font-medium">Average (VFX)</span>
            </button>

            <button 
                onClick={() => onGrayscale('weighted')} 
                className="w-full flex flex-row items-center justify-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] font-bold py-3 px-4 rounded-md transition-colors"
            >
                <Icon name="wand" className="w-5 h-5" />
                <span className="text-sm font-medium">Weighted (Standard)</span>
            </button>
        </div>
    </PanelWrapper>
);

// Panel for Resize
const ResizePanel: React.FC<{
    width: number;
    onWidthChange: (w: number) => void;
    height: number;
    onHeightChange: (h: number) => void;
    onApply: () => void;
}> = ({ width, onWidthChange, height, onHeightChange, onApply }) => (
    <PanelWrapper title="Resize Image">
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between text-sm text-[var(--color-text)]">
                <label htmlFor="width" className="font-medium">Width</label>
                {/* Updated: bg-app -> bg-panel, border -> border-secondary (matches container or just clean) */}
                <div className="flex items-center bg-[var(--bg-panel)] rounded-md border border-[var(--bg-secondary)] w-28">
                    <input
                        id="width"
                        type="number"
                        value={width}
                        onChange={(e) => onWidthChange(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-transparent p-1.5 text-center text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] rounded-md"
                    />
                    <span className="text-gray-500 text-xs pr-3 select-none">px</span>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm text-[var(--color-text)]">
                <label htmlFor="height" className="font-medium">Height</label>
                {/* Updated: bg-app -> bg-panel */}
                <div className="flex items-center bg-[var(--bg-panel)] rounded-md border border-[var(--bg-secondary)] w-28">
                    <input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => onHeightChange(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-transparent p-1.5 text-center text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] rounded-md"
                    />
                    <span className="text-gray-500 text-xs pr-3 select-none">px</span>
                </div>
            </div>
        </div>
        <div className="flex-grow"></div>
        <button onClick={onApply} className="w-full bg-[var(--color-accent)] hover:opacity-90 text-black font-bold py-3 px-4 rounded-md transition-opacity">
            Apply Resize
        </button>
    </PanelWrapper>
);


// Panel for Remove Background
const CutoutPanel: React.FC<{
    cutoutColor: string;
    onCutoutColorChange: (color: string) => void;
    cutoutTolerance: number;
    onCutoutToleranceChange: (val: number) => void;
    cutoutSoftness: number;
    onCutoutSoftnessChange: (val: number) => void;
    onManualCutout: () => void;
    onRemoveBlackBg: () => void;
}> = ({ 
    cutoutColor, 
    onCutoutColorChange, 
    cutoutTolerance, 
    onCutoutToleranceChange,
    cutoutSoftness,
    onCutoutSoftnessChange,
    onManualCutout,
    onRemoveBlackBg
}) => (
    <PanelWrapper title="Cutout">
        {/* Manual Section */}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-4">
            {/* Updated: border-bg-app -> border-bg-panel */}
            <p className="text-sm text-[var(--color-text)] font-medium border-b border-[var(--bg-panel)] pb-2">Color Removal</p>
            
            {/* Color Picker */}
            <div className="flex items-center justify-between text-sm text-[var(--color-text)]">
                <label className="font-medium">Target Color</label>
                <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">{cutoutColor}</span>
                    {/* Updated: bg-app -> bg-panel */}
                    <input 
                        type="color" 
                        value={cutoutColor}
                        onChange={(e) => onCutoutColorChange(e.target.value)}
                        className="h-8 w-14 p-0.5 bg-[var(--bg-panel)] border border-[var(--bg-secondary)] rounded cursor-pointer"
                    />
                </div>
            </div>
            <p className="text-xs opacity-50 italic">Click image to pick color</p>

            <SliderControl 
                label="Tolerance" 
                value={cutoutTolerance} 
                min={0} 
                max={450} // Increased max tolerance
                onChange={onCutoutToleranceChange} 
            />
            
            <SliderControl 
                label="Softness" 
                value={cutoutSoftness} 
                min={0} 
                max={50} 
                onChange={onCutoutSoftnessChange} 
            />

            <button 
                onClick={onManualCutout} 
                className="w-full flex justify-center items-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] font-bold py-3 px-4 rounded-md transition-colors mt-2"
            >
                Remove Selected Color
            </button>

            <button 
                onClick={onRemoveBlackBg} 
                className="w-full flex justify-center items-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] font-bold py-3 px-4 rounded-md transition-colors mt-2"
                title="Converts black background to transparency (Unmultiply)"
            >
                Remove Black Background
            </button>
        </div>
    </PanelWrapper>
);

const ColorAdjustPanel: React.FC<{
    colorAdjustments: { hue: number; saturation: number; brightness: number };
    onColorAdjustmentsChange: React.Dispatch<React.SetStateAction<{ hue: number; saturation: number; brightness: number }>>;
    onApplyColorAdjustments: () => void;
}> =
({ colorAdjustments, onColorAdjustmentsChange, onApplyColorAdjustments }) => (
    <PanelWrapper title="Color Adjustments">
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-4">
            <SliderControl label="Hue" value={colorAdjustments.hue} min={-180} max={180} onChange={(val) => onColorAdjustmentsChange(p => ({ ...p, hue: val }))} />
            <SliderControl label="Saturate" value={colorAdjustments.saturation} min={0} max={200} onChange={(val) => onColorAdjustmentsChange(p => ({ ...p, saturation: val }))} />
            <SliderControl label="Brightness" value={colorAdjustments.brightness} min={0} max={200} onChange={(val) => onColorAdjustmentsChange(p => ({ ...p, brightness: val }))} />
        </div>
        <div className="flex-grow"></div>
        <div className="flex flex-col space-y-2 pt-4">
            <button onClick={onApplyColorAdjustments} className="w-full bg-[var(--color-accent)] hover:opacity-90 text-black font-bold py-3 px-4 rounded-md transition-opacity">
                Apply Adjustments
            </button>
            {/* Updated: bg-panel button already correct */}
            <button onClick={() => onColorAdjustmentsChange({ hue: 0, saturation: 100, brightness: 100 })} className="w-full bg-[var(--bg-panel)] hover:bg-[var(--color-accent)] hover:text-black text-[var(--color-text)] font-bold py-3 px-4 rounded-md transition-colors">
                Reset Sliders
            </button>
        </div>
    </PanelWrapper>
);

const CollagePanel: React.FC<Pick<PropertiesPanelProps, 'collageLayoutType' | 'onCollageLayoutTypeChange' | 'gridCols' | 'onGridColsChange' | 'gridRows' | 'onGridRowsChange' | 'collageImages' | 'onCreateCollage'>> = 
({ collageLayoutType, onCollageLayoutTypeChange, gridCols, onGridColsChange, gridRows, onGridRowsChange, collageImages, onCreateCollage }) => {
    
    const getButtonClass = (type: CollageLayoutType) => `
        flex flex-row items-center justify-center gap-2 px-2 py-3 text-xs font-medium rounded-md capitalize transition-colors
        ${collageLayoutType === type 
            ? 'bg-[var(--color-accent)] text-black' 
            : 'bg-[var(--bg-panel)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-black'}
    `;

    return (
        <PanelWrapper title="Collage Settings">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-6">
                {/* Layout Type Section */}
                <div>
                    <p className="text-sm text-[var(--color-text)] mb-3 font-medium">Layout Type</p>
                    <div className="space-y-2">
                        {/* Row 1: Horizontal & Vertical */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => onCollageLayoutTypeChange('horizontal')}
                                className={getButtonClass('horizontal')}
                            >
                                <Icon name="layout-horizontal" className="w-5 h-5" />
                                <span>Horizontal</span>
                            </button>
                            <button
                                onClick={() => onCollageLayoutTypeChange('vertical')}
                                className={getButtonClass('vertical')}
                            >
                                <Icon name="layout-vertical" className="w-5 h-5" />
                                <span>Vertical</span>
                            </button>
                        </div>
                        {/* Row 2: Grid */}
                        <button
                            onClick={() => onCollageLayoutTypeChange('grid')}
                            className={`w-full ${getButtonClass('grid')}`}
                        >
                            <Icon name="layout-grid" className="w-5 h-5" />
                            <span>Grid</span>
                        </button>
                    </div>
                </div>

                {/* Grid Settings Section */}
                {collageLayoutType === 'grid' && (
                    // Updated: border-bg-app -> border-bg-panel
                    <div className="space-y-4 pt-4 border-t border-[var(--bg-panel)]">
                        <p className="text-sm text-[var(--color-text)] font-medium">Grid Dimensions</p>
                        
                        <div className="flex items-center justify-between text-sm text-[var(--color-text)]">
                            <label htmlFor="cols" className="font-medium">Columns</label>
                            {/* Updated: bg-app -> bg-panel */}
                            <div className="flex items-center bg-[var(--bg-panel)] rounded-md border border-[var(--bg-secondary)] w-24">
                                <input 
                                    id="cols" 
                                    type="number" 
                                    min="1" 
                                    value={gridCols} 
                                    onChange={(e) => onGridColsChange(Math.max(1, parseInt(e.target.value) || 1))} 
                                    className="w-full bg-transparent p-1.5 text-center text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] rounded-md" 
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-[var(--color-text)]">
                            <label htmlFor="rows" className="font-medium">Rows</label>
                            {/* Updated: bg-app -> bg-panel */}
                            <div className="flex items-center bg-[var(--bg-panel)] rounded-md border border-[var(--bg-secondary)] w-24">
                                <input 
                                    id="rows" 
                                    type="number" 
                                    min="1" 
                                    value={gridRows} 
                                    onChange={(e) => onGridRowsChange(Math.max(1, parseInt(e.target.value) || 1))} 
                                    className="w-full bg-transparent p-1.5 text-center text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] rounded-md" 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {collageLayoutType === 'grid' && collageImages.length > 0 && collageImages.length > gridCols * gridRows && (
                <p className="text-xs text-center text-yellow-400 px-2">
                    Grid ({gridCols}x{gridRows}) too small. Showing first {gridCols * gridRows} images.
                </p>
            )}
            <div className="flex-grow"></div>
            <button
                onClick={onCreateCollage}
                disabled={collageImages.length === 0}
                className="w-full bg-[var(--color-accent)] hover:opacity-90 text-black font-bold py-3 px-4 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                Create Collage
            </button>
        </PanelWrapper>
    );
};

// Props interface for the main panel
interface PropertiesPanelProps {
    editMode: EditMode;
    isProcessing: boolean;
    onModeChange: (mode: EditMode) => void;
    // Rotate & Transform
    onRotate90: (direction: 'left' | 'right') => void;
    onFlip: (direction: 'horizontal' | 'vertical') => void;
    rotationAngle: number;
    onRotationAngleChange: (angle: number) => void;
    onApplyCustomRotation: () => void;
    // Grayscale
    onGrayscale: (type: 'max' | 'average' | 'weighted') => void; // Updated prop type
    // Resize
    resizeWidth: number;
    onResizeWidthChange: (w: number) => void;
    resizeHeight: number;
    onResizeHeightChange: (h: number) => void;
    onApplyResize: () => void;
    // Crop
    onApplyCrop: () => void;
    setCropAspectRatio: (ratio: number | null) => void;
    // Cutout (Background Removal)
    cutoutColor: string;
    onCutoutColorChange: (color: string) => void;
    cutoutTolerance: number;
    onCutoutToleranceChange: (val: number) => void;
    cutoutSoftness: number;
    onCutoutSoftnessChange: (val: number) => void;
    onManualCutout: () => void;
    onRemoveBlackBg: () => void;
    // Color Adjust
    colorAdjustments: { hue: number; saturation: number; brightness: number };
    onColorAdjustmentsChange: React.Dispatch<React.SetStateAction<{ hue: number; saturation: number; brightness: number }>>;
    onApplyColorAdjustments: () => void;
    // Collage
    collageLayoutType: CollageLayoutType;
    onCollageLayoutTypeChange: (layout: CollageLayoutType) => void;
    gridCols: number;
    onGridColsChange: (cols: number) => void;
    gridRows: number;
    onGridRowsChange: (rows: number) => void;
    collageImages: HTMLImageElement[];
    onCreateCollage: () => void;
    // Convert
    convertFormat: string;
    onConvertFormatChange: (f: string) => void;
    convertQuality: number;
    onConvertQualityChange: (q: number) => void;
    onConvertExport: () => void;
}

// Main component that renders the correct panel
const PropertiesPanel: React.FC<PropertiesPanelProps> = (props) => {
    const renderPanel = () => {
        switch (props.editMode) {
            case 'crop':
                return <CropPanel onApplyCrop={props.onApplyCrop} setAspectRatio={props.setCropAspectRatio} />;
            case 'rotate':
                return <RotatePanel 
                    onRotate90={props.onRotate90}
                    onFlip={props.onFlip}
                    rotationAngle={props.rotationAngle}
                    onRotationAngleChange={props.onRotationAngleChange}
                    onApplyCustomRotation={props.onApplyCustomRotation}
                />;
            case 'grayscale':
                return <GrayscalePanel onGrayscale={props.onGrayscale} />;
            case 'resize':
                return <ResizePanel 
                    width={props.resizeWidth} 
                    onWidthChange={props.onResizeWidthChange}
                    height={props.resizeHeight}
                    onHeightChange={props.onResizeHeightChange}
                    onApply={props.onApplyResize}
                />;
            case 'remove-bg':
                return <CutoutPanel 
                    cutoutColor={props.cutoutColor}
                    onCutoutColorChange={props.onCutoutColorChange}
                    cutoutTolerance={props.cutoutTolerance}
                    onCutoutToleranceChange={props.onCutoutToleranceChange}
                    cutoutSoftness={props.cutoutSoftness}
                    onCutoutSoftnessChange={props.onCutoutSoftnessChange}
                    onManualCutout={props.onManualCutout}
                    onRemoveBlackBg={props.onRemoveBlackBg} 
                />;
            case 'color-adjust':
                return <ColorAdjustPanel
                    colorAdjustments={props.colorAdjustments}
                    onColorAdjustmentsChange={props.onColorAdjustmentsChange}
                    onApplyColorAdjustments={props.onApplyColorAdjustments}
                />;
            case 'collage':
                return <CollagePanel {...props} />;
            case 'convert':
                return <ConvertPanel 
                    format={props.convertFormat}
                    onFormatChange={props.onConvertFormatChange}
                    quality={props.convertQuality}
                    onQualityChange={props.onConvertQualityChange}
                    onExport={props.onConvertExport}
                />
            default:
                return null;
        }
    };

    return (
        <aside className="w-[320px] flex-shrink-0 bg-[var(--bg-panel)] p-4 flex flex-col space-y-6 overflow-y-auto transition-colors duration-300">
            {renderPanel()}
        </aside>
    );
};

export default PropertiesPanel;