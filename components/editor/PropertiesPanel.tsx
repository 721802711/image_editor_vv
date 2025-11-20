
import React from 'react';
import type { EditMode, CollageLayoutType, IconName, BatchOperation } from '../../types';
import Icon from '../Icon';

// --- Unified UI Components ---

const PanelWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="flex flex-col space-y-5 h-full">
        <h3 className="text-lg font-bold text-center text-[var(--color-text)] tracking-wide uppercase opacity-90">{title}</h3>
        {children}
    </div>
);

// 1. Reusable Number Input (Simple Display Style)
const NumberInput: React.FC<{
    value: number;
    min: number;
    max: number;
    onChange: (val: number) => void;
    className?: string;
}> = ({ value, min, max, onChange, className = '' }) => {
    
    // Allow typing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        if (valStr === '' || valStr === '-') return; 
        const val = parseInt(valStr, 10);
        if (!isNaN(val)) {
            onChange(val); 
        }
    };

    return (
        <div className={`flex bg-[var(--bg-app)] rounded-md border border-[var(--bg-secondary)] overflow-hidden h-8 shrink-0 items-center justify-center ${className}`}>
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                className="w-full h-full bg-transparent text-center text-xs font-mono focus:outline-none text-[var(--color-text)] px-1"
            />
        </div>
    );
}

// 2. Redesigned Slider Control (Label - Number - Slider)
const SliderControl: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (newValue: number) => void;
    unit?: string;
}> = ({ label, value, min, max, onChange, unit = '' }) => {
    return (
        <div className="flex items-center gap-3 h-8">
            {/* Label */}
            <label className="text-xs font-medium text-[var(--color-text)] w-12 shrink-0 truncate opacity-90" title={label}>
                {label}
            </label>
            
            {/* Input (Value) */}
            <NumberInput value={value} min={min} max={max} onChange={onChange} className="w-12" />

            {/* Slider (Progress Bar) */}
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="flex-1 h-1 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] hover:accent-opacity-90"
            />
        </div>
    );
};

// 3. Unified Button Component
interface UnifiedButtonProps {
    icon?: IconName;
    label: string; 
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    className?: string;
    active?: boolean;
}

const UnifiedButton: React.FC<UnifiedButtonProps> = ({ icon, label, onClick, variant = 'secondary', disabled = false, className = '', active = false }) => {
    const baseClasses = "h-11 w-full flex items-center justify-center gap-3 rounded-lg transition-all duration-200 font-semibold text-sm shadow-sm border";
    
    // Primary: Accent Color Background, Black Text
    const primaryClasses = "bg-[var(--color-accent)] border-transparent text-black hover:opacity-90 active:scale-[0.98]";
    
    // Secondary: Panel Background, Text Color, Hover Accent
    const secondaryClasses = active 
        ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-black" 
        : "bg-[var(--bg-panel)] border-[var(--bg-secondary)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] active:bg-[var(--bg-secondary)]";

    const disabledClasses = "opacity-50 cursor-not-allowed hover:none active:none grayscale";

    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`
                ${baseClasses} 
                ${variant === 'primary' ? primaryClasses : secondaryClasses} 
                ${disabled ? disabledClasses : ''}
                ${className}
            `}
        >
            {icon && <Icon name={icon} className="w-5 h-5" />}
            <span>{label}</span>
        </button>
    );
};


// --- Feature Panels ---

