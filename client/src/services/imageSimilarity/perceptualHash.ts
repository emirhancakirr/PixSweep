/**
 * Perceptual Hash Service
 * 
 * Implements dHash (difference hash) algorithm for image similarity detection.
 * Works entirely client-side using Canvas API.
 */

export interface HashResult {
  hash: bigint;
  hashString: string; // Hex string representation for debugging
}

/**
 * Configuration for perceptual hashing
 */
export interface HashConfig {
  width?: number; // Hash width (default: 9 for dHash)
  height?: number; // Hash height (default: 8 for dHash)
}

const DEFAULT_CONFIG: Required<HashConfig> = {
  width: 9,
  height: 8,
};

/**
 * Load image from File/Blob and return HTMLImageElement
 * 
 * @returns Object with image and cleanup function
 */
async function loadImage(
  source: File | Blob | string
): Promise<{ image: HTMLImageElement; cleanup?: () => void }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    let objectUrl: string | null = null;
    let cleanup: (() => void) | undefined;
    
    img.onload = () => {
      if (objectUrl) {
        cleanup = () => URL.revokeObjectURL(objectUrl!);
      }
      resolve({ image: img, cleanup });
    };
    
    img.onerror = (error) => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    if (typeof source === "string") {
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }
  });
}

/**
 * Convert image to grayscale and resize to specified dimensions
 */
function processImage(
  image: HTMLImageElement,
  width: number,
  height: number
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  
  if (!ctx) {
    throw new Error("Failed to get 2D context from canvas");
  }
  
  // Draw and resize image
  ctx.drawImage(image, 0, 0, width, height);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  
  // Convert to grayscale
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Grayscale: 0.299*R + 0.587*G + 0.114*B
    const gray = Math.round(
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    );
    data[i] = gray; // R
    data[i + 1] = gray; // G
    data[i + 2] = gray; // B
    // Alpha stays the same
  }
  
  return imageData;
}

/**
 * Compute dHash (difference hash) for an image
 * 
 * Algorithm:
 * 1. Resize image to (width+1) x height (e.g., 9x8)
 * 2. Convert to grayscale
 * 3. Compare each pixel with its right neighbor
 * 4. Generate hash bit by bit
 * 
 * @param source - Image source (File, Blob, or URL string)
 * @param config - Hash configuration
 * @returns Hash result with bigint and string representation
 */
export async function computeDHash(
  source: File | Blob | string,
  config: HashConfig = {}
): Promise<HashResult> {
  const { width, height } = { ...DEFAULT_CONFIG, ...config };
  
  // Load image
  const { image, cleanup } = await loadImage(source);
  
  try {
    // Process to grayscale and resize to (width+1) x height
    // We need width+1 because we compare each pixel with its right neighbor
    const imageData = processImage(image, width + 1, height);
    
    // Compute hash
    let hash = 0n;
    const pixels = imageData.data;
    const rowSize = (width + 1) * 4; // RGBA
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const leftIndex = y * rowSize + x * 4;
        const rightIndex = y * rowSize + (x + 1) * 4;
        
        const leftGray = pixels[leftIndex];
        const rightGray = pixels[rightIndex];
        
        // If left pixel is brighter than right, set bit to 1
        if (leftGray > rightGray) {
          const bitPosition = BigInt(y * width + x);
          hash |= 1n << bitPosition;
        }
      }
    }
    
    return {
      hash,
      hashString: hash.toString(16).padStart(Math.ceil((width * height) / 4), "0"),
    };
  } finally {
    // Clean up object URL if we created one
    cleanup?.();
  }
}

/**
 * Compute Hamming distance between two hashes
 * 
 * Hamming distance is the number of bits that differ between two hashes.
 * Lower distance = more similar images.
 * 
 * @param hash1 - First hash
 * @param hash2 - Second hash
 * @returns Hamming distance (0 = identical, higher = more different)
 */
export function hammingDistance(hash1: bigint, hash2: bigint): number {
  const xor = hash1 ^ hash2;
  
  // Count set bits in XOR result
  let distance = 0;
  let value = xor;
  
  while (value > 0n) {
    if (value & 1n) {
      distance++;
    }
    value >>= 1n;
  }
  
  return distance;
}

/**
 * Check if two images are similar based on hash distance
 * 
 * @param hash1 - First hash
 * @param hash2 - Second hash
 * @param threshold - Maximum Hamming distance to consider similar (default: 10)
 * @returns true if images are similar
 */
export function areSimilar(
  hash1: bigint,
  hash2: bigint,
  threshold: number = 10
): boolean {
  return hammingDistance(hash1, hash2) <= threshold;
}

