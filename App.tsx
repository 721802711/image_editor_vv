import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { EditMode, CollageLayoutType } from './types';
import HomeView from './components/views/HomeView';
import Header from './components/editor/Header';
import Toolbar from './components/editor/Toolbar';
import MainContent from './components/editor/MainContent';
import PropertiesPanel from './components/editor/PropertiesPanel';
import SettingsModal from './components/modals/SettingsModal';
import { processTgaFile } from './services/tgaParser';


export default function App() {
  const [history, setHistory] = useState<HTMLImageElement[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [collageImages, setCollageImages] = useState<HTMLImageElement[]>([]);
  const [collageLayoutType, setCollageLayoutType] = useState<CollageLayoutType>('grid');
  const [gridCols, setGridCols] = useState(2);
  const [gridRows, setGridRows] = useState(2);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [colorAdjustments, setColorAdjustments] = useState({ hue: 0, saturation: 100, brightness: 100 });
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [imageName, setImageName] = useState<string>('');
  const [currentView, setCurrentView] = useState<'editor' | 'home'>('home');
  
  // Theme State
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState({
      appBg: '#1c1c1c',
      panelBg: '#292929',
      secondaryBg: '#333333',
      accentColor: '#a1de76',
      textColor: '#f5f5f5'
  });

  // Resize State
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  
  // Crop State
  const [cropRect, setCropRect] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  // Cutout State
  const [cutoutColor, setCutoutColor] = useState('#ffffff');
  const [cutoutTolerance, setCutoutTolerance] = useState(30);
  const [cutoutSoftness, setCutoutSoftness] = useState(0);

  // Convert State
  const [convertFormat, setConvertFormat] = useState<string>('image/png');
  const [convertQuality, setConvertQuality] = useState<number>(0.92);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const collageFileInputRef = useRef<HTMLInputElement>(null);
  
  const currentImage = history[historyIndex] || null;
  const isImageLoaded = !!currentImage;

  const addNewStateToHistory = useCallback((img: HTMLImageElement) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, img]);
    setHistoryIndex(newHistory.length);
  }, [history, historyIndex]);

  const updateCurrentImageFromCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const img = new Image();
    img.onload = () => addNewStateToHistory(img);
    img.src = dataUrl;
  }, [addNewStateToHistory]);

  // Main drawing function
  const drawImage = useCallback((imageToDraw: HTMLImageElement | null, adjustments?: { hue: number, saturation: number, brightness: number }, angle: number = 0) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    if (!imageToDraw) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    canvas.width = imageToDraw.width;
    canvas.height = imageToDraw.height;

    // Explicitly clear canvas to ensure transparency is preserved
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();

    // Apply custom rotation for preview if angle is not 0
    // Note: This preview does NOT resize the canvas, so corners might clip.
    // The 'Apply' function handles the canvas expansion.
    if (angle !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    if (adjustments) {
      ctx.filter = `hue-rotate(${adjustments.hue}deg) saturate(${adjustments.saturation}%) brightness(${adjustments.brightness}%)`;
    } else {
      ctx.filter = 'none';
    }
    
    ctx.drawImage(imageToDraw, 0, 0);
    ctx.restore();
  }, []);

  useEffect(() => {
    if (currentImage) {
      setResizeWidth(currentImage.width);
      setResizeHeight(currentImage.height);
    }
  }, [currentImage]);
  
  // Redraw when dependencies change
  useEffect(() => {
    if (editMode === 'color-adjust' && currentImage) {
      drawImage(currentImage, colorAdjustments, 0);
    } else if (editMode === 'rotate' && currentImage) {
      drawImage(currentImage, undefined, rotationAngle);
    } else {
      drawImage(currentImage);
    }
  }, [currentImage, drawImage, colorAdjustments, editMode, rotationAngle]);

  const loadStandardImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setHistory([img]);
        setHistoryIndex(0);
        setCollageImages([]);
        setZoom(100);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      
      if (file.name.toLowerCase().endsWith('.tga')) {
          try {
              const dataUrl = await processTgaFile(file);
              const img = new Image();
              img.onload = () => {
                  setHistory([img]);
                  setHistoryIndex(0);
                  setCollageImages([]);
                  setZoom(100);
              };
              img.src = dataUrl;
          } catch (err) {
              console.error("Failed to load TGA:", err);
              alert("Failed to load TGA file. Ensure it is uncompressed RGB/RGBA.");
          }
      } else {
          loadStandardImage(file);
      }
    }
  };

  const handleCollageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(async (file) => {
        if (file instanceof File) {
            if (file.name.toLowerCase().endsWith('.tga')) {
                try {
                    const dataUrl = await processTgaFile(file);
                    const img = new Image();
                    img.onload = () => {
                        setCollageImages(prev => [...prev, img]);
                    };
                    img.src = dataUrl;
                } catch (err) {
                    console.error("Error loading collage TGA", err);
                }
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                    setCollageImages(prev => [...prev, img]);
                    };
                    img.src = event.target?.result as string;
                };
                reader.readAsDataURL(file);
            }
        }
      });
    }
  };
    
  const applyColorAdjustments = () => {
    if (!currentImage) return;
    drawImage(currentImage, colorAdjustments);
    updateCurrentImageFromCanvas();
    setColorAdjustments({ hue: 0, saturation: 100, brightness: 100 });
  };

  const handleModeChange = (mode: EditMode) => {
    if (editMode === 'color-adjust' && mode !== 'color-adjust') {
        applyColorAdjustments();
    }
    if (editMode === 'rotate' && mode !== 'rotate' && rotationAngle !== 0) {
        // Reset rotation if leaving rotate mode without applying
        setRotationAngle(0); 
    }
    
    // Initialize crop rect when entering crop mode
    if (mode === 'crop' && currentImage) {
        setCropRect({
            x: currentImage.width * 0.1,
            y: currentImage.height * 0.1,
            width: currentImage.width * 0.8,
            height: currentImage.height * 0.8
        });
    } else {
        setCropRect(null);
    }

    setEditMode(mode);
  };

  const applyRotate90 = (direction: 'left' | 'right') => {
    if (!currentImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = currentImage;
    
    // Swap width and height
    canvas.width = height;
    canvas.height = width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.translate(height / 2, width / 2);
    ctx.rotate((direction === 'right' ? 90 : -90) * Math.PI / 180);
    ctx.drawImage(currentImage, -width / 2, -height / 2);
    updateCurrentImageFromCanvas();
  };

  const applyFlip = (direction: 'horizontal' | 'vertical') => {
      if (!currentImage || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = currentImage.width;
      canvas.height = currentImage.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      if (direction === 'horizontal') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
      } else {
          ctx.translate(0, canvas.height);
          ctx.scale(1, -1);
      }
      ctx.drawImage(currentImage, 0, 0);
      ctx.restore();
      updateCurrentImageFromCanvas();
  };

  const applyCustomRotation = () => {
    if (!currentImage || !canvasRef.current) return;
    if (rotationAngle === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = currentImage;

    const rad = (rotationAngle * Math.PI) / 180;
    
    // Calculate new bounding box to avoid clipping
    const newWidth = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
    const newHeight = Math.abs(width * Math.sin(rad)) + Math.abs(height * Math.cos(rad));

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate(rad);
    ctx.drawImage(currentImage, -width / 2, -height / 2);
    
    updateCurrentImageFromCanvas();
    setRotationAngle(0);
  };

  const applyGrayscale = (type: 'max' | 'average' | 'weighted') => {
    if (!currentImage || !canvasRef.current) return;
    drawImage(currentImage);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      let gray = 0;
      
      if (type === 'max') {
          // Method 1: Max Value (VFX)
          gray = Math.max(r, g, b);
      } else if (type === 'weighted') {
          // Method 3: Weighted Formula (Standard)
          gray = r * 0.299 + g * 0.587 + b * 0.114;
      } else {
          // Method 2: Average Value (VFX) - Default
          gray = (r + g + b) / 3;
      }

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      // Note: We do NOT touch data[i+3] (Alpha), so transparency is preserved.
    }
    ctx.putImageData(imageData, 0, 0);
    updateCurrentImageFromCanvas();
  };

  const applyCrop = () => {
      if (!currentImage || !cropRect || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      // Create a temporary canvas to hold the cropped image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cropRect.width;
      tempCanvas.height = cropRect.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      
      // Draw the selected portion of the original image onto the temp canvas
      tempCtx.drawImage(
          currentImage,
          cropRect.x,
          cropRect.y,
          cropRect.width,
          cropRect.height,
          0,
          0,
          cropRect.width,
          cropRect.height
      );
      
      // Update the main canvas
      canvas.width = cropRect.width;
      canvas.height = cropRect.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
      
      updateCurrentImageFromCanvas();
      setEditMode('none');
      setCropRect(null);
  };
  
  const setCropAspectRatio = (ratio: number | null) => {
      if (!currentImage) return;
      const { width, height } = currentImage;
      let newW = width * 0.8;
      let newH = height * 0.8;
      
      if (ratio !== null) {
          if (width / height > ratio) {
              // Image is wider than target ratio
              newH = height * 0.8;
              newW = newH * ratio;
          } else {
              // Image is taller than target ratio
              newW = width * 0.8;
              newH = newW / ratio;
          }
      }
      
      setCropRect({
          x: (width - newW) / 2,
          y: (height - newH) / 2,
          width: newW,
          height: newH
      });
  };

  const handleCanvasClickForBgRemove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode !== 'remove-bg' || !canvasRef.current || isProcessing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const clickedPixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = clickedPixel;

    // Convert RGB to Hex for state
    const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    setCutoutColor(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
  };

  const handleManualCutout = () => {
      if (!canvasRef.current || isProcessing) return;
      setIsProcessing(true);

      setTimeout(() => {
        const canvas = canvasRef.current!;
        // Added { willReadFrequently: true } for performance optimization
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Parse target color with robustness
        let rTarget = 255, gTarget = 255, bTarget = 255;
        try {
            const hex = cutoutColor.replace(/^#/, '');
            if (hex.length === 6) {
                rTarget = parseInt(hex.slice(0, 2), 16);
                gTarget = parseInt(hex.slice(2, 4), 16);
                bTarget = parseInt(hex.slice(4, 6), 16);
            }
        } catch (e) {
            console.error("Error parsing color", e);
        }

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];

            // Euclidean distance
            const dist = Math.sqrt(
                Math.pow(r - rTarget, 2) +
                Math.pow(g - gTarget, 2) +
                Math.pow(b - bTarget, 2)
            );

            if (dist <= cutoutTolerance) {
                data[i+3] = 0; // Transparent
            } else if (dist <= cutoutTolerance + cutoutSoftness) {
                // Feathering
                const range = cutoutSoftness;
                const progress = (dist - cutoutTolerance) / range;
                // Scale opacity from 0 to current alpha
                const newAlpha = Math.floor(progress * 255);
                if (newAlpha < data[i+3]) {
                    data[i+3] = newAlpha;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        updateCurrentImageFromCanvas();
        setIsProcessing(false);
      }, 50);
  };

  // NEW FUNCTION: Remove Black Background (Unmultiply Alpha logic)
  const handleRemoveBlackBackground = () => {
    if (!canvasRef.current || isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Calculate the maximum brightness of the pixel (0-255)
            const max = Math.max(r, g, b);

            if (max === 0) {
                // Pure black becomes fully transparent
                data[i + 3] = 0;
            } else {
                // Set Alpha to the brightness (Unmultiply)
                // This makes darker colors more transparent, effectively removing the black background
                data[i + 3] = max;

                // Normalize RGB values to preserve color intensity even when transparent
                // Formula: NewColor = (OldColor / Alpha) * 255
                // This ensures that when blended back over black, it looks like the original
                data[i] = (r / max) * 255;
                data[i + 1] = (g / max) * 255;
                data[i + 2] = (b / max) * 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        updateCurrentImageFromCanvas();
        setIsProcessing(false);
    }, 50);
  };

  const applyResize = () => {
    if (!currentImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = resizeWidth;
    canvas.height = resizeHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0, resizeWidth, resizeHeight);
    updateCurrentImageFromCanvas();
  };

  const createCollage = () => {
    if (collageImages.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const thumbWidth = 200;
    const thumbHeight = 200;
    const gap = 10;

    let cols = 1;
    let rows = 1;

    if (collageLayoutType === 'horizontal') {
        cols = collageImages.length;
        rows = 1;
    } else if (collageLayoutType === 'vertical') {
        cols = 1;
        rows = collageImages.length;
    } else { // 'grid'
        cols = Math.max(1, gridCols);
        rows = Math.max(1, gridRows);
    }

    if (cols <= 0 || rows <= 0) return;

    canvas.width = cols * thumbWidth + (cols - 1) * gap;
    canvas.height = rows * thumbHeight + (rows - 1) * gap;
    
    // Ensure canvas is clear for transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    collageImages.forEach((img, index) => {
      if (index >= cols * rows) return;
      
      const row = Math.floor(index / cols);
      const col = index % cols;
      const cellX = col * (thumbWidth + gap);
      const cellY = row * (thumbHeight + gap);

      const scale = Math.min(thumbWidth / img.width, thumbHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      const drawX = cellX + (thumbWidth - scaledWidth) / 2;
      const drawY = cellY + (thumbHeight - scaledHeight) / 2;

      ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
    });
    
    const dataUrl = canvas.toDataURL('image/png');
    const img = new Image();
    img.onload = () => {
      setHistory([img]);
      setHistoryIndex(0);
      setEditMode('none');
      setImageName('collage.png');
      setCurrentView('editor');
    };
    img.src = dataUrl;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      // Ensure transparency is saved by forcing PNG extension
      let fileName = imageName || 'edited-image';
      // Remove existing extension if present
      fileName = fileName.replace(/\.[^/.]+$/, "");
      
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleConvertDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const link = document.createElement('a');
        let fileName = imageName || 'converted-image';
        fileName = fileName.replace(/\.[^/.]+$/, "");
        
        // Determine extension
        let ext = '.png';
        if (convertFormat === 'image/jpeg') ext = '.jpg';
        if (convertFormat === 'image/webp') ext = '.webp';
        
        link.download = `${fileName}${ext}`;
        // Use format and quality
        link.href = canvas.toDataURL(convertFormat, convertQuality);
        link.click();
    }
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleCancel = () => {
    setHistory([]);
    setHistoryIndex(-1);
    setCollageImages([]);
    setEditMode('none');
    setImageName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setCurrentView('home');
  };
  
  const handleHomeSelection = (selection: EditMode) => {
      setCurrentView('editor');
      handleModeChange(selection);
      
      if (!isImageLoaded && selection !== 'collage') {
          fileInputRef.current?.click();
      }
  };
  
  if (currentView === 'home') {
    return (
        <div style={{
            '--bg-app': theme.appBg,
            '--bg-panel': theme.panelBg,
            '--bg-secondary': theme.secondaryBg,
            '--color-accent': theme.accentColor,
            '--color-text': theme.textColor,
        } as React.CSSProperties}>
            <HomeView onSelection={handleHomeSelection} />
        </div>
    );
  }
  
  const isPropertiesPanelVisible = editMode !== 'none';

  return (
    <div 
        className="flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300"
        style={{
            '--bg-app': theme.appBg,
            '--bg-panel': theme.panelBg,
            '--bg-secondary': theme.secondaryBg,
            '--color-accent': theme.accentColor,
            '--color-text': theme.textColor,
            backgroundColor: 'var(--bg-app)',
            color: 'var(--color-text)'
        } as React.CSSProperties}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*, .tga" className="hidden" />
      <input type="file" ref={collageFileInputRef} onChange={handleCollageFileChange} accept="image/*, .tga" multiple className="hidden" />

      <Header
        imageName={imageName}
        isImageLoaded={isImageLoaded}
        onCancel={handleCancel}
        onUndo={handleUndo}
        onDownload={handleDownload}
        historyIndex={historyIndex}
        onOpenSettings={() => setShowSettings(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Toolbar
          editMode={editMode}
          isImageLoaded={isImageLoaded}
          onUpload={() => fileInputRef.current?.click()}
          onModeChange={handleModeChange}
          onHome={() => setCurrentView('home')}
        />

        <MainContent
          editMode={editMode}
          isProcessing={isProcessing}
          currentImage={currentImage}
          canvasRef={canvasRef}
          onCanvasClick={handleCanvasClickForBgRemove}
          onUploadClick={() => fileInputRef.current?.click()}
          collageImages={collageImages}
          onAddCollageImagesClick={() => collageFileInputRef.current?.click()}
          zoom={zoom}
          onZoomChange={setZoom}
          cropRect={cropRect}
          onCropRectChange={setCropRect}
          onCropDoubleClick={applyCrop}
        />

        {isPropertiesPanelVisible && (
          <PropertiesPanel
            editMode={editMode}
            isProcessing={isProcessing}
            // All tools
            onModeChange={setEditMode}
            // Crop
            onApplyCrop={applyCrop}
            setCropAspectRatio={setCropAspectRatio}
            // Rotate & Flip
            onRotate90={applyRotate90}
            onFlip={applyFlip}
            rotationAngle={rotationAngle}
            onRotationAngleChange={setRotationAngle}
            onApplyCustomRotation={applyCustomRotation}
            // Grayscale
            onGrayscale={applyGrayscale}
            // Resize
            resizeWidth={resizeWidth}
            onResizeWidthChange={setResizeWidth}
            resizeHeight={resizeHeight}
            onResizeHeightChange={setResizeHeight}
            onApplyResize={applyResize}
            // Cutout (Background Removal)
            cutoutColor={cutoutColor}
            onCutoutColorChange={setCutoutColor}
            cutoutTolerance={cutoutTolerance}
            onCutoutToleranceChange={setCutoutTolerance}
            cutoutSoftness={cutoutSoftness}
            onCutoutSoftnessChange={setCutoutSoftness}
            onManualCutout={handleManualCutout}
            onRemoveBlackBg={handleRemoveBlackBackground} // PASS NEW HANDLER
            // Color Adjust
            colorAdjustments={colorAdjustments}
            onColorAdjustmentsChange={setColorAdjustments}
            onApplyColorAdjustments={applyColorAdjustments}
            // Collage
            collageLayoutType={collageLayoutType}
            onCollageLayoutTypeChange={setCollageLayoutType}
            gridCols={gridCols}
            onGridColsChange={setGridCols}
            gridRows={gridRows}
            onGridRowsChange={setGridRows}
            collageImages={collageImages}
            onCreateCollage={createCollage}
            // Convert
            convertFormat={convertFormat}
            onConvertFormatChange={setConvertFormat}
            convertQuality={convertQuality}
            onConvertQualityChange={setConvertQuality}
            onConvertExport={handleConvertDownload}
          />
        )}
      </div>

      {showSettings && (
        <SettingsModal 
            colors={theme} 
            onColorChange={(k, v) => setTheme(p => ({...p, [k]: v}))}
            onReset={() => setTheme({
                appBg: '#1c1c1c',
                panelBg: '#292929',
                secondaryBg: '#333333',
                accentColor: '#a1de76',
                textColor: '#f5f5f5'
            })}
            onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}