const CropPanel: React.FC<{
    onApplyCrop: () => void;
    setAspectRatio: (ratio: number | null) => void;
    isBatchMode?: boolean;
    onBatchAction?: (op: BatchOperation) => void;
}> = ({ onApplyCrop, setAspectRatio, isBatchMode, onBatchAction }) => {
    
    const ratioButtons: { label: string; ratio: number | null; icon: IconName }[] = [
        { label: '1:1', ratio: 1, icon: 'ratio-1-1' },
        { label: '16:9', ratio: 16/9, icon: 'ratio-16-9' },
        { label: '4:3', ratio: 4/3, icon: 'ratio-4-3' },
        { label: 'Free', ratio: null, icon: 'ratio-free' },
    ];

    return (
        <PanelWrapper title="Crop Image">
            <div className="bg-[var(--bg-secondary)]/30 rounded-xl p-4 space-y-4 border border-[var(--bg-secondary)]">
                <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider">Aspect Ratio</p>
                <div className="grid grid-cols-2 gap-3">
                    {ratioButtons.map((btn) => (
                        <UnifiedButton 
                            key={btn.label}
                            variant="secondary"
                            label={btn.label}
                            icon={btn.icon}
                            disabled={isBatchMode && btn.ratio === null}
                            onClick={() => {
                                if (isBatchMode && onBatchAction && btn.ratio !== null) {
                                    onBatchAction({ type: 'crop', ratio: btn.ratio });
                                } else {
                                    setAspectRatio(btn.ratio);
                                }
                            }}
                        />
                    ))}
                </div>
                {isBatchMode && <p className="text-[10px] opacity-60 text-center">Click ratio to apply crop immediately.</p>}
            </div>
            
            <div className="flex-grow"></div>
            
            {!isBatchMode && (
                <UnifiedButton 
                    variant="primary"
                    label="Apply Crop"
                    icon="check"
                    onClick={onApplyCrop}
                />
            )}
        </PanelWrapper>
    );
};


const RotatePanel: React.FC<{ 
    onRotate90: (direction: 'left' | 'right') => void;
    onFlip: (direction: 'horizontal' | 'vertical') => void;
    rotationAngle: number;
    onRotationAngleChange: (angle: number) => void;
    onApplyCustomRotation: () => void;
    isBatchMode?: boolean;
    onBatchAction?: (op: BatchOperation) => void;
}> = ({ onRotate90, onFlip, rotationAngle, onRotationAngleChange, onApplyCustomRotation, isBatchMode, onBatchAction }) => (
    <PanelWrapper title="Rotate & Transform">
        <div className="bg-[var(--bg-secondary)]/30 rounded-xl p-4 space-y-6 border border-[var(--bg-secondary)]">
            <div className="space-y-3">
                <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider">Rotate 90°</p>
                <div className="grid grid-cols-2 gap-3">
                    <UnifiedButton 
                        variant="secondary"
                        label="Left"
                        icon="rotate-left"
                        onClick={() => isBatchMode && onBatchAction ? onBatchAction({ type: 'rotate', angle: -90 }) : onRotate90('left')} 
                    />
                    <UnifiedButton 
                        variant="secondary"
                        label="Right"
                        icon="rotate"
                        onClick={() => isBatchMode && onBatchAction ? onBatchAction({ type: 'rotate', angle: 90 }) : onRotate90('right')} 
                    />
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[var(--bg-secondary)]">
                <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider">Flip</p>
                <div className="grid grid-cols-2 gap-3">
                    <UnifiedButton 
                        variant="secondary"
                        label="Horiz"
                        icon="flip-horizontal"
                        onClick={() => isBatchMode && onBatchAction ? onBatchAction({ type: 'flip', direction: 'horizontal' }) : onFlip('horizontal')} 
                    />
                    <UnifiedButton 
                        variant="secondary"
                        label="Vert"
                        icon="flip-vertical"
                        onClick={() => isBatchMode && onBatchAction ? onBatchAction({ type: 'flip', direction: 'vertical' }) : onFlip('vertical')} 
                    />
                </div>
            </div>

            {!isBatchMode && (
                <div className="space-y-3 pt-4 border-t border-[var(--bg-secondary)]">
                    <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider">Fine Tune</p>
                    <SliderControl 
                        label="Angle" 
                        value={rotationAngle} 
                        min={0} 
                        max={360} 
                        onChange={onRotationAngleChange} 
                    />
                </div>
            )}
        </div>

        <div className="flex-grow"></div>
        
        {!isBatchMode && (
            <UnifiedButton 
                variant="primary"
                label="Apply Rotation"
                icon="check"
                onClick={onApplyCustomRotation}
                disabled={rotationAngle === 0}
            />
        )}
    </PanelWrapper>
);


