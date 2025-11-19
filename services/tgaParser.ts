
/**
 * Simple TGA Parser for React Image Editor
 * Supports: Uncompressed RGB (24-bit) and RGBA (32-bit) TGA files.
 * Note: RLE compressed TGA (Type 10) is not currently supported to keep the bundle light.
 */

export async function processTgaFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const buffer = event.target?.result as ArrayBuffer;
                if (!buffer) throw new Error("Failed to read file buffer");
                
                const dataUrl = parseTgaToDataURL(new DataView(buffer));
                resolve(dataUrl);
            } catch (e) {
                reject(e);
            }
        };
        
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
    });
}

function parseTgaToDataURL(view: DataView): string {
    // TGA Header (18 bytes)
    // Offset 2: Data Type (2 = Uncompressed RGB, 10 = RLE RGB)
    // Offset 12: Width (2 bytes, Little Endian)
    // Offset 14: Height (2 bytes, Little Endian)
    // Offset 16: Pixel Depth (1 byte, usually 24 or 32)
    // Offset 17: Image Descriptor (bit 5 sets direction)

    const idLength = view.getUint8(0);
    const dataType = view.getUint8(2);
    const width = view.getUint16(12, true);
    const height = view.getUint16(14, true);
    const pixelDepth = view.getUint8(16);
    const descriptor = view.getUint8(17);

    // Sanity checks
    if (width <= 0 || height <= 0) {
        throw new Error("Invalid TGA dimensions");
    }
    
    if (dataType !== 2) {
        throw new Error(`Unsupported TGA type: ${dataType}. Only uncompressed RGB/RGBA (Type 2) is supported.`);
    }

    if (pixelDepth !== 24 && pixelDepth !== 32) {
        throw new Error(`Unsupported TGA pixel depth: ${pixelDepth}. Only 24-bit and 32-bit are supported.`);
    }

    // Offset to pixel data: Header (18) + ID Length + Color Map (usually 0 for Type 2)
    let offset = 18 + idLength;
    // Note: We assume no Color Map for Type 2 as per standard specs for TrueColor

    const numPixels = width * height;
    const bytesPerPixel = pixelDepth / 8;
    
    // Create canvas to draw pixels
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not create canvas context");

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // TGA pixels are usually stored:
    // 1. Bottom-to-top (unless bit 5 of descriptor is set)
    // 2. BGR or BGRA order
    
    const isTopDown = (descriptor & 0x20) !== 0;

    for (let i = 0; i < numPixels; i++) {
        // Calculate x, y based on orientation
        let x = i % width;
        let y = Math.floor(i / width);

        // If bottom-up (standard TGA), flip Y
        if (!isTopDown) {
            y = (height - 1) - y;
        }

        // Target index in ImageData (always Top-Down RGBA)
        const destIdx = (y * width + x) * 4;

        // Read Source (BGR or BGRA)
        const b = view.getUint8(offset);
        const g = view.getUint8(offset + 1);
        const r = view.getUint8(offset + 2);
        const a = pixelDepth === 32 ? view.getUint8(offset + 3) : 255;

        data[destIdx] = r;
        data[destIdx + 1] = g;
        data[destIdx + 2] = b;
        data[destIdx + 3] = a;

        offset += bytesPerPixel;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
}
