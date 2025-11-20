
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { EditMode, CollageLayoutType, BatchImage, ViewMode, BatchOperation, IconStyle } from './types';
import Header from './components/editor/Header';
import Toolbar from './components/editor/Toolbar';
import MainContent from './components/editor/MainContent';
import PropertiesPanel from './components/editor/PropertiesPanel';
import SettingsModal from './components/modals/SettingsModal';
import Icon from './components/Icon';
import { processTgaFile } from './services/tgaParser';
import { processBatchImage, createBatchZip } from './services/batchService';


export default function App() {
  // --- View State ---
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [editMode, setEditMode] = useState<EditMode>('none');
  
  // --- Notification State ---
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  // --- Image Data State ---
  const [batchImages, setBatchImages] = useState<BatchImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // History for Single Editor
  const [history, setHistory] = useState<HTMLImageElement[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [activeImageId, setActiveImageId] = useState<string | null>(null); 
  const [imageName, setImageName] = useState<string>('');

  // Collage State
  const [collageImages, setCollageImages] = useState<HTMLImageElement[]>([]);
  const [collageLayoutType, setCollageLayoutType] = useState<CollageLayoutType>('grid');
  const [gridCols, setGridCols] = useState(2);
  const [gridRows, setGridRows] = useState(2);

  // --- Editor Tool States ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  // Color Adjust
  const [colorAdjustments, setColorAdjustments] = useState({ hue: 0, saturation: 100, brightness: 100 });
  // Rotate
  const [rotationAngle, setRotationAngle] = useState(0);
  // Resize
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  // Crop
  const [cropRect, setCropRect] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  // Cutout
  const [cutoutColor, setCutoutColor] = useState('#ffffff');
  const [cutoutTolerance, setCutoutTolerance] = useState(30);
  const [cutoutSoftness, setCutoutSoftness] = useState(0);
  // Convert
  const [convertFormat, setConvertFormat] = useState<string>('image/png');
  const [convertQuality, setConvertQuality] = useState<number>(0.92);

  // --- Theme State ---
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState({
      appBg: '#1c1c1c',
      panelBg: '#292929',
      secondaryBg: '#333333',
      accentColor: '#a1de76',
      textColor: '#f5f5f5'
  });
  const [iconStyle, setIconStyle] = useState<IconStyle>('standard');
  const [iconWeight, setIconWeight] = useState<number>(1.5);

  // Handle Icon Style Change with Smart Defaults for Weight
  const handleIconStyleChange = (style: IconStyle) => {
      setIconStyle(style);
      // Set smart defaults when switching styles
      switch(style) {
          case 'thin': setIconWeight(1); break;
          case 'thread': setIconWeight(0.8); break;
          case 'bold': setIconWeight(2.5); break;
          case 'block': setIconWeight(3); break;
          case 'ink': setIconWeight(2.2); break;
          case 'neon': setIconWeight(1.8); break;
          case 'soft': setIconWeight(2); break;
          default: setIconWeight(1.5); break;
      }
  };

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); 

  const currentImage = history[historyIndex] || null;
  const isImageLoaded = !!currentImage;

  // --- Helpers ---
  
  const showNotification = (message: string) => {
      if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
      }
      setNotification(message);
      notificationTimeoutRef.current = window.setTimeout(() => {
          setNotification(null);
      }, 3000);
  };

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

  // --- Drawing Logic ---
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();

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

  // Update local edit states when image loads
  useEffect(() => {
    if (currentImage) {
      setResizeWidth(currentImage.width);
      setResizeHeight(currentImage.height);
    }
  }, [currentImage]);
  
  // Redraw loop
  useEffect(() => {
    if (editMode === 'color-adjust' && currentImage) {
      drawImage(currentImage, colorAdjustments, 0);
    } else if (editMode === 'rotate' && currentImage) {
      drawImage(currentImage, undefined, rotationAngle);
    } else if (editMode !== 'batch' && editMode !== 'collage' && currentView === 'editor') {
      drawImage(currentImage);
    }
  }, [currentImage, drawImage, colorAdjustments, editMode, rotationAngle, currentView]);


  // --- Gallery / File Handling ---

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      
      const newBatchImages: BatchImage[] = [];
      
      for (const file of (Array.from(files) as File[])) {
          let previewUrl = '';
          let width = 0;
          let height = 0;
          
          // Determine type from extension if standard type detection fails or is generic
          const name = file.name.toLowerCase();
          let mimeType = file.type;
          
          if (!mimeType || mimeType === '') {
              if (name.endsWith('.svg')) mimeType = 'image/svg+xml';
              else if (name.endsWith('.tga')) mimeType = 'image/x-tga';
              else if (name.endsWith('.ico')) mimeType = 'image/x-icon';
              else if (name.endsWith('.bmp')) mimeType = 'image/bmp';
          } else if (name.endsWith('.svg') && mimeType !== 'image/svg+xml') {
              // Force SVG type if extension says so
              mimeType = 'image/svg+xml';
          }

          try {
            if (name.endsWith('.tga')) {
                previewUrl = await processTgaFile(file);
            } else {
                previewUrl = URL.createObjectURL(file);
            }

            // Get dimensions
            await new Promise<void>((resolve) => {
                 const img = new Image();
                 img.onload = () => {
                     width = img.width;
                     height = img.height;
                     resolve();
                 };
                 img.src = previewUrl;
            });

            newBatchImages.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                previewUrl,
                status: 'idle',
                originalWidth: width,
                originalHeight: height,
                currentWidth: width,
                currentHeight: height,
                currentFormat: mimeType || 'image/png'
            });
          } catch (err: any) {
              console.error("Failed to load image", file.name, err);
          }
      }
      
      setBatchImages(prev => [...prev, ...newBatchImages]);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (id: string) => {
      setBatchImages(prev => prev.filter(img => img.id !== id));
      setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
      });
  };

  const toggleSelection = (id: string, multiSelect: boolean) => {
      const newSet = new Set(multiSelect ? selectedIds : []);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);

      if (currentView === 'gallery' && !multiSelect && newSet.size === 1) {
         if (['crop', 'rotate', 'resize', 'grayscale', 'remove-bg', 'color-adjust'].includes(editMode)) {
             enterSingleEditMode(id, editMode);
         }
      }
  };
  
  const selectAll = () => {
      if (selectedIds.size === batchImages.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(batchImages.map(i => i.id)));
      }
  };

  // --- Navigation & Mode Switching ---

  const handleHomeNavigation = (selection: 'gallery' | EditMode) => {
      if (selection === 'gallery') {
          setCurrentView('gallery');
          setEditMode('none');
      } else {
          setCurrentView('gallery');
          setEditMode(selection);
          if (batchImages.length === 0) {
              showNotification("Gallery is empty. Please add images.");
          } else {
              showNotification(`Select image(s) to ${selection}`);
          }
      }
  };

  const handleToolClick = (mode: EditMode) => {
      if (currentView === 'gallery') {
          if (['crop', 'rotate', 'resize', 'grayscale', 'remove-bg', 'color-adjust'].includes(mode)) {
              if (selectedIds.size === 1) {
                  const id = Array.from(selectedIds)[0] as string;
                  enterSingleEditMode(id, mode);
              } else {
                  setEditMode(mode);
                  if (selectedIds.size === 0) {
                      showNotification(`Batch ${mode} mode. Select images to apply.`);
                  } else {
                      showNotification(`Batch ${mode} active for ${selectedIds.size} images.`);
                      // Reset local tool states for batch usage
                      setRotationAngle(0);
                  }
              }
          }
          else if (mode === 'collage') {
              if (selectedIds.size > 0) {
                  enterCollageMode();
              } else {
                  setEditMode('collage');
                  showNotification("Select multiple images for collage.");
              }
          }
          else if (mode === 'batch' || mode === 'convert') {
              setEditMode(mode);
          }
      } else {
          handleChangeToolInEditor(mode);
      }
  };

  const enterSingleEditMode = (id: string, initialMode: EditMode) => {
      const imgObj = batchImages.find(i => i.id === id);
      if (!imgObj) return;

      const img = new Image();
      img.onload = () => {
          setHistory([img]);
          setHistoryIndex(0);
          setActiveImageId(id);
          setImageName(imgObj.file.name);
          setCurrentView('editor');
          handleChangeToolInEditor(initialMode === 'none' ? 'crop' : initialMode);
      };
      img.src = imgObj.processedUrl || imgObj.previewUrl;
  };

  const enterCollageMode = () => {
      const selectedImages = batchImages.filter(i => selectedIds.has(i.id));
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      selectedImages.forEach(imgObj => {
          const img = new Image();
          img.onload = () => {
              loadedImages.push(img);
              loadedCount++;
              if (loadedCount === selectedImages.length) {
                  setCollageImages(loadedImages);
                  setHistory([]); 
                  setHistoryIndex(-1);
                  setActiveImageId(null);
                  setImageName("Collage");
                  setCurrentView('editor');
                  setEditMode('collage');
              }
          };
          img.src = imgObj.processedUrl || imgObj.previewUrl;
      });
  };

  const handleChangeToolInEditor = (mode: EditMode) => {
    if (editMode === 'color-adjust' && mode !== 'color-adjust') applyColorAdjustments();
    if (editMode === 'rotate' && mode !== 'rotate' && rotationAngle !== 0) setRotationAngle(0); 
    
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

  const handleSaveToGallery = () => {
      if (activeImageId && canvasRef.current) {
         const dataUrl = canvasRef.current.toDataURL('image/png');
         const width = canvasRef.current.width;
         const height = canvasRef.current.height;
         
         setBatchImages(prev => prev.map(img => 
             img.id === activeImageId ? { 
                 ...img, 
                 processedUrl: dataUrl, 
                 status: 'done',
                 currentWidth: width,
                 currentHeight: height
             } : img
         ));
         showNotification("Changes saved to Gallery!");
      }
  };

  const handleReturnToGallery = () => {
      setCurrentView('gallery');
      setActiveImageId(null);
      setHistory([]);
      setCollageImages([]);
  };
  
  const handleGoHome = () => {
      setCurrentView('home');
      setEditMode('none');
      setActiveImageId(null);
      setHistory([]);
      setCollageImages([]);
  };


  // --- NEW BATCH LOGIC (Imperative & Cumulative) ---

  // The Core Function: Iterates selected images, processes them, and updates the list
  const runBatchOperation = async (operation: BatchOperation) => {
    if (selectedIds.size === 0) {
        showNotification("No images selected.");
        return;
    }

    setIsProcessing(true);
    setBatchImages(prev => prev.map(img => selectedIds.has(img.id) ? { ...img, status: 'processing' } : img));

    const imagesToProcess = batchImages.filter(img => selectedIds.has(img.id));
    const results: { id: string, url: string, width: number, height: number, error?: string }[] = [];

    for (const img of imagesToProcess) {
        try {
            // Service returns { url, width, height }
            const result = await processBatchImage(img, operation);
            results.push({ id: img.id, url: result.url, width: result.width, height: result.height });
        } catch (err: any) {
            console.error(err);
            results.push({ id: img.id, url: '', width: 0, height: 0, error: 'Failed' });
        }
    }

    // Update State: Processed URL, Dimensions, and Format (if convert)
    setBatchImages(prev => prev.map(img => {
        const res = results.find(r => r.id === img.id);
        if (res) {
            return res.error 
                ? { ...img, status: 'error', error: res.error } 
                : { 
                    ...img, 
                    status: 'done', 
                    processedUrl: res.url,
                    currentWidth: res.width,
                    currentHeight: res.height,
                    currentFormat: operation.type === 'convert' ? operation.format : img.currentFormat
                  };
        }
        return img;
    }));

    setIsProcessing(false);
    showNotification(`Batch ${operation.type} complete!`);
  };


  const downloadBatchZipFile = async () => {
      const imagesToZip = batchImages.filter(img => selectedIds.has(img.id));
      if (imagesToZip.length === 0) {
          showNotification("No images selected to download.");
          return;
      }
      
      setIsProcessing(true);
      try {
        // Uses the latest processedUrl state and respects currentFormat
        const blob = await createBatchZip(imagesToZip);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'batch_processed_images.zip';
        link.click();
      } catch (e: any) {
        console.error("Zip failed", e);
        showNotification("Failed to create ZIP file.");
      }
      setIsProcessing(false);
  };


  // --- Single Edit Functions ---
  const applyColorAdjustments = () => {
    if (!currentImage) return;
    drawImage(currentImage, colorAdjustments);
    updateCurrentImageFromCanvas();
    setColorAdjustments({ hue: 0, saturation: 100, brightness: 100 });
  };

  const applyRotate90 = (direction: 'left' | 'right') => {
    if (!currentImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = currentImage;
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
      if (type === 'max') gray = Math.max(r, g, b);
      else if (type === 'weighted') gray = r * 0.299 + g * 0.587 + b * 0.114;
      else gray = (r + g + b) / 3;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);
    updateCurrentImageFromCanvas();
  };

  const applyCrop = () => {
      if (!currentImage || !cropRect || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cropRect.width;
      tempCanvas.height = cropRect.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(currentImage, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, cropRect.width, cropRect.height);
      canvas.width = cropRect.width;
      canvas.height = cropRect.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
      updateCurrentImageFromCanvas();
      setCropRect(null);
  };
  
  const setCropAspectRatio = (ratio: number | null) => {
      if (!currentImage) return;
      const { width, height } = currentImage;
      let newW = width * 0.8;
      let newH = height * 0.8;
      if (ratio !== null) {
          if (width / height > ratio) {
              newH = height * 0.8;
              newW = newH * ratio;
          } else {
              newW = width * 0.8;
              newH = newW / ratio;
          }
      }
      setCropRect({ x: (width - newW) / 2, y: (height - newH) / 2, width: newW, height: newH });
  };

  const handleManualCutout = () => {
      if (!canvasRef.current || isProcessing) return;
      setIsProcessing(true);
      setTimeout(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let rTarget = 255, gTarget = 255, bTarget = 255;
        try {
            const hex = cutoutColor.replace(/^#/, '');
            if (hex.length === 6) {
                rTarget = parseInt(hex.slice(0, 2), 16);
                gTarget = parseInt(hex.slice(2, 4), 16);
                bTarget = parseInt(hex.slice(4, 6), 16);
            }
        } catch (e: any) { console.error(e); }

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            const dist = Math.sqrt(Math.pow(r - rTarget, 2) + Math.pow(g - gTarget, 2) + Math.pow(b - bTarget, 2));
            if (dist <= cutoutTolerance) data[i+3] = 0;
            else if (dist <= cutoutTolerance + cutoutSoftness) {
                const progress = (dist - cutoutTolerance) / cutoutSoftness;
                const newAlpha = Math.floor(progress * 255);
                if (newAlpha < data[i+3]) data[i+3] = newAlpha;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        updateCurrentImageFromCanvas();
        setIsProcessing(false);
      }, 50);
  };
  
  const handleRemoveBlackBackground = () => {
    if (!canvasRef.current || isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            const max = Math.max(r, g, b);
            if (max === 0) data[i+3] = 0;
            else {
                data[i+3] = max;
                data[i] = (r/max)*255; data[i+1] = (g/max)*255; data[i+2] = (b/max)*255;
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

    if (collageLayoutType === 'horizontal') { cols = collageImages.length; rows = 1; }
    else if (collageLayoutType === 'vertical') { cols = 1; rows = collageImages.length; }
    else { cols = Math.max(1, gridCols); rows = Math.max(1, gridRows); }

    if (cols <= 0 || rows <= 0) return;
    canvas.width = cols * thumbWidth + (cols - 1) * gap;
    canvas.height = rows * thumbHeight + (rows - 1) * gap;
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
    };
    img.src = dataUrl;
  };
  
  const handleDownload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        let fileName = imageName || 'edited-image';
        fileName = fileName.replace(/\.[^/.]+$/, "");
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
  };

  // --- Render ---
  const isPropertiesPanelVisible = editMode !== 'none' && currentView !== 'home';
  
  return (
    <div 
        className="flex flex-col h-screen font-sans overflow-hidden transition-colors duration-300"
        style={{
            '--bg-app': theme.appBg,
            '--bg-panel': theme.panelBg,
            '--bg-secondary': theme.secondaryBg,
            '--color-accent': theme.accentColor,
            '--color-text': theme.textColor,
            '--icon-weight': iconWeight,
            backgroundColor: 'var(--bg-app)',
            color: 'var(--color-text)'
        } as React.CSSProperties}
        data-icon-style={iconStyle}
    >
      <input type="file" ref={fileInputRef} onChange={handleAddImages} accept="image/*, .tga, .svg, .bmp, .ico" multiple className="hidden" />

      {currentView !== 'home' && (
        <Header
            imageName={currentView === 'gallery' ? 'Gallery' : imageName}
            isImageLoaded={isImageLoaded || currentView === 'gallery'}
            onCancel={currentView === 'editor' ? handleReturnToGallery : handleGoHome}
            onUndo={() => setHistoryIndex(prev => Math.max(0, prev - 1))}
            onDownload={handleDownload}
            onSave={handleSaveToGallery}
            historyIndex={historyIndex}
            onOpenSettings={() => setShowSettings(true)}
            isBatchMode={currentView === 'gallery'}
            onBackToBatch={currentView === 'editor' ? handleReturnToGallery : undefined}
            onBatchDownload={downloadBatchZipFile}
            hasSelection={selectedIds.size > 0}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar
          viewMode={currentView}
          editMode={editMode}
          isImageLoaded={selectedIds.size > 0 || isImageLoaded}
          selectedCount={selectedIds.size}
          onUpload={() => fileInputRef.current?.click()}
          onModeChange={handleToolClick}
          onHome={handleGoHome}
          onGallery={handleReturnToGallery}
        />

        <MainContent
            view={currentView}
            editMode={editMode}
            isProcessing={isProcessing}
            currentImage={currentImage}
            canvasRef={canvasRef}
            zoom={zoom}
            onZoomChange={setZoom}
            cropRect={cropRect}
            onCropRectChange={setCropRect}
            onCropDoubleClick={applyCrop}
            batchImages={batchImages}
            selectedIds={selectedIds}
            onSelectImage={toggleSelection}
            onSelectAll={selectAll}
            onRemoveImage={handleRemoveImage}
            onEditImage={(id) => enterSingleEditMode(id, 'none')}
            onAddImages={() => fileInputRef.current?.click()}
            collageImages={collageImages}
            onHomeNavigation={handleHomeNavigation}
            onCanvasClick={(e) => {
                if (editMode === 'remove-bg' && canvasRef.current) {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
                    const rect = canvas.getBoundingClientRect();
                    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                    const pixel = ctx.getImageData(x, y, 1, 1).data;
                    const toHex = (n: number) => n.toString(16).padStart(2, '0');
                    setCutoutColor(`#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`);
                }
            }}
        />

        {isPropertiesPanelVisible && (
          <PropertiesPanel
            editMode={editMode}
            isProcessing={isProcessing}
            onModeChange={setEditMode}
            // Single Mode Callbacks
            onApplyCrop={applyCrop}
            setCropAspectRatio={setCropAspectRatio}
            onRotate90={applyRotate90}
            onFlip={applyFlip}
            rotationAngle={rotationAngle}
            onRotationAngleChange={setRotationAngle}
            onApplyCustomRotation={applyCustomRotation}
            onGrayscale={applyGrayscale}
            resizeWidth={resizeWidth}
            onResizeWidthChange={setResizeWidth}
            resizeHeight={resizeHeight}
            onResizeHeightChange={setResizeHeight}
            onApplyResize={applyResize}
            cutoutColor={cutoutColor}
            onCutoutColorChange={setCutoutColor}
            cutoutTolerance={cutoutTolerance}
            onCutoutToleranceChange={setCutoutTolerance}
            cutoutSoftness={cutoutSoftness}
            onCutoutSoftnessChange={setCutoutSoftness}
            onManualCutout={handleManualCutout}
            onRemoveBlackBg={handleRemoveBlackBackground}
            colorAdjustments={colorAdjustments}
            onColorAdjustmentsChange={setColorAdjustments}
            onApplyColorAdjustments={applyColorAdjustments}
            collageLayoutType={collageLayoutType}
            onCollageLayoutTypeChange={setCollageLayoutType}
            gridCols={gridCols}
            onGridColsChange={setGridCols}
            gridRows={gridRows}
            onGridRowsChange={setGridRows}
            collageImages={collageImages}
            onCreateCollage={createCollage}
            convertFormat={convertFormat}
            onConvertFormatChange={setConvertFormat}
            convertQuality={convertQuality}
            onConvertQualityChange={setConvertQuality}
            onConvertExport={() => {
                 const canvas = canvasRef.current;
                 if (canvas) {
                     const link = document.createElement('a');
                     const ext = convertFormat === 'image/jpeg' ? '.jpg' : convertFormat === 'image/webp' ? '.webp' : '.png';
                     link.download = `${imageName.replace(/\.[^/.]+$/, "")}${ext}`;
                     link.href = canvas.toDataURL(convertFormat, convertQuality);
                     link.click();
                 }
            }}
            // Batch Logic: Separate View state from callbacks
            isBatchMode={currentView === 'gallery'}
            onBatchAction={(operation) => runBatchOperation(operation)}
            onBatchDownload={downloadBatchZipFile}
          />
        )}
      </div>

      {notification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[var(--bg-panel)] border border-[var(--color-accent)] text-[var(--color-text)] px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-bounce-in">
            <Icon name="check" className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {showSettings && (
        <SettingsModal 
            colors={theme} 
            onColorChange={(k, v) => setTheme(p => ({...p, [k]: v}))}
            onReset={() => setTheme({ appBg: '#1c1c1c', panelBg: '#292929', secondaryBg: '#333333', accentColor: '#a1de76', textColor: '#f5f5f5' })}
            onClose={() => setShowSettings(false)}
            iconStyle={iconStyle}
            onIconStyleChange={handleIconStyleChange}
            iconWeight={iconWeight}
            onIconWeightChange={setIconWeight}
        />
      )}
    </div>
  );
}