const GrayscalePanel: React.FC<{ 
    onGrayscale: (type: 'max' | 'average' | 'weighted') => void;
    isBatchMode?: boolean;
    onBatchAction?: (op: BatchOperation) => void;
}> = ({ onGrayscale, isBatchMode, onBatchAction }) => (
    <PanelWrapper title="Grayscale">
        <div className="bg-[var(--bg-secondary)]/30 rounded-xl p-4 space-y-4 border border-[var(--bg-secondary)]">
            <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider">Algorithms</p>
            
            {['max', 'average', 'weighted'].map((type) => (
                <UnifiedButton 
                    key={type}
                    variant="secondary"
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    icon={type === 'max' ? 'expand' : type === 'average' ? 'palette' : 'wand'}
                    onClick={() => isBatchMode && onBatchAction ? onBatchAction({ type: 'grayscale', algorithm: type as any }) : onGrayscale(type as any)} 
                />
            ))}
        </div>
        {isBatchMode && <p className="text-[10px] opacity-60 text-center mt-2">Clicking applies grayscale immediately.</p>}
    </PanelWrapper>
);


const ResizePanel: React.FC<{
    width: number;
    onWidthChange: (w: number) => void;
    height: number;
    onHeightChange: (h: number) => void;
    onApply: () => void;
    isBatchMode?: boolean;
    onBatchAction?: (op: BatchOperation) => void;
}> = ({ width, onWidthChange, height, onHeightChange, onApply, isBatchMode, onBatchAction }) => (
    <PanelWrapper title="Resize Image">
        <div className="bg-[var(--bg-secondary)]/30 rounded-xl p-4 space-y-6 border border-[var(--bg-secondary)]">
            
            {/* Dimensions Inputs */}
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-[var(--color-text)]">
                    <label className="font-medium w-16">Width</label>
                    <NumberInput value={width} min={1} max={10000} onChange={onWidthChange} className="flex-1" />
                </div>

                <div className="flex items-center justify-between text-sm text-[var(--color-text)]">
                    <label className="font-medium w-16">Height</label>
                    <NumberInput value={height} min={1} max={10000} onChange={onHeightChange} className="flex-1" />
                </div>
            </div>

            {isBatchMode && <p className="text-xs opacity-60 text-center">Set values, then click Apply.</p>}
        </div>
        <div className="flex-grow"></div>
        
        <UnifiedButton 
            variant="primary"
            label={isBatchMode ? "Apply to Selected" : "Apply Resize"}
            icon={isBatchMode ? "layers" : "check"}
            onClick={() => isBatchMode && onBatchAction 
                ? onBatchAction({ type: 'resize', width, height, maintainAspect: false })
                : onApply()
            }
        />
    </PanelWrapper>
);


