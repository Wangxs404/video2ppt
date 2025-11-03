#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Video2PPT - Convert videos to PowerPoint presentations
Extract key frames from videos and generate PPT
"""

import os
import sys
import cv2
import argparse
import logging
from pathlib import Path
from typing import List, Tuple
import numpy as np
from datetime import datetime

try:
    from PIL import Image
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.enum.text import PP_ALIGN
    from pptx.dml.color import RGBColor
except ImportError as e:
    print(f"Error: Missing required library - {e}")
    print("Please run: pip install -r requirements.txt")
    sys.exit(1)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class Video2PPT:
    """Video to PPT converter"""
    
    def __init__(self, video_path: str, output_path: str = None, fps_interval: int = 1):
        """
        Initialize converter
        
        Args:
            video_path: Path to input video file
            output_path: Path to output PPT file
            fps_interval: Extract one frame every N seconds
        """
        self.video_path = video_path
        self.fps_interval = fps_interval
        self.frames: List[str] = []  # Store frame paths
        self.frames_dir = None
        
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        if output_path is None:
            base_name = Path(video_path).stem
            output_path = f"{base_name}_output.pptx"
        
        self.output_path = output_path
        logger.info(f"Initializing converter: {video_path} -> {output_path}")
    
    def extract_frames(self) -> None:
        """Extract frames from video"""
        logger.info("Starting frame extraction...")
        
        # Create temporary directory to store frames
        self.frames_dir = "temp_frames"
        os.makedirs(self.frames_dir, exist_ok=True)
        
        # Open video file
        cap = cv2.VideoCapture(self.video_path)
        
        if not cap.isOpened():
            raise ValueError(f"Unable to open video file: {self.video_path}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        logger.info(f"Video info - FPS: {fps:.2f}, Total frames: {total_frames}, Duration: {duration:.2f}s")
        
        frame_interval = int(fps * self.fps_interval)
        frame_count = 0
        extracted_count = 0
        
        while True:
            ret, frame = cap.read()
            
            if not ret:
                break
            
            # Extract frames at specified intervals
            if frame_count % frame_interval == 0:
                frame_path = os.path.join(self.frames_dir, f"frame_{extracted_count:04d}.jpg")
                cv2.imwrite(frame_path, frame)
                self.frames.append(frame_path)
                extracted_count += 1
                
                if extracted_count % 10 == 0:
                    logger.info(f"Extracted {extracted_count} frames")
            
            frame_count += 1
        
        cap.release()
        logger.info(f"Frame extraction complete. Total frames extracted: {extracted_count}")
    
    def generate_ppt(self) -> None:
        """Generate PowerPoint presentation"""
        logger.info("Starting PowerPoint generation...")
        
        if not self.frames:
            logger.error("No frame data available")
            return
        
        # Create presentation
        prs = Presentation()
        prs.slide_width = Inches(10)
        prs.slide_height = Inches(7.5)
        
        # Add title slide
        title_slide_layout = prs.slide_layouts[0]
        slide = prs.slides.add_slide(title_slide_layout)
        title = slide.shapes.title
        subtitle = slide.placeholders[1]
        
        title.text = "Video2PPT"
        subtitle.text = f"Conversion time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n" \
                       f"Source file: {os.path.basename(self.video_path)}"
        
        # Add frame slides
        blank_slide_layout = prs.slide_layouts[6]  # Blank layout
        
        for idx, frame_path in enumerate(self.frames, 1):
            logger.info(f"Processing slide {idx}/{len(self.frames)}...")
            
            slide = prs.slides.add_slide(blank_slide_layout)
            
            # Add frame image, fill entire slide (edge-aligned)
            left = Inches(0)
            top = Inches(0)
            width = Inches(10)     # Slide width
            height = Inches(7.5)   # Slide height
            pic = slide.shapes.add_picture(frame_path, left, top, width=width, height=height)
        
        # Save presentation
        prs.save(self.output_path)
        logger.info(f"PowerPoint saved: {self.output_path}")
    
    def cleanup(self) -> None:
        """Clean up temporary files"""
        if self.frames_dir and os.path.exists(self.frames_dir):
            import shutil
            shutil.rmtree(self.frames_dir)
            logger.info("Temporary files cleaned up")
    
    def convert(self) -> None:
        """Execute full conversion process"""
        try:
            self.extract_frames()
            self.generate_ppt()
            logger.info("Conversion completed successfully!")
        except Exception as e:
            logger.error(f"Error during conversion: {e}")
            raise
        finally:
            self.cleanup()


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='Convert video files to PowerPoint presentations',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py input_video.mp4
  python main.py input_video.mp4 -o output.pptx
  python main.py input_video.mp4 -i 2  (extract one frame every 2 seconds)
        """
    )
    
    parser.add_argument('video', help='Path to input video file')
    parser.add_argument('-o', '--output', help='Path to output PPT file (default: input_output.pptx)')
    parser.add_argument('-i', '--interval', type=int, default=1,
                       help='Frame extraction interval in seconds (default: 1)')
    
    args = parser.parse_args()
    
    try:
        converter = Video2PPT(args.video, args.output, args.interval)
        converter.convert()
    except Exception as e:
        logger.error(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
