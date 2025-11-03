# 🎬 Video2PPT - 视频转PowerPoint工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.7+](https://img.shields.io/badge/Python-3.7%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

🚀 **[快速开始](https://video2ppt.com)** | 📖 [完整文档](QUICKSTART.md) | 💬 [GitHub Issues](https://github.com/wangxs404/video2ppt/issues)

---

将视频文件自动转换为 PowerPoint 演示文稿。该工具从视频中提取关键帧，生成精美的 PowerPoint 演示文稿。

## ✨ 功能特性

- 🎬 **视频帧提取** - 从视频中自动提取关键帧
- 📊 **PPT 生成** - 生成精美的 PowerPoint 演示文稿
- ⏱️ **灵活配置** - 支持自定义帧提取间隔
- 🚀 **高效处理** - 处理速度快，文件大小小
- 🖼️ **专业布局** - 图片占满整个幻灯片页面
- 📋 **自动清理** - 自动清理临时文件

## 🚀 快速开始

### 前置要求

- Python 3.7+

### 安装

```bash
# 克隆仓库
git clone https://github.com/wangxs404/video2ppt.git
cd video2ppt

# 安装依赖
pip install -r requirements.txt
```

### 基本使用

```bash
# 最简单的方式
python3 main.py video.mp4

# 指定输出文件和帧提取间隔
python3 main.py video.mp4 -o output.pptx -i 10

# 查看所有选项
python3 main.py -h
```

## 📋 使用示例

### 快速预览（处理最快）
```bash
python3 main.py video.mp4 -i 20
```

### 标准转换（推荐）⭐
```bash
python3 main.py video.mp4 -i 10 -o output.pptx
```


## 📊 性能指标

| 参数 | 处理时间 | 文件大小 | 幻灯片数 |
|------|---------|--------|--------|
| -i 10 | ~14.5 秒 | ~17 MB | ~225 张 |
| -i 5 | ~28 秒 | ~33 MB | ~449 张 |
| -i 1 | ~90+ 秒 | ~80+ MB | ~2237 张 |

*测试基于 76MB、37分钟的 MP4 视频*

## 📖 文档

- [README.md](README.md) - 完整使用文档
- [LICENSE](LICENSE) - MIT 许可证

## 🛠️ 技术栈

- **OpenCV** - 视频处理
- **python-pptx** - PowerPoint 生成
- **Pillow** - 图像处理
- **NumPy** - 数值计算


## 🐛 报告问题

如果您发现了 bug 或有建议，请在 [Issues](https://github.com/wangxs404/video2ppt/issues) 中创建新的 Issue。

## 💡 常见问题

### Q: 支持哪些视频格式？
A: 支持 OpenCV 支持的大多数格式（MP4、AVI、MOV、MKV、FLV、WMV 等）

### Q: 如何加快处理速度？
A: 增大 `-i` 参数值，例如 `-i 20` 会比 `-i 5` 快 4 倍

### Q: 如何减少文件大小？
A: 使用较大的帧提取间隔，例如 `-i 10` 会比 `-i 5` 小 90%

### v1.0.0 (2025-11-03)
- 初始版本发布

## 📜 许可证
本项目采用 MIT License - 详见 [LICENSE](LICENSE) 文件


---


