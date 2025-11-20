
import JSZip from "jszip";
import type { BatchImage, BatchOperation } from '../types';

interface ProcessResult {
    url: string;
    width: number;
    height: number;
}

// Helper to Create 32-bit BMP Blob
function createBMP(ctx: CanvasRenderingContext2D, width: number, height: number): Blob {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const headerSize = 54;
    const fileSize = headerSize + data.length;
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // Bitmap File Header
    view.setUint16(0, 0x424D); // BM
    view.setUint32(2, fileSize, true);
    view.setUint32(10, headerSize, true); // Offset

    // DIB Header
    view.setUint32(14, 40, true); // Header Size
    view.setInt32(18, width, true);
    view.setInt32(22, -height, true); // Negative height for top-down
    view.setUint16(26, 1, true); // Planes
    view.setUint16(28, 32, true); // Bit count
    view.setUint32(30, 0, true); // Compression (BI_RGB)
    view.setUint32(34, data.length, true); // Image Size

    // Pixel Data
    let offset = 54;
    for (let i = 0; i < data.length; i += 4) {
        view.setUint8(offset++, data[i + 2]); // B
        view.setUint8(offset++, data[i + 1]); // G
        view.setUint8(offset++, data[i]);     // R
        view.setUint8(offset++, data[i + 3]); // A
    }

    return new Blob([buffer], { type: 'image/bmp' });
}

// Helper to Create ICO Blob (PNG encapsulated)
async function createICO(ctx: CanvasRenderingContext2D, width: number, height: number): Promise<Blob> {
    const pngDataUrl = ctx.canvas.toDataURL('image/png');
    const res = await fetch(pngDataUrl);
    const pngBuffer = await res.arrayBuffer();
    
    const headerSize = 6;
    const entrySize = 16;
    const fileSize = headerSize + entrySize + pngBuffer.byteLength;
    
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    
    // Header
    view.setUint16(0, 0, true); // Reserved
    view.setUint16(2, 1, true); // Type 1 = Icon
    view.setUint16(4, 1, true); // Count = 1

    // Entry
    const w = width >= 256 ? 0 : width;
    const h = height >= 256 ? 0 : height;
    view.setUint8(6, w);
    view.setUint8(7, h);
    view.setUint8(8, 0); // Palette count
    view.setUint8(9, 0); // Reserved
    view.setUint16(10, 1, true); // Color planes
    view.setUint16(12, 32, true); // BPP
    view.setUint32(14, pngBuffer.byteLength, true); // Size
    view.setUint32(18, headerSize + entrySize, true); // Offset

    // Copy PNG Data
    const bytes = new Uint8Array(buffer);
    bytes.set(new Uint8Array(pngBuffer), headerSize + entrySize);

    return new Blob([buffer], { type: 'image/x-icon' });
}

