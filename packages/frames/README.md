# @video2ppt/frames

Video frame extraction and scene comparison tools for developers.

[![npm version](https://img.shields.io/npm/v/@video2ppt/frames.svg)](https://www.npmjs.com/package/@video2ppt/frames)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

Extract frames from a video:

```bash
npx @video2ppt/frames extract video.mp4 --interval 5 --output ./frames
```

Compare two frames:

```bash
npx @video2ppt/frames compare frame1.jpg frame2.jpg
```

## Installation

```bash
npm install @video2ppt/frames
```

## Requirements

- **Node.js 16+**
- **FFmpeg** must be installed on your system
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `apt-get install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## CLI Usage

### Extract Frames

```bash
npx @video2ppt/frames extract <video> [options]

Options:
  -i, --interval <seconds>  Interval between frames (default: 1)
  -o, --output <dir>        Output directory (default: ./frames)
  -f, --format <format>     Output format: jpg or png (default: jpg)
  -q, --quality <quality>   Output quality 1-31, lower is better (default: 2)
  -m, --max <frames>        Maximum number of frames to extract
```

Example:
```bash
npx @video2ppt/frames extract video.mp4 -i 5 -o ./my-frames
```

### Compare Frames

```bash
npx @video2ppt/frames compare <image1> <image2> [options]

Options:
  -t, --threshold <threshold>  Comparison threshold 0-1 (default: 0.1)
  -w, --width <width>         Resize width for comparison (default: 640)
```

Example:
```bash
npx @video2ppt/frames compare frame1.jpg frame2.jpg
```

### Detect Scene Changes

```bash
npx @video2ppt/frames detect-scenes <frameDir> [options]

Options:
  -t, --threshold <threshold>  Scene change threshold 0-100 (default: 30)
```

Example:
```bash
npx @video2ppt/frames detect-scenes ./frames -t 35
```

## Library Usage

### Extract Frames

```typescript
import { extractFrames } from '@video2ppt/frames';

const result = await extractFrames('video.mp4', {
  interval: 5,
  outputDir: './frames',
  format: 'jpg',
  quality: 2
});

console.log(`Extracted ${result.totalFrames} frames`);
console.log(`Video duration: ${result.duration}s`);
```

### Compare Frames

```typescript
import { compareFrames } from '@video2ppt/frames';

const result = await compareFrames('frame1.jpg', 'frame2.jpg', {
  threshold: 0.1,
  resizeWidth: 640
});

console.log(`Difference: ${result.percentDifferent.toFixed(2)}%`);
```

### Detect Scene Changes

```typescript
import { detectSceneChanges } from '@video2ppt/frames';

const framePaths = ['frame1.jpg', 'frame2.jpg', 'frame3.jpg'];
const sceneChanges = await detectSceneChanges(framePaths, 30);

console.log(`Scene changes at frames: ${sceneChanges.join(', ')}`);
```

## API Reference

### `extractFrames(videoPath, options)`

Extract frames from a video file.

**Parameters:**
- `videoPath` (string): Path to the video file
- `options` (object):
  - `interval` (number): Seconds between frames (default: 1)
  - `outputDir` (string): Output directory (default: './frames')
  - `format` ('jpg' | 'png'): Output format (default: 'jpg')
  - `quality` (number): Output quality 1-31 (default: 2)
  - `maxFrames` (number): Maximum frames to extract

**Returns:** `Promise<ExtractResult>`

### `compareFrames(image1Path, image2Path, options)`

Compare two images and calculate their difference.

**Parameters:**
- `image1Path` (string): Path to first image
- `image2Path` (string): Path to second image
- `options` (object):
  - `threshold` (number): Comparison threshold 0-1 (default: 0.1)
  - `resizeWidth` (number): Resize width (default: 640)

**Returns:** `Promise<CompareResult>`

### `detectSceneChanges(framePaths, sceneThreshold, options)`

Detect scene changes in a sequence of frames.

**Parameters:**
- `framePaths` (string[]): Array of frame file paths
- `sceneThreshold` (number): Threshold percentage 0-100 (default: 30)
- `options` (object): Same as `compareFrames` options

**Returns:** `Promise<number[]>` - Array of frame indices where scenes change

## Full Product

This package provides frame extraction and comparison tools. The complete video-to-presentation conversion product, including automatic PowerPoint generation and smart layouts, is available at [video2ppt.com](https://video2ppt.com).

## License

MIT License - see [LICENSE](../../LICENSE)

## Contributing

Issues and pull requests are welcome at [GitHub](https://github.com/wangxs404/video2ppt)
