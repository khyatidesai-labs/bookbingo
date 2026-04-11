/**
 * Image optimization utilities for Book Bingo
 * - Generate responsive image URLs
 * - Provide fallback dimensions
 * - Support lazy loading strategies
 */

export type ImageSize = 'S' | 'M' | 'L'; // Small (300px), Medium (400px), Large (500px)

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

const DIMENSIONS: Record<ImageSize, ImageDimensions> = {
  S: { width: 300, height: 450, aspectRatio: 2 / 3 },
  M: { width: 400, height: 600, aspectRatio: 2 / 3 },
  L: { width: 500, height: 750, aspectRatio: 2 / 3 },
};

/**
 * Convert Open Library ISBN cover URL to a specific size
 * Default Open Library sizes: -S, -M, -L
 */
export function optimizeOpenLibraryUrl(
  coverUrl: string,
  size: ImageSize = 'M'
): string {
  // Replace size suffix: https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg
  return coverUrl.replace(/-[SML]\.jpg$/, `-${size}.jpg`);
}

/**
 * Get dimensions for a given image size
 */
export function getImageDimensions(size: ImageSize): ImageDimensions {
  return DIMENSIONS[size];
}

/**
 * Generate a srcset string for responsive images
 */
export function generateSrcSet(coverUrl: string): string {
  const small = optimizeOpenLibraryUrl(coverUrl, 'S');
  const medium = optimizeOpenLibraryUrl(coverUrl, 'M');
  const large = optimizeOpenLibraryUrl(coverUrl, 'L');

  return `${small} 300w, ${medium} 400w, ${large} 500w`;
}

/**
 * Get recommended size for a given context
 */
export function getRecommendedSize(context: 'card' | 'hero' | 'featured' | 'shelf'): ImageSize {
  const sizeMap: Record<string, ImageSize> = {
    card: 'M',        // BookCard uses 144px (w-36), fits -M well
    hero: 'L',        // Hero stack uses larger images
    featured: 'M',    // Featured collections
    shelf: 'S',       // ReadingShelf is more compact
  };
  return sizeMap[context] ?? 'M';
}

/**
 * Helper to get complete img element props for optimized loading
 */
export function getOptimizedImageProps(
  coverUrl: string,
  context: 'card' | 'hero' | 'featured' | 'shelf' = 'card'
) {
  const size = getRecommendedSize(context);
  const dims = getImageDimensions(size);
  const optimizedUrl = optimizeOpenLibraryUrl(coverUrl, size);

  return {
    src: optimizedUrl,
    width: dims.width,
    height: dims.height,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}