// Helper to Create SVG Blob
function createSVG(ctx: CanvasRenderingContext2D, width: number, height: number): Blob {
    const pngData = ctx.canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <image href="${pngData}" width="${width}" height="${height}" />
    </svg>`;
    return new Blob([svg], { type: 'image/svg+xml' });
}

async function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(blob);
    });
}

export async function processBatchImage(
    imageObj: BatchImage,
    operation: BatchOperation
): Promise<ProcessResult> {
    return new Promise((resolve, reject) => {
        // Always use the latest version of the image (processedUrl) if it exists, otherwise the original
        const sourceUrl = imageObj.processedUrl || imageObj.previewUrl;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = async () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) throw new Error("Cannot create canvas context");

                const currentW = img.width;
                const currentH = img.height;

                // --- 1. Setup Canvas Dimensions based on Operation ---
                
                if (operation.type === 'rotate') {
                     // If rotating 90 degrees, swap dimensions
                     const is90 = Math.abs(operation.angle) % 180 === 90;
                     if (is90) {
                         canvas.width = currentH;
                         canvas.height = currentW;
                     } else {
                         // For custom angles, we need a larger bounding box
                         const rad = (operation.angle * Math.PI) / 180;
                         canvas.width = Math.abs(currentW * Math.cos(rad)) + Math.abs(currentH * Math.sin(rad));
                         canvas.height = Math.abs(currentW * Math.sin(rad)) + Math.abs(currentH * Math.cos(rad));
                     }
                } 
                else if (operation.type === 'resize') {
                    canvas.width = operation.width;
                    canvas.height = operation.height;
                } 
                else if (operation.type === 'crop') {
                    // Center Crop Logic
                    const targetRatio = operation.ratio;
                    const currentRatio = currentW / currentH;
                    
                    let cropW = currentW;
                    let cropH = currentH;

                    if (currentRatio > targetRatio) {
                        // Image is wider than target -> limit width
                        cropW = currentH * targetRatio;
                    } else {
                        // Image is taller than target -> limit height
                        cropH = currentW / targetRatio;
                    }
                    canvas.width = cropW;
                    canvas.height = cropH;
                }
                else {
                    // Grayscale, Flip, Color Adjust, Cutout keep dimensions
                    canvas.width = currentW;
                    canvas.height = currentH;
                }

                // --- 2. Draw & Transform ---

                // Handle Color Adjustments via Context Filter (must be set before draw)
                if (operation.type === 'color-adjust') {
                    ctx.filter = `hue-rotate(${operation.hue}deg) saturate(${operation.saturation}%) brightness(${operation.brightness}%)`;
                }

                if (operation.type === 'rotate') {
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.rotate((operation.angle * Math.PI) / 180);
                    ctx.drawImage(img, -currentW / 2, -currentH / 2);
                }
                else if (operation.type === 'flip') {
                    ctx.save();
                    if (operation.direction === 'horizontal') {
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                    } else {
                        ctx.translate(0, canvas.height);
                        ctx.scale(1, -1);
                    }
                    ctx.drawImage(img, 0, 0);
                    ctx.restore();
                }
                else if (operation.type === 'resize') {
                    // High quality resize
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                else if (operation.type === 'crop') {
                     // Calculate center source coordinates
                     const sx = (currentW - canvas.width) / 2;
                     const sy = (currentH - canvas.height) / 2;
                     ctx.drawImage(img, sx, sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                }
                else {
                    // Default copy (Grayscale, Cutout, Color Adjust draw here)
                    ctx.drawImage(img, 0, 0);
                }
                
                // Reset filter for subsequent pixel manipulation operations
                ctx.filter = 'none';

                // --- 3. Pixel Manipulation Operations ---

                if (operation.type === 'grayscale') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        let gray = 0;
                        
                        if (operation.algorithm === 'max') gray = Math.max(r, g, b);
                        else if (operation.algorithm === 'average') gray = (r + g + b) / 3;
                        else gray = r * 0.299 + g * 0.587 + b * 0.114; // Weighted
                        
                        data[i] = gray;
                        data[i + 1] = gray;
                        data[i + 2] = gray;
                    }
                    ctx.putImageData(imageData, 0, 0);
                }
                else if (operation.type === 'cutout-color') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    // Parse Hex Color
                    let rTarget = 255, gTarget = 255, bTarget = 255;
                    const hex = operation.color.replace(/^#/, '');
                    if (hex.length === 6) {
                        rTarget = parseInt(hex.slice(0, 2), 16);
                        gTarget = parseInt(hex.slice(2, 4), 16);
                        bTarget = parseInt(hex.slice(4, 6), 16);
                    }

                    const tolerance = operation.tolerance;
                    const softness = operation.softness;

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i], g = data[i+1], b = data[i+2];
                        const dist = Math.sqrt(Math.pow(r - rTarget, 2) + Math.pow(g - gTarget, 2) + Math.pow(b - bTarget, 2));
                        
                        if (dist <= tolerance) {
                            data[i+3] = 0;
                        } else if (dist <= tolerance + softness) {
                            const progress = (dist - tolerance) / softness;
                            const newAlpha = Math.floor(progress * 255);
                            if (newAlpha < data[i+3]) data[i+3] = newAlpha;
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                }
                else if (operation.type === 'remove-bg-black') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i], g = data[i+1], b = data[i+2];
                        const max = Math.max(r, g, b);
                        if (max === 0) {
                            data[i+3] = 0;
                        } else {
                            // Unmultiply alpha
                            data[i+3] = max;
                            data[i] = (r / max) * 255;
                            data[i+1] = (g / max) * 255;
                            data[i+2] = (b / max) * 255;
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                }

                // --- 4. Export ---
                const format = (operation.type === 'convert') ? operation.format : 'image/png';
                const quality = (operation.type === 'convert') ? operation.quality : 1.0;
                
                let resultUrl = '';
                
                if (format === 'image/bmp') {
                     const blob = createBMP(ctx, canvas.width, canvas.height);
                     resultUrl = await blobToDataURL(blob);
                } else if (format === 'image/x-icon') {
                     const blob = await createICO(ctx, canvas.width, canvas.height);
                     resultUrl = await blobToDataURL(blob);
                } else if (format === 'image/svg+xml') {
                     const blob = createSVG(ctx, canvas.width, canvas.height);
                     resultUrl = await blobToDataURL(blob);
                } else {
                     // Standard (PNG, JPG, WEBP, AVIF, TIFF)
                     // Note: TIFF support varies by browser, usually falls back to PNG if unsupported
                     resultUrl = canvas.toDataURL(format, quality);
                }

                resolve({
                    url: resultUrl,
                    width: canvas.width,
                    height: canvas.height
                });

            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => reject(new Error("Failed to load image for processing"));
        img.src = sourceUrl;
    });
}

export async function createBatchZip(images: BatchImage[]): Promise<Blob> {
    const zip = new JSZip();
    
    images.forEach((img) => {
        // Prefer processed, fall back to original
        const sourceUrl = img.processedUrl || img.previewUrl;
        if (sourceUrl) {
            const base64Data = sourceUrl.split(',')[1];
            
            // Determine extension based on current format
            let ext = 'png';
            if (img.currentFormat === 'image/jpeg') ext = 'jpg';
            else if (img.currentFormat === 'image/webp') ext = 'webp';
            else if (img.currentFormat === 'image/bmp') ext = 'bmp';
            else if (img.currentFormat === 'image/x-icon') ext = 'ico';
            else if (img.currentFormat === 'image/tiff') ext = 'tiff';
            else if (img.currentFormat === 'image/svg+xml') ext = 'svg';
            else if (img.currentFormat === 'image/avif') ext = 'avif';
            else if (img.file.name.toLowerCase().endsWith('.tga')) ext = 'png'; 
            
            // Remove old extension from name
            const originalName = img.file.name.replace(/\.[^/.]+$/, "");
            zip.file(`${originalName}_edited.${ext}`, base64Data, { base64: true });
        }
    });

    return await zip.generateAsync({ type: 'blob' });
}
