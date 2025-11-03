# 🎬 Video2PPT - Video to PowerPoint Conversion Tool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.7+](https://img.shields.io/badge/Python-3.7%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

🚀 **[QuickStart Guide](https://video2ppt.com)** | 🏠 **[Back to Main](../README.md)** | 💬 **[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)**

---

Automatically convert video files to PowerPoint presentations. This tool extracts frames from videos at specified time intervals and generates beautiful PowerPoint presentations.

## ✨ Features

- 🎬 **Video Frame Extraction** - Automatically extract frames at specified intervals (in seconds)
- 📊 **PPT Generation** - Generate beautiful PowerPoint presentations
- ⏱️ **Flexible Configuration** - Support customizable frame extraction intervals
- 🚀 **High Performance** - Fast processing with small file sizes
- 🖼️ **Professional Layout** - Images fill the entire slide
- 📋 **Auto Cleanup** - Automatic temporary file cleanup

## 🚀 Quick Start

### Requirements

- Python 3.7+

### Installation

```bash
# Clone the repository
git clone https://github.com/wangxs404/video2ppt.git
cd video2ppt

# Install dependencies
pip install -r requirements.txt
```

### Basic Usage

```bash
# Default: extract 1 frame per second
python3 main.py video.mp4

# Extract 1 frame every 5 seconds
python3 main.py video.mp4 -i 5 -o output.pptx

# Extract 1 frame every 10 seconds (fast mode)
python3 main.py video.mp4 -i 10

# View all available options
python3 main.py -h
```

> **📚 For more detailed guides and tips, visit [video2ppt.com](https://video2ppt.com)**

## 📋 Usage Examples

### Example 1: Quick Preview (Fastest Processing)
```bash
python3 main.py video.mp4 -i 10
```
- Interval: Extract 1 frame every 10 seconds
- Result: Fewer slides, smaller file size, faster processing (~7 seconds)

### Example 2: Standard Conversion (Recommended) ⭐
```bash
python3 main.py video.mp4 -i 5 -o output.pptx
```
- Interval: Extract 1 frame every 5 seconds
- Result: Balanced quality and file size (~14 seconds)

### Example 3: High Quality (Most Detailed)
```bash
python3 main.py video.mp4 -i 2 -o detailed.pptx
```
- Interval: Extract 1 frame every 2 seconds
- Result: More slides, larger file size, better quality (~28 seconds)

### Example 4: Default (Maximum Detail)
```bash
python3 main.py video.mp4 -i 1 -o maximum.pptx
```
- Interval: Extract 1 frame every 1 second (default)
- Result: Maximum frames, largest file size (~55 seconds for 37 minutes video)

## 📊 Performance Metrics

Based on a 76MB, 37-minute MP4 video:

| Interval (seconds) | Frames/Second | Processing Time | File Size | Slide Count |
|--------------------|---------------|-----------------|-----------|------------|
| -i 10 | 0.1 fps | ~7 seconds | ~9 MB | ~222 slides |
| -i 5 | 0.2 fps | ~14 seconds | ~17 MB | ~444 slides |
| -i 2 | 0.5 fps | ~28 seconds | ~33 MB | ~1110 slides |
| -i 1 | 1.0 fps | ~55 seconds | ~80+ MB | ~2220 slides |

**Recommendation:** Use `-i 5` for the best balance between quality and file size.

## 📖 Documentation

### Command Line Options

```
usage: main.py [-h] [-o OUTPUT] [-i INTERVAL] video

positional arguments:
  video                 Input video file path

optional arguments:
  -h, --help            Show this help message and exit
  -o, --output OUTPUT   Output PPT file path (default: video_name_output.pptx)
  -i, --interval INTERVAL
                        Frame extraction interval in seconds (default: 1)
```

### Examples with Different Video Formats

**MP4 Video**
```bash
python3 main.py lecture.mp4 -o lecture.pptx
```

**AVI Video**
```bash
python3 main.py presentation.avi -o presentation.pptx -i 3
```

**MOV Video (Mac)**
```bash
python3 main.py video.mov -o output.pptx -i 2
```

## 🛠️ Technology Stack

- **OpenCV** - Video processing and frame extraction
- **python-pptx** - PowerPoint file generation
- **Pillow** - Image processing and resizing
- **NumPy** - Numerical computations

## 💡 FAQ

### Q: What video formats are supported?
A: Most formats supported by OpenCV are compatible (MP4, AVI, MOV, MKV, FLV, WMV, etc.)

### Q: How do the intervals work?
A: The `-i` parameter specifies seconds between frames. For example, `-i 5` means extract 1 frame every 5 seconds.

### Q: How can I speed up processing?
A: Increase the `-i` parameter value. For example, `-i 10` will be 5x faster than `-i 2` but extract fewer frames.

### Q: How can I reduce file size?
A: Use a larger frame extraction interval. For example, `-i 10` produces ~90% smaller files compared to `-i 1`.

### Q: Can I customize the slide layout?
A: Currently, the tool uses a standard full-slide image layout. Custom layouts will be supported in future versions.

### Q: What is the maximum video duration supported?
A: There is no strict limit, but processing time depends on video length and the interval parameter.

### Q: Does it require internet connection?
A: No, all processing is done locally on your machine.

### Q: Can I run this on macOS/Linux/Windows?
A: Yes, this tool is cross-platform and works on all platforms.

## 🐛 Troubleshooting

### Issue: "OpenCV not found" error
```bash
# Solution: Install OpenCV
pip install opencv-python
```

### Issue: "No module named 'pptx'" error
```bash
# Solution: Install python-pptx
pip install python-pptx
```

### Issue: Video file not recognized
- Ensure the video file path is correct
- Check if the video format is supported
- Try with a different video file

## 📝 Changelog

### v1.0.0 (2025-11-03)
- Initial release
- Video to PowerPoint conversion with time-based frame extraction
- Frame extraction at customizable time intervals (in seconds)
- Support for multiple video formats

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/wangxs404/video2ppt)
- [QuickStart Guide](https://video2ppt.com)
- [GitHub Issues](https://github.com/wangxs404/video2ppt/issues)
- [MIT License](https://opensource.org/licenses/MIT)

---

**For more tutorials and guides, visit [video2ppt.com](https://video2ppt.com)**

**Last Updated:** 2025-11-03
