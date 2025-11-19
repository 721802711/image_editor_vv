export type EditMode = 'none' | 'rotate' | 'resize' | 'crop' | 'grayscale' | 'collage' | 'remove-bg' | 'color-adjust' | 'convert';

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
  | 'file-type';

export type CollageLayoutType = 'horizontal' | 'vertical' | 'grid';