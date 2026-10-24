# Video2PPT

Developer tools for video frame extraction and scene comparison.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)

[Back to Main](../README.md)

---

## Overview

This tool extracts frames from video files at specified time intervals and generates PowerPoint presentations. All processing runs locally.

## Quick Start

### Requirements

- Python 3.11 or later

### Installation

```bash
git clone https://github.com/wangxs404/video2ppt.git
cd video2ppt
pip install -r requirements.txt
```

### Basic Usage

```bash
# Extract 1 frame per second (default)
python3 main.py video.mp4

# Extract 1 frame every 5 seconds
python3 main.py video.mp4 -i 5 -o output.pptx

# Extract 1 frame every 10 seconds (faster processing)
python3 main.py video.mp4 -i 10

# View all options
python3 main.py -h
```

## Usage Examples

### Fast Processing
```bash
python3 main.py video.mp4 -i 10
```
Extracts 1 frame every 10 seconds. Fastest processing with fewer slides.

### Balanced (Recommended)
```bash
python3 main.py video.mp4 -i 5 -o output.pptx
```
Extracts 1 frame every 5 seconds. Good balance between detail and file size.

### High Detail
```bash
python3 main.py video.mp4 -i 2 -o detailed.pptx
```
Extracts 1 frame every 2 seconds. More slides with greater detail.

### Maximum Detail
```bash
python3 main.py video.mp4 -i 1 -o maximum.pptx
```
Extracts 1 frame per second. Maximum frames with largest file size.

## Performance Metrics

Based on 76MB, 37-minute MP4 video:

| Interval | Frames/Second | Processing Time | File Size | Slide Count |
|----------|---------------|-----------------|-----------|-------------|
| -i 10    | 0.1 fps       | ~7 seconds      | ~9 MB     | ~222 slides |
| -i 5     | 0.2 fps       | ~14 seconds     | ~17 MB    | ~444 slides |
| -i 2     | 0.5 fps       | ~28 seconds     | ~33 MB    | ~1110 slides|
| -i 1     | 1.0 fps       | ~55 seconds     | ~80 MB    | ~2220 slides|

Recommended: `-i 5` for typical use.

## Command Reference

```
usage: main.py [-h] [-o OUTPUT] [-i INTERVAL] video

positional arguments:
  video                 Input video file path

optional arguments:
  -h, --help            Show help message and exit
  -o, --output OUTPUT   Output PowerPoint file path (default: video_name_output.pptx)
  -i, --interval INTERVAL
                        Frame extraction interval in seconds (default: 1)
```

### Supported Video Formats

Most formats supported by OpenCV work with this tool:
- MP4
- AVI
- MOV
- MKV
- FLV
- WMV

## Technology Stack

- **OpenCV** - video frame extraction
- **python-pptx** - PowerPoint file generation
- **Pillow** - image processing
- **NumPy** - numerical operations

## FAQ

**What interval should I use?**  
Use `-i 5` for most videos. Increase the interval for faster processing and smaller files.

**How do intervals work?**  
The `-i` parameter specifies seconds between frames. `-i 5` extracts 1 frame every 5 seconds.

**How can I reduce file size?**  
Increase the interval value. `-i 10` produces significantly smaller files than `-i 1`.

**Does this require internet?**  
No. All processing happens locally on your machine.

**What platforms are supported?**  
Windows, macOS, and Linux.

## Troubleshooting

**"OpenCV not found" error**
```bash
pip install opencv-python
```

**"No module named 'pptx'" error**
```bash
pip install python-pptx
```

**Video file not recognized**
- Verify the video file path is correct
- Check that the video format is supported
- Test with a different video file

## Full Product

This repository contains frame extraction tools. The complete video-to-presentation conversion product is available at [video2ppt.com](https://video2ppt.com).

## License

MIT License. See [LICENSE](../LICENSE) for details.

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss proposed changes.

## Links

- [GitHub Repository](https://github.com/wangxs404/video2ppt)
- [Full Product](https://video2ppt.com)
- [Report Issues](https://github.com/wangxs404/video2ppt/issues)
