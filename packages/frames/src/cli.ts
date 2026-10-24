#!/usr/bin/env node

import { Command } from 'commander';
import { extractFrames } from './extract';
import { compareFrames, detectSceneChanges } from './compare';
import path from 'path';

const program = new Command();

program
  .name('video2ppt-frames')
  .description('Extract frames from videos and compare scene differences')
  .version('0.1.0');

program
  .command('extract <video>')
  .description('Extract frames from a video file')
  .option('-i, --interval <seconds>', 'Interval between frames in seconds', '1')
  .option('-o, --output <dir>', 'Output directory', './frames')
  .option('-f, --format <format>', 'Output format (jpg or png)', 'jpg')
  .option('-q, --quality <quality>', 'Output quality (1-31, lower is better)', '2')
  .option('-m, --max <frames>', 'Maximum number of frames to extract')
  .action(async (video, options) => {
    try {
      console.log('🎬 Video2PPT Frame Extractor\n');
      
      const result = await extractFrames(video, {
        interval: parseFloat(options.interval),
        outputDir: options.output,
        format: options.format,
        quality: parseInt(options.quality),
        maxFrames: options.max ? parseInt(options.max) : undefined,
      });

      console.log('\n✅ Extraction complete!');
      console.log(`📊 Total frames extracted: ${result.totalFrames}`);
      console.log(`⏱️  Video duration: ${result.duration.toFixed(2)}s`);
      console.log(`🎞️  Video FPS: ${result.fps.toFixed(2)}`);
      console.log(`📁 Output directory: ${options.output}`);
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('compare <image1> <image2>')
  .description('Compare two images and calculate their difference')
  .option('-t, --threshold <threshold>', 'Comparison threshold (0-1)', '0.1')
  .option('-w, --width <width>', 'Resize width for comparison', '640')
  .action(async (image1, image2, options) => {
    try {
      console.log('🔍 Video2PPT Frame Comparator\n');
      console.log(`Comparing: ${path.basename(image1)} vs ${path.basename(image2)}`);
      
      const result = await compareFrames(image1, image2, {
        threshold: parseFloat(options.threshold),
        resizeWidth: parseInt(options.width),
      });

      console.log('\n📊 Comparison Results:');
      console.log(`   Pixels different: ${result.pixelsDifferent.toLocaleString()}`);
      console.log(`   Total pixels: ${result.totalPixels.toLocaleString()}`);
      console.log(`   Difference: ${result.percentDifferent.toFixed(2)}%`);
      
      if (result.percentDifferent < 5) {
        console.log('   ✅ Images are very similar');
      } else if (result.percentDifferent < 30) {
        console.log('   ⚠️  Images have moderate differences');
      } else {
        console.log('   ❌ Images are significantly different (possible scene change)');
      }
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('detect-scenes <frameDir>')
  .description('Detect scene changes in a directory of frames')
  .option('-t, --threshold <threshold>', 'Scene change threshold (0-100)', '30')
  .action(async (frameDir, options) => {
    try {
      console.log('🎬 Video2PPT Scene Detector\n');
      
      const fs = require('fs').promises;
      const files = await fs.readdir(frameDir);
      const framePaths = files
        .filter((f: string) => f.match(/\.(jpg|jpeg|png)$/i))
        .map((f: string) => path.join(frameDir, f))
        .sort();

      if (framePaths.length < 2) {
        console.error('❌ Need at least 2 frames to detect scene changes');
        process.exit(1);
      }

      console.log(`Found ${framePaths.length} frames. Analyzing...`);
      
      const sceneChanges = await detectSceneChanges(
        framePaths,
        parseFloat(options.threshold)
      );

      console.log('\n📊 Scene Detection Results:');
      console.log(`   Total frames: ${framePaths.length}`);
      console.log(`   Scene changes detected: ${sceneChanges.length}`);
      console.log(`   Scene change frames: ${sceneChanges.join(', ')}`);
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
