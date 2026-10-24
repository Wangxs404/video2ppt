# 🎬 Video2PPT

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@video2ppt/frames.svg)](https://www.npmjs.com/package/@video2ppt/frames)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

**Developer tools for video frame extraction and scene comparison**

🌐 **完整产品体验：[video2ppt.com](https://video2ppt.com)** | 📖 **[Documentation](#-documentation)** | 💬 **[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)**

---

## 🚀 Quick Start (npm/npx)

### Extract frames from video

```bash
npx @video2ppt/frames extract video.mp4 --interval 5 --output ./frames
```

### Compare two frames

```bash
npx @video2ppt/frames compare frame1.jpg frame2.jpg
```

**[📦 Full npm package documentation →](packages/frames/README.md)**

---

## 💎 完整 Video2PPT 产品体验

本开源项目提供给开发者的**核心工具**：视频帧提取和场景比较。

**想要完整的 Video2PPT 体验？** 包括：
- ✨ 自动 PowerPoint 生成
- 🎨 智能幻灯片布局
- 🌐 Web 在线转换
- 🚀 一键转换，无需编码

👉 **访问 [https://video2ppt.com](https://video2ppt.com)**

---

## 🌍 Documentation / 文档

- 🇺🇸 [English](docs/README_en.md)
- 🇨🇳 [简体中文](docs/README_zh.md)
- 🇯🇵 [日本語](docs/README_ja.md)
- 🇪🇸 [Español](docs/README_es.md)

---

## 📦 Developer Tools

This repository provides two open-source developer tools:

### 1. Node.js Package - `@video2ppt/frames`

Extract frames and compare scenes programmatically.

**Installation:**
```bash
npm install @video2ppt/frames
```

**Requirements:**
- Node.js 16+
- FFmpeg (install via `brew install ffmpeg` on macOS)

**Usage:**
```typescript
import { extractFrames, compareFrames } from '@video2ppt/frames';

// Extract frames
const result = await extractFrames('video.mp4', {
  interval: 5,
  outputDir: './frames'
});

// Compare frames
const comparison = await compareFrames('frame1.jpg', 'frame2.jpg');
console.log(`Difference: ${comparison.percentDifferent.toFixed(2)}%`);
```

**[📖 Full npm package docs →](packages/frames/README.md)**

### 2. Python CLI - Video Frame Extractor

Basic Python script for frame extraction (legacy).

**Requirements:**
- Python 3.11+

**Installation:**
```bash
pip install -r requirements.txt
```

**Usage:**
```bash
# Extract 1 frame per second
python3 main.py video.mp4

# Extract 1 frame every 5 seconds
python3 main.py video.mp4 -i 5 -o output.pptx
```

**Note:** The Python script includes PowerPoint generation, but this is a **basic demo**. For production-quality PPT generation with smart layouts, use the full product at [video2ppt.com](https://video2ppt.com).

---

## ⚡ Performance Benchmark

Based on 76MB, 37-minute MP4 video:

| Interval | Processing Time | File Size | Slides |
|----------|-----------------|-----------|--------|
| -i 10 | ~7 seconds | ~9 MB | ~222 |
| -i 5 | ~14 seconds | ~17 MB | ~444 |
| -i 2 | ~28 seconds | ~33 MB | ~1110 |
| -i 1 | ~55 seconds | ~80+ MB | ~2220 |

**Recommended:** Use `-i 5` for best balance.

---

## 🛠️ What's Included vs. Full Product

| Feature | Open Source (This Repo) | Full Product ([video2ppt.com](https://video2ppt.com)) |
|---------|------------------------|--------------------------------------------------|
| Frame Extraction | ✅ npm + Python | ✅ |
| Scene Comparison | ✅ npm only | ✅ |
| Basic PPT Export | ✅ Python only (demo) | ✅ Professional |
| Smart Slide Layouts | ❌ | ✅ |
| Web Interface | ❌ | ✅ |
| Batch Processing | ❌ | ✅ |
| Cloud Storage | ❌ | ✅ |
| API Access | ❌ | ✅ |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Issues and pull requests are welcome! For major changes, please open an issue first.

**[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)**

---

## 🔗 Links

- 🌐 **[video2ppt.com](https://video2ppt.com)** - Full product experience
- 📦 **[npm package](https://www.npmjs.com/package/@video2ppt/frames)** - Developer tools
- 📖 **[Documentation](#-documentation)** - Multi-language docs
- 💬 **[GitHub](https://github.com/wangxs404/video2ppt)** - Source code & issues

---

**[👉 Try the full Video2PPT experience at video2ppt.com](https://video2ppt.com)**
