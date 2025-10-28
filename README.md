# Video2PPT - Knowledge Snapshots, Wisdom Preserved

> 🇺🇸 English | [🇨🇳 中文](README_zh.md)

![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC)

A free, privacy-focused online tool that converts videos from any source into PowerPoint presentations. Extract key insights from local video files, online video links, or live screen recordings to generate beautiful PPT documents.

🌐 **Live Demo**: [video2ppt.com](https://video2ppt.com)

## ✨ Features

- **🎥 Multi-Source Support**: Process local video files, online video URLs, or live screen recordings
- **⚡ Real-Time Processing**: Generate PPT slides while watching videos - perfect for meetings, webinars, and online courses
- **🔒 Privacy First**: All processing happens locally in your browser - no video uploads, complete data privacy
- **🆓 Completely Free**: Full functionality with no ads or premium tiers
- **🤖 AI-Powered**: Intelligent content extraction and structured PPT generation
- **🌍 Multilingual**: Support for English and Chinese interfaces
- **📱 Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/wangxs404/video2ppt.git
   cd video2ppt
   ```
2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI, Radix UI
- **Design**: Neo-brutalism style
- **Animations**: Framer Motion
- **Internationalization**: next-intl

### Core Libraries

- **Video Processing**: FFmpeg.wasm
- **PPT Generation**: PptxGenJS
- **File Handling**: File-saver, JSZip
- **WebSocket**: ws

### Development Tools

- **Linting**: ESLint
- **Package Manager**: pnpm
- **Build Tool**: Next.js built-in

## 📖 Usage

### 1. Local Video Processing

- Upload video files from your device
- Supports common formats (MP4, AVI, MOV, etc.)
- Process and extract key frames and content

### 2. Online Video Processing

- Paste video URLs from popular platforms
- Automatic content extraction and analysis
- Generate structured presentations

### 3. Screen Recording

- Real-time screen capture
- Live PPT generation during recording
- Perfect for live presentations and tutorials

## 🎯 Use Cases

- **📹 Meeting Documentation**: Extract key points from recorded meetings for easy sharing
- **📚 Educational Content**: Transform lengthy educational videos into concise study materials
- **🎓 Conference Notes**: Capture expert insights from seminars and workshops
- **💼 Training Materials**: Convert training videos into reusable presentation formats
- **📝 Content Summarization**: Create executive summaries from video content

## 🏗️ Project Structure

```
video2ppt/
├── app/                          # Next.js app directory
│   ├── [locale]/                 # Internationalized routes
│   │   ├── local-video/         # Local video processing
│   │   ├── online-video/        # Online video processing
│   │   └── screen-recording/    # Screen recording feature
│   ├── api/                     # API routes
│   └── utils/                   # Utility functions
├── components/                   # Reusable UI components
├── hooks/                       # Custom React hooks
├── messages/                    # Internationalization files
│   ├── en.json                  # English translations
│   └── zh.json                  # Chinese translations
├── public/                      # Static assets
└── ...config files
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📋 Roadmap

- [ ] **Enhanced AI Processing**: Improved content extraction algorithms
- [ ] **More Export Formats**: Support for Google Slides, Keynote
- [ ] **Cloud Storage Integration**: Direct export to cloud services
- [ ] **Advanced Templates**: More professional PPT templates
- [ ] **Collaboration Features**: Real-time collaborative editing
- [ ] **API Access**: RESTful API for developers

## 🐛 Bug Reports & Feature Requests

Found a bug? Have a feature idea? Please use our [Issue Templates](.github/ISSUE_TEMPLATE/):

- [🐛 Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- [✨ Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)

## 📄 License

**⚠️ Important: This project is licensed under CC BY-NC-SA 4.0**

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

### You are free to:

- ✅ **Share** — Copy and redistribute the material in any medium or format
- ✅ **Adapt** — Remix, transform, and build upon the material
- ✅ **Personal Use** — Use for learning, education, and research
- ✅ **Non-profit Use** — Use in non-profit organizations

### Under the following terms:

- 📝 **Attribution** — Give appropriate credit, provide a link to the license, and indicate if changes were made
- 🚫 **NonCommercial** — You may not use the material for commercial purposes
- 🔄 **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license

### Commercial Use Prohibited

This project **strictly prohibits commercial use**, including but not limited to:

- ❌ Selling the software or derivatives
- ❌ Using in commercial products or services
- ❌ Profit-generating activities
- ❌ Integration into commercial software
- ❌ Providing paid services based on this software

### Commercial Licensing

For commercial use, please contact the copyright holder for a commercial license:

- 📧 **Contact**: wangxs1995s@gmail.com
- 🔗 **GitHub**: https://github.com/Wangxs404/video2ppt
- 💼 **Business Inquiries**: Flexible commercial licensing available

### Full License

- 📄 **License Text**: [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
- 📋 **Legal Code**: [Complete Legal Text](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
- 📖 **Local File**: See [LICENSE](./LICENSE) for detailed terms

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) for client-side video processing
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support & Contact

- 🌐 **Website**: [video2ppt.com](https://video2ppt.com)
- 📧 **Email**: wangxs1995s@gmail.com
- 🐙 **GitHub**: [Wangxs404/video2ppt](https://github.com/wangxs404/video2ppt)
- 💬 **Issues**: [GitHub Issues](https://github.com/wangxs404/video2ppt/issues)

---

**Copyright (c) 2025 Video2PPT - Licensed under CC BY-NC-SA 4.0**

Made with ❤️ by the Video2PPT team
