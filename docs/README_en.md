# 🎬 Video2PPT - Video to PowerPoint Conversion Tool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.7+](https://img.shields.io/badge/Python-3.7%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

🚀 **[Quick Start](#quick-start)** | 📖 **[Full Documentation](#documentation)** | 💬 **[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)** | 🌍 **[Back to Main](../README.md)**

---

Automatically convert video files to PowerPoint presentations. This tool extracts key frames from videos and generates beautiful PowerPoint presentations.

## ✨ Features

- 🎬 **Video Frame Extraction** - Automatically extract key frames from videos
- 📊 **PPT Generation** - Generate beautiful PowerPoint presentations
- ⏱️ **Flexible Configuration** - Support customizable frame extraction intervals
- 🚀 **High Performance** - Fast processing with small file sizes
- 🖼️ **Professional Layout** - Images fill the entire slide
- 📋 **Auto Cleanup** - Automatic temporary file cleanup

## 🚀 Quick Start

### Requirements

- Python 3.7+
- FFmpeg (optional, for advanced video processing)

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
# Simplest way - use default settings
python3 video2ppt.py video.mp4

# Specify output file and frame extraction interval
python3 video2ppt.py video.mp4 -o output.pptx -i 10

# View all available options
python3 video2ppt.py -h
```

## 📋 Usage Examples

### Quick Preview (Fastest Processing)
```bash
python3 video2ppt.py video.mp4 -i 20
```
- Interval: Every 20 frames
- Result: Fewer slides, smaller file size, faster processing

### Standard Conversion (Recommended) ⭐
```bash
python3 video2ppt.py video.mp4 -i 10 -o output.pptx
```
- Interval: Every 10 frames
- Result: Balanced quality and file size

### High Quality (More Slides)
```bash
python3 video2ppt.py video.mp4 -i 5 -o output_hq.pptx
```
- Interval: Every 5 frames
- Result: More slides, larger file size, better quality

## 📊 Performance Metrics

| Parameter | Processing Time | File Size | Slide Count |
|-----------|-----------------|-----------|------------|
| -i 10 | ~14.5 seconds | ~17 MB | ~225 slides |
| -i 5 | ~28 seconds | ~33 MB | ~449 slides |
| -i 1 | ~90+ seconds | ~80+ MB | ~2237 slides |

*Test based on 76MB, 37-minute MP4 video*

## 📖 Documentation

### Command Line Options

```
usage: video2ppt.py [-h] [-o OUTPUT] [-i INTERVAL] input_video

positional arguments:
  input_video           Path to input video file

optional arguments:
  -h, --help           Show help message and exit
  -o, --output OUTPUT  Path to output PowerPoint file (default: output.pptx)
  -i, --interval INTERVAL
                       Frame extraction interval (default: 10)
```

### Examples with Different Formats

**MP4 Video**
```bash
python3 video2ppt.py lecture.mp4 -o lecture.pptx
```

**AVI Video**
```bash
python3 video2ppt.py presentation.avi -o presentation.pptx
```

**MOV Video (Mac)**
```bash
python3 video2ppt.py video.mov -o output.pptx
```

## 🛠️ Technology Stack

- **OpenCV** - Video processing and frame extraction
- **python-pptx** - PowerPoint file generation
- **Pillow** - Image processing and resizing
- **NumPy** - Numerical computations

## 💡 FAQ

### Q: What video formats are supported?
A: Most formats supported by OpenCV are compatible (MP4, AVI, MOV, MKV, FLV, WMV, etc.)

### Q: How can I speed up processing?
A: Increase the `-i` parameter value. For example, `-i 20` will be 4x faster than `-i 5`

### Q: How can I reduce file size?
A: Use a larger frame extraction interval. For example, `-i 10` will result in ~90% smaller files compared to `-i 5`

### Q: Can I customize the slide layout?
A: Currently, the tool uses a standard layout. Custom layouts will be supported in future versions.

### Q: What is the maximum video duration supported?
A: There is no strict limit, but processing time depends on video length and the interval parameter.

### Q: Does it require internet connection?
A: No, all processing is done locally on your machine.

### Q: Can I run this on macOS/Linux?
A: Yes, this tool is cross-platform and works on Windows, macOS, and Linux.

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
- Basic video to PowerPoint conversion
- Frame extraction with customizable intervals
- Support for multiple video formats

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/wangxs404/video2ppt)
- [GitHub Issues](https://github.com/wangxs404/video2ppt/issues)
- [MIT License](https://opensource.org/licenses/MIT)

---

**Last Updated:** 2025-11-03
