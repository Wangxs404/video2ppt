import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

export interface ExtractOptions {
  interval?: number;
  outputDir?: string;
  format?: 'jpg' | 'png';
  quality?: number;
  maxFrames?: number;
}

export interface ExtractResult {
  frames: string[];
  totalFrames: number;
  duration: number;
  fps: number;
}

/**
 * Extract frames from a video file
 * @param videoPath Path to the video file
 * @param options Extraction options
 * @returns Promise with extraction results
 */
export async function extractFrames(
  videoPath: string,
  options: ExtractOptions = {}
): Promise<ExtractResult> {
  const {
    interval = 1,
    outputDir = './frames',
    format = 'jpg',
    quality = 2,
    maxFrames,
  } = options;

  await fs.mkdir(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const frames: string[] = [];
    let frameCount = 0;
    let videoInfo: { duration: number; fps: number } | null = null;

    ffmpeg(videoPath)
      .on('start', () => {
        console.log(`Extracting frames from ${videoPath}...`);
      })
      .on('error', (err) => {
        reject(new Error(`Frame extraction failed: ${err.message}`));
      })
      .on('end', () => {
        resolve({
          frames,
          totalFrames: frameCount,
          duration: videoInfo?.duration || 0,
          fps: videoInfo?.fps || 0,
        });
      })
      .outputOptions([
        `-vf fps=1/${interval}`,
        `-q:v ${quality}`,
        ...(maxFrames ? [`-frames:v ${maxFrames}`] : []),
      ])
      .output(path.join(outputDir, `frame-%04d.${format}`))
      .run();

    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.warn('Could not get video metadata:', err.message);
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      if (videoStream) {
        videoInfo = {
          duration: metadata.format.duration || 0,
          fps: eval(videoStream.r_frame_rate || '0') || 0,
        };
      }
    });
  }).then(async (result) => {
    const files = await fs.readdir(outputDir);
    const frameFiles = files
      .filter((f) => f.match(/^frame-\d+\.(jpg|png)$/))
      .map((f) => path.join(outputDir, f))
      .sort();

    return {
      ...result,
      frames: frameFiles,
      totalFrames: frameFiles.length,
    };
  });
}

/**
 * Extract a single frame at a specific timestamp
 * @param videoPath Path to the video file
 * @param timestamp Timestamp in seconds
 * @param outputPath Output path for the frame
 * @returns Promise with the output path
 */
export async function extractFrameAt(
  videoPath: string,
  timestamp: number,
  outputPath: string
): Promise<string> {
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(timestamp)
      .frames(1)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`Failed to extract frame: ${err.message}`)))
      .run();
  });
}
