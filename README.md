# 🎬 Video2PPT

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

**Automatically convert video files to PowerPoint presentations.**

🌐 **[Visit QuickStart](https://video2ppt.com)** | 📖 **[Full Documentation](#-documentation)** | 💬 **[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)**

## 🌍 Documentation / 文档 / ドキュメント / Documentación

- 🇺🇸 [English](docs/README_en.md)
- 🇨🇳 [简体中文](docs/README_zh.md)
- 🇯🇵 [日本語](docs/README_ja.md)
- 🇪🇸 [Español](docs/README_es.md)

## ⚡ Quick Start

```bash
# Clone and setup
git clone https://github.com/wangxs404/video2ppt.git
cd video2ppt
pip install -r requirements.txt

# Basic usage (extract 1 frame per second)
python3 main.py video.mp4

# Extract 1 frame every 5 seconds
python3 main.py video.mp4 -i 5 -o output.pptx

# View all options
python3 main.py -h
```

**👉 [Learn more at video2ppt.com](https://video2ppt.com)**

## ✨ Key Features

- 🎬 **Video Frame Extraction** - Extract frames at specified time intervals
- 📊 **PPT Generation** - Generate beautiful PowerPoint presentations
- ⏱️ **Flexible Configuration** - Customizable frame extraction intervals (in seconds)
- 🚀 **High Performance** - Fast processing with small file sizes
- 🖼️ **Professional Layout** - Full-slide image layouts
- 📋 **Auto Cleanup** - Automatic temporary file cleanup

## 📊 Performance

Based on 76MB, 37-minute MP4 video:

| Interval | Processing Time | File Size | Slide Count |
|----------|-----------------|-----------|------------|
| -i 10 | ~7 seconds | ~9 MB | ~222 slides |
| -i 5 | ~14 seconds | ~17 MB | ~444 slides |
| -i 2 | ~28 seconds | ~33 MB | ~1110 slides |
| -i 1 | ~55 seconds | ~80+ MB | ~2220 slides |

**Recommended:** Use `-i 5` for best balance between quality and file size.

## 🛠️ Technology Stack

- **OpenCV** - Video processing and frame extraction
- **python-pptx** - PowerPoint generation
- **Pillow** - Image processing
- **NumPy** - Numerical computations

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Support

For questions, issues, or suggestions: [GitHub Issues](https://github.com/wangxs404/video2ppt/issues)

---

**For detailed documentation, please select your language above / 详细文档请选择上方语言**

**[👉 Visit video2ppt.com for interactive demo and guides](https://video2ppt.com)**