const CutoutPanel: React.FC<{
    cutoutColor: string;
    onCutoutColorChange: (color: string) => void;
    cutoutTolerance: number;
    onCutoutToleranceChange: (val: number) => void;
    cutoutSoftness: number;
    onCutoutSoftnessChange: (val: number) => void;
    onManualCutout: () => void;
    onRemoveBlackBg: () => void;
    isBatchMode?: boolean;
    onBatchAction?: (op: BatchOperation) => void;
}> = ({ 
    cutoutColor, 
    onCutoutColorChange, 
    cutoutTolerance, 
    onCutoutToleranceChange,
    cutoutSoftness,
    onCutoutSoftnessChange,
    onManualCutout,
    onRemoveBlackBg,
    isBatchMode,
    onBatchAction
}) => (
    <PanelWrapper title="Cutout">
        <div className="bg-[var(--bg-secondary)]/30 rounded-xl p-4 space-y-6 border border-[var(--bg-secondary)]">
            <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider border-b border-[var(--bg-secondary)] pb-2">Color Removal</p>
            
            <div className="flex items-center justify-between text-sm text-[var(--color-text)]">
                <label className="font-medium">Target Color</label>
                <div className="flex items-center gap-2 bg-[var(--bg-app)] p-1 rounded-md border border-[var(--bg-secondary)]">
                    <span className="text-xs font-mono px-2 opacity-80">{cutoutColor}</span>
                    <input 
                        type="color" 
                        value={cutoutColor}
                        onChange={(e) => onCutoutColorChange(e.target.value)}
                        className="h-6 w-8 bg-transparent cursor-pointer"
                    />
                </div>
            </div>
            {!isBatchMode && <p className="text-[10px] opacity-50 italic text-right -mt-2">Click image to pick</p>}

            <SliderControl 
                label="Tolerance" 
                value={cutoutTolerance} 
                min={0} 
                max={450} 
                onChange={onCutoutToleranceChange} 
            />
            
            <SliderControl 
                label="Softness" 
                value={cutoutSoftness} 
                min={0} 
                max={50} 
                onChange={onCutoutSoftnessChange} 
            />

            <UnifiedButton 
                variant="secondary"
                label="Remove Color"
                icon="erase"
                onClick={() => isBatchMode && onBatchAction ? onBatchAction({ type: 'cutout-color', color: cutoutColor, tolerance: cutoutTolerance, softness: cutoutSoftness }) : onManualCutout()} 
            />

            <div className="border-t border-[var(--bg-secondary)] pt-4">
                 <UnifiedButton 
                    variant="secondary"
                    label="Remove Black BG"
                    icon="wand"
                    onClick={() => isBatchMode && onBatchAction ? onBatchAction({ type: 'remove-bg-black' }) : onRemoveBlackBg()} 
                />
            </div>
        </div>
    </PanelWrapper>
);

const ColorAdjustPanel: React.FC<{
    colorAdjustments: { hue: number; saturation: number; brightness: number };
    onColorAdjustmentsChange: React.Dispatch<React.SetStateAction<{ hue: number; saturation: number; brightness: number }>>;
    onApplyColorAdjustments: () => void;
    isBatchMode?: boolean;
    onBatchAction?: (op: BatchOperation) => void;
}> =
({ colorAdjustments, onColorAdjustmentsChange, onApplyColorAdjustments, isBatchMode, onBatchAction }) => (
    <PanelWrapper title="Adjustments">
        <div className="bg-[var(--bg-secondary)]/30 rounded-xl p-4 space-y-6 border border-[var(--bg-secondary)]">
            <SliderControl label="Hue" value={colorAdjustments.hue} min={-180} max={180} onChange={(val) => onColorAdjustmentsChange(p => ({ ...p, hue: val }))} />
            <SliderControl label="Saturate" value={colorAdjustments.saturation} min={0} max={200} onChange={(val) => onColorAdjustmentsChange(p => ({ ...p, saturation: val }))} />
            <SliderControl label="Bright" value={colorAdjustments.brightness} min={0} max={200} onChange={(val) => onColorAdjustmentsChange(p => ({ ...p, brightness: val }))} />
        </div>
        <div className="flex-grow"></div>
        <div className="flex flex-col space-y-3">
             <UnifiedButton 
                variant="primary"
                label={isBatchMode ? "Apply to Selected" : "Apply Adjustments"}
                icon="check"
                onClick={() => isBatchMode && onBatchAction 
                    ? onBatchAction({ type: 'color-adjust', ...colorAdjustments })
                    : onApplyColorAdjustments()
                } 
            />
            
             <UnifiedButton 
                variant="secondary"
                label="Reset Sliders"
                icon="reset"
                onClick={() => onColorAdjustmentsChange({ hue: 0, saturation: 100, brightness: 100 })} 
            />
        </div>
    </PanelWrapper>
);

