import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { promises as fs } from 'fs';

export interface CompareOptions {
  threshold?: number;
  includeAA?: boolean;
  resizeWidth?: number;
}

export interface CompareResult {
  difference: number;
  pixelsDifferent: number;
  totalPixels: number;
  percentDifferent: number;
}

/**
 * Compare two images and calculate their difference
 * @param image1Path Path to the first image
 * @param image2Path Path to the second image
 * @param options Comparison options
 * @returns Promise with comparison results
 */
export async function compareFrames(
  image1Path: string,
  image2Path: string,
  options: CompareOptions = {}
): Promise<CompareResult> {
  const { threshold = 0.1, includeAA = false, resizeWidth = 640 } = options;

  const [img1Buffer, img2Buffer] = await Promise.all([
    fs.readFile(image1Path),
    fs.readFile(image2Path),
  ]);

  const [img1Resized, img2Resized] = await Promise.all([
    sharp(img1Buffer)
      .resize(resizeWidth, null, { fit: 'inside' })
      .png()
      .toBuffer(),
    sharp(img2Buffer)
      .resize(resizeWidth, null, { fit: 'inside' })
      .png()
      .toBuffer(),
  ]);

  const png1 = PNG.sync.read(img1Resized);
  const png2 = PNG.sync.read(img2Resized);

  if (png1.width !== png2.width || png1.height !== png2.height) {
    throw new Error(
      `Image dimensions do not match: ${png1.width}x${png1.height} vs ${png2.width}x${png2.height}`
    );
  }

  const diff = new PNG({ width: png1.width, height: png1.height });
  const pixelsDifferent = pixelmatch(
    png1.data,
    png2.data,
    diff.data,
    png1.width,
    png1.height,
    { threshold, includeAA }
  );

  const totalPixels = png1.width * png1.height;
  const percentDifferent = (pixelsDifferent / totalPixels) * 100;

  return {
    difference: pixelsDifferent,
    pixelsDifferent,
    totalPixels,
    percentDifferent,
  };
}

/**
 * Compare multiple frames sequentially and detect scene changes
 * @param framePaths Array of frame paths
 * @param sceneThreshold Percentage threshold for scene change (0-100)
 * @param options Comparison options
 * @returns Promise with array of scene change indices
 */
export async function detectSceneChanges(
  framePaths: string[],
  sceneThreshold: number = 30,
  options: CompareOptions = {}
): Promise<number[]> {
  const sceneChanges: number[] = [0];

  for (let i = 1; i < framePaths.length; i++) {
    const result = await compareFrames(framePaths[i - 1], framePaths[i], options);

    if (result.percentDifferent > sceneThreshold) {
      sceneChanges.push(i);
    }
  }

  return sceneChanges;
}

/**
 * Calculate structural similarity between two frames (0-1 scale)
 * @param image1Path Path to the first image
 * @param image2Path Path to the second image
 * @returns Promise with similarity score (0 = completely different, 1 = identical)
 */
export async function calculateSimilarity(
  image1Path: string,
  image2Path: string
): Promise<number> {
  const result = await compareFrames(image1Path, image2Path);
  return 1 - result.percentDifferent / 100;
}
