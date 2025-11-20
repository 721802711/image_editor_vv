
export type EditMode = 'none' | 'rotate' | 'resize' | 'crop' | 'grayscale' | 'collage' | 'remove-bg' | 'color-adjust' | 'convert' | 'batch';

export type ViewMode = 'home' | 'gallery' | 'editor';

export type IconStyle = 
  | 'standard' 
  | 'thin' 
  | 'bold' 
  | 'technical' 
  | 'sketch' 
  | 'neon' 
  | 'soft' 
  | 'ink' 
  | 'thread' 
  | 'block';

export type IconName = 
  | 'upload' 
  | 'rotate' 
  | 'resize' 
  | 'crop'
  | 'grayscale' 
  | 'collage' 
  | 'download' 
  | 'add' 
  | 'close' 
  | 'reset'
  | 'palette'
  | 'undo'
  | 'save'
  | 'home'
  | 'cutout'
  | 'expand'
  | 'erase'
  | 'rotate-left'
  | 'flip-horizontal'
  | 'flip-vertical'
  | 'layout-horizontal'
  | 'layout-vertical'
  | 'layout-grid'
  | 'ratio-free'
  | 'ratio-1-1'
  | 'ratio-16-9'
  | 'ratio-4-3'
  | 'settings'
  | 'file-type'
  | 'layers'
  | 'trash'
  | 'check'
  | 'alert'
  | 'archive'
  | 'pencil'
  | 'image'
  | 'wand'
  | 'checkbox-on'
  | 'checkbox-off';

export type CollageLayoutType = 'horizontal' | 'vertical' | 'grid';

export interface BatchImage {
    id: string;
    file: File;
    previewUrl: string;
    status: 'idle' | 'processing' | 'done' | 'error';
    processedUrl?: string;
    error?: string;
    // Metadata tracking
    originalWidth: number;
    originalHeight: number;
    currentWidth: number;
    currentHeight: number;
    currentFormat: string; // e.g. 'image/png', 'image/jpeg'
}

// Simplified Operation Definition for Imperative Batch Processing
export type BatchOperation = 
    | { type: 'rotate'; angle: number } // Cumulative rotation (e.g. +90, -90) or absolute if custom
    | { type: 'flip'; direction: 'horizontal' | 'vertical' }
    | { type: 'resize'; width: number; height: number; maintainAspect: boolean }
    | { type: 'crop'; ratio: number } // Center crop
    | { type: 'grayscale'; algorithm: 'max' | 'average' | 'weighted' }
    | { type: 'convert'; format: string; quality: number }
    | { type: 'color-adjust'; hue: number; saturation: number; brightness: number }
    | { type: 'cutout-color'; color: string; tolerance: number; softness: number }
    | { type: 'remove-bg-black' };