const CollagePanel: React.FC<Pick<PropertiesPanelProps, 'collageLayoutType' | 'onCollageLayoutTypeChange' | 'gridCols' | 'onGridColsChange' | 'gridRows' | 'onGridRowsChange' | 'collageImages' | 'onCreateCollage'>> = 
({ collageLayoutType, onCollageLayoutTypeChange, gridCols, onGridColsChange, gridRows, onGridRowsChange, collageImages, onCreateCollage }) => {
    
    return (
        <PanelWrapper title="Collage">
            <div className="bg-[var(--bg-secondary)]/30 rounded-xl p-4 space-y-6 border border-[var(--bg-secondary)]">
                <div className="space-y-3">
                    <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider">Layout</p>
                    <div className="grid grid-cols-2 gap-3">
                        <UnifiedButton 
                            variant="secondary"
                            label="Horiz"
                            icon="layout-horizontal"
                            active={collageLayoutType === 'horizontal'}
                            onClick={() => onCollageLayoutTypeChange('horizontal')}
                        />
                        <UnifiedButton 
                            variant="secondary"
                            label="Vert"
                            icon="layout-vertical"
                            active={collageLayoutType === 'vertical'}
                            onClick={() => onCollageLayoutTypeChange('vertical')}
                        />
                    </div>
                    <UnifiedButton 
                        variant="secondary"
                        label="Grid System"
                        icon="layout-grid"
                        active={collageLayoutType === 'grid'}
                        onClick={() => onCollageLayoutTypeChange('grid')}
                    />
                </div>

                {collageLayoutType === 'grid' && (
                    <div className="space-y-4 pt-4 border-t border-[var(--bg-secondary)]">
                        <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider">Dimensions</p>
                        <SliderControl label="Columns" value={gridCols} min={1} max={10} onChange={onGridColsChange} />
                        <SliderControl label="Rows" value={gridRows} min={1} max={10} onChange={onGridRowsChange} />
                    </div>
                )}
            </div>

            {collageLayoutType === 'grid' && collageImages.length > 0 && collageImages.length > gridCols * gridRows && (
                <p className="text-xs text-center text-yellow-400 px-2">
                    Grid ({gridCols}x{gridRows}) too small. Showing first {gridCols * gridRows} images.
                </p>
            )}
            <div className="flex-grow"></div>
            
            <UnifiedButton 
                variant="primary"
                label="Create Collage"
                icon="collage"
                disabled={collageImages.length === 0}
                onClick={onCreateCollage}
            />
        </PanelWrapper>
    );
};

