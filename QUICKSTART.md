# 🚀 Video2PPT 快速开始指南

## 📋 前置要求

- **Python 3.7+**

## ⚡ 5分钟快速开始

### 第一步：安装Python依赖

```bash
# 进入项目目录
cd video2ppt

# 创建虚拟环境（推荐）
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 或
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

### 第二步：转换视频

**最简单的方式：**
```bash
python video2ppt.py your_video.mp4
```

这将生成 `your_video_output.pptx`

**更多选项：**
```bash
# 指定输出文件名
python3 video2ppt.py video.mp4 -o my_presentation.pptx

# 每2秒提取一帧（加快处理）
python3 video2ppt.py video.mp4 -i 2

# 组合使用
python3 video2ppt.py video.mp4 -o result.pptx -i 3
```

### 第三步：查看结果

打开生成的 `.pptx` 文件即可！


---
