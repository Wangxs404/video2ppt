# 🎬 Video2PPT - 视频转PowerPoint工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.7+](https://img.shields.io/badge/Python-3.7%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

🚀 **[快速开始](#快速开始)** | 📖 **[完整文档](#文档)** | 💬 **[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)** | 🌍 **[返回主文档](../README.md)**

---

将视频文件自动转换为 PowerPoint 演示文稿。该工具按指定的时间间隔从视频中提取帧，生成精美的 PowerPoint 演示文稿。

## ✨ 功能特性

- 🎬 **视频帧提取** - 按指定时间间隔自动从视频中提取帧（单位：秒）
- 📊 **PPT 生成** - 生成精美的 PowerPoint 演示文稿
- ⏱️ **灵活配置** - 支持自定义帧提取间隔
- 🚀 **高效处理** - 处理速度快，文件大小小
- 🖼️ **专业布局** - 图片占满整个幻灯片页面
- 📋 **自动清理** - 自动清理临时文件

## 🚀 快速开始

### 前置要求

- Python 3.7+

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/wangxs404/video2ppt.git
cd video2ppt

# 安装依赖
pip install -r requirements.txt
```

### 基本使用

```bash
# 默认：每秒提取一帧
python3 main.py video.mp4

# 每 5 秒提取一帧
python3 main.py video.mp4 -i 5 -o output.pptx

# 每 10 秒提取一帧（快速模式）
python3 main.py video.mp4 -i 10

# 查看所有可用选项
python3 main.py -h
```

## 📋 使用示例

### 示例 1：快速预览（处理最快）
```bash
python3 main.py video.mp4 -i 10
```
- 间隔：每 10 秒提取一帧
- 结果：幻灯片少，文件小，处理快（约 7 秒）

### 示例 2：标准转换（推荐）⭐
```bash
python3 main.py video.mp4 -i 5 -o output.pptx
```
- 间隔：每 5 秒提取一帧
- 结果：质量和文件大小均衡（约 14 秒）

### 示例 3：高质量转换（详细）
```bash
python3 main.py video.mp4 -i 2 -o detailed.pptx
```
- 间隔：每 2 秒提取一帧
- 结果：更多幻灯片，文件大，质量高（约 28 秒）

### 示例 4：默认模式（最大细节）
```bash
python3 main.py video.mp4 -i 1 -o maximum.pptx
```
- 间隔：每 1 秒提取一帧（默认）
- 结果：最多帧数，最大文件大小（37 分钟视频约 55 秒）

## 📊 性能指标

基于 76MB、37 分钟的 MP4 视频测试：

| 间隔（秒）| 帧率 | 处理时间 | 文件大小 | 幻灯片数 |
|----------|------|--------|--------|--------|
| -i 10 | 0.1 fps | ~7 秒 | ~9 MB | ~222 张 |
| -i 5 | 0.2 fps | ~14 秒 | ~17 MB | ~444 张 |
| -i 2 | 0.5 fps | ~28 秒 | ~33 MB | ~1110 张 |
| -i 1 | 1.0 fps | ~55 秒 | ~80+ MB | ~2220 张 |

**建议：** 使用 `-i 5` 以获得质量和文件大小的最佳平衡。

## 📖 文档

### 命令行选项

```
用法: main.py [-h] [-o 输出] [-i 间隔] 视频

位置参数:
  视频              输入视频文件路径

可选参数:
  -h, --help       显示帮助信息并退出
  -o, --output 输出 输出 PowerPoint 文件路径（默认：video_name_output.pptx）
  -i, --interval 间隔
                   帧提取间隔（秒），默认为 1 秒
```

### 不同格式示例

**MP4 视频**
```bash
python3 main.py lecture.mp4 -o lecture.pptx
```

**AVI 视频**
```bash
python3 main.py presentation.avi -o presentation.pptx -i 3
```

**MOV 视频（Mac）**
```bash
python3 main.py video.mov -o output.pptx -i 2
```

## 🛠️ 技术栈

- **OpenCV** - 视频处理和帧提取
- **python-pptx** - PowerPoint 文件生成
- **Pillow** - 图像处理和调整大小
- **NumPy** - 数值计算

## 💡 常见问题

### Q: 支持哪些视频格式？
A: 支持 OpenCV 支持的大多数格式（MP4、AVI、MOV、MKV、FLV、WMV 等）

### Q: 间隔参数如何工作？
A: `-i` 参数指定帧之间的秒数。例如，`-i 5` 表示每 5 秒提取一帧。

### Q: 如何加快处理速度？
A: 增大 `-i` 参数值。例如，`-i 10` 的速度大约是 `-i 2` 的 5 倍，但提取的帧数会减少。

### Q: 如何减少文件大小？
A: 使用较大的帧提取间隔。例如，`-i 10` 会比 `-i 1` 小 90%。

### Q: 能否自定义幻灯片布局？
A: 目前工具使用标准的全幻灯片图像布局。自定义布局将在未来版本支持。

### Q: 支持的最大视频时长是多少？
A: 没有严格限制，但处理时间取决于视频长度和间隔参数。

### Q: 需要网络连接吗？
A: 不需要，所有处理都在本地进行。

### Q: 能在 macOS/Linux/Windows 上运行吗？
A: 可以，该工具跨平台支持所有系统。

## 🐛 故障排查

### 问题："OpenCV not found" 错误
```bash
# 解决方案：安装 OpenCV
pip install opencv-python
```

### 问题："No module named 'pptx'" 错误
```bash
# 解决方案：安装 python-pptx
pip install python-pptx
```

### 问题：视频文件无法识别
- 检查视频文件路径是否正确
- 验证视频格式是否支持
- 尝试使用不同的视频文件

## 📝 更新日志

### v1.0.0 (2025-11-03)
- 初始版本发布
- 支持时间间隔的帧提取
- 支持可配置的帧提取间隔（单位：秒）
- 支持多种视频格式

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📜 许可证

本项目采用 MIT License - 详见 [LICENSE](../LICENSE) 文件。

## 🔗 链接

- [GitHub 仓库](https://github.com/wangxs404/video2ppt)
- [GitHub Issues](https://github.com/wangxs404/video2ppt/issues)
- [MIT 许可证](https://opensource.org/licenses/MIT)

---

**最后更新:** 2025-11-03