const ConvertPanel: React.FC<{
    format: string;
    onFormatChange: (f: string) => void;
    quality: number;
    onQualityChange: (q: number) => void;
    isBatchMode?: boolean;
    onBatchAction?: (op: BatchOperation) => void;
    onExport?: () => void; 
}> = ({ format, onFormatChange, quality, onQualityChange, isBatchMode, onBatchAction, onExport }) => {
    const formats = [
        { label: 'PNG', value: 'image/png' },
        { label: 'JPG', value: 'image/jpeg' },
        { label: 'WEBP', value: 'image/webp' },
        { label: 'AVIF', value: 'image/avif' },
        { label: 'BMP', value: 'image/bmp' },
        { label: 'ICO', value: 'image/x-icon' },
        { label: 'TIFF', value: 'image/tiff' },
        { label: 'SVG', value: 'image/svg+xml' },
    ];

    return (
        <PanelWrapper title="Converter">
             <div className="bg-[var(--bg-secondary)]/30 rounded-xl p-4 space-y-6 border border-[var(--bg-secondary)]">
                <div className="space-y-3">
                    <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider">Output Format</p>
                    <div className="grid grid-cols-3 gap-2">
                        {formats.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => onFormatChange(f.value)}
                                className={`py-2 px-1 rounded-md text-xs font-bold transition-colors border ${
                                    format === f.value
                                        ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-black'
                                        : 'bg-[var(--bg-panel)] border-[var(--bg-secondary)] text-[var(--color-text)] hover:border-[var(--color-accent)]'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {format !== 'image/png' && format !== 'image/bmp' && format !== 'image/x-icon' && format !== 'image/svg+xml' && (
                    <div className="pt-4 border-t border-[var(--bg-secondary)]">
                        <p className="text-xs uppercase font-bold text-[var(--color-text)] opacity-60 tracking-wider mb-3">Quality</p>
                         <SliderControl 
                            label="Compression" 
                            value={Math.round(quality * 100)} 
                            min={1} 
                            max={100} 
                            onChange={(val) => onQualityChange(val / 100)} 
                        />
                    </div>
                )}
            </div>

            <div className="flex-grow"></div>
            
            <UnifiedButton 
                variant="primary"
                label={isBatchMode ? "Convert Selected" : "Export Image"}
                icon={isBatchMode ? "layers" : "download"}
                onClick={() => isBatchMode && onBatchAction 
                    ? onBatchAction({ type: 'convert', format, quality })
                    : onExport && onExport()
                }
            />
        </PanelWrapper>
    )
};

const BatchPanel: React.FC = () => {
    return (
        <PanelWrapper title="Batch Mode">
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 space-y-4">
                <Icon name="layers" className="w-12 h-12 opacity-50" />
                <div>
                    <p className="font-medium">Select a tool from the toolbar</p>
                    <p className="text-sm mt-1">Crop, Resize, Rotate, etc.</p>
                </div>
            </div>
        </PanelWrapper>
    );
};

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
    onGrayscale: (type: 'max' | 'average' | 'weighted') => void; 
    // Resize
    resizeWidth: number;
    onResizeWidthChange: (w: number) => void;
    resizeHeight: number;
    onResizeHeightChange: (h: number) => void;
    onApplyResize: () => void;
    // Crop
    onApplyCrop: () => void;
    setCropAspectRatio: (ratio: number | null) => void;
    // Cutout
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
    // Batch General
    onBatchDownload: () => void;
    // Batch Logic Props
    isBatchMode?: boolean;
    onBatchAction?: (op: BatchOperation) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = (props) => {
    const renderPanel = () => {
        switch (props.editMode) {
            case 'crop':
                return <CropPanel 
                    onApplyCrop={props.onApplyCrop} 
                    setAspectRatio={props.setCropAspectRatio}
                    isBatchMode={props.isBatchMode}
                    onBatchAction={props.onBatchAction}
                />;
            case 'rotate':
                return <RotatePanel 
                    onRotate90={props.onRotate90}
                    onFlip={props.onFlip}
                    rotationAngle={props.rotationAngle}
                    onRotationAngleChange={props.onRotationAngleChange}
                    onApplyCustomRotation={props.onApplyCustomRotation}
                    isBatchMode={props.isBatchMode}
                    onBatchAction={props.onBatchAction}
                />;
            case 'grayscale':
                return <GrayscalePanel 
                    onGrayscale={props.onGrayscale} 
                    isBatchMode={props.isBatchMode}
                    onBatchAction={props.onBatchAction}
                />;
            case 'resize':
                return <ResizePanel 
                    width={props.resizeWidth} 
                    onWidthChange={props.onResizeWidthChange}
                    height={props.resizeHeight}
                    onHeightChange={props.onResizeHeightChange}
                    onApply={props.onApplyResize}
                    isBatchMode={props.isBatchMode}
                    onBatchAction={props.onBatchAction}
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
                    isBatchMode={props.isBatchMode}
                    onBatchAction={props.onBatchAction}
                />;
            case 'color-adjust':
                return <ColorAdjustPanel
                    colorAdjustments={props.colorAdjustments}
                    onColorAdjustmentsChange={props.onColorAdjustmentsChange}
                    onApplyColorAdjustments={props.onApplyColorAdjustments}
                    isBatchMode={props.isBatchMode}
                    onBatchAction={props.onBatchAction}
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
                    isBatchMode={props.isBatchMode}
                    onBatchAction={props.onBatchAction}
                />
            case 'batch':
                return <BatchPanel />
            default:
                return null;
        }
    };

    return (
        <aside className="w-[320px] flex-shrink-0 bg-[var(--bg-panel)] p-5 flex flex-col shadow-xl z-10 border-l border-[var(--bg-secondary)] overflow-y-auto custom-scrollbar h-full">
            {renderPanel()}
        </aside>
    );
};

export default PropertiesPanel;
