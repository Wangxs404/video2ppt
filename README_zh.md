# Video2PPT - 知识的快照，智慧的永存

> [🇺🇸 English](README.md) | 🇨🇳 中文

![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC)

一个免费的、注重隐私的在线工具，可以将任意来源的视频转换为PPT演示文稿。从本地视频文件、在线视频链接或实时录屏中提取关键信息，生成精美的PPT文档。

🌐 **在线体验**: [video2ppt.com](https://video2ppt.com)

## ✨ 功能特色

- **🎥 多源支持**: 支持本地视频文件、在线视频链接或实时录屏
- **⚡ 实时处理**: 边看视频边生成PPT，完美适配会议、研讨会和在线课程
- **🔒 隐私优先**: 所有处理均在浏览器本地完成，无视频上传，完全保护数据隐私
- **🆓 完全免费**: 全功能免费使用，无广告无付费版本
- **🤖 AI驱动**: 智能内容提取和结构化PPT生成
- **🌍 多语言**: 支持中英文界面
- **📱 响应式设计**: 完美适配桌面、平板和移动设备

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm、yarn 或 pnpm

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/AxisIndie/video2ppt.git
   cd video2ppt
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   yarn dev
   # 或
   pnpm dev
   ```

4. **打开浏览器**
   
   访问 [http://localhost:3000](http://localhost:3000)

## 🏗️ 技术栈

### 前端技术
- **框架**: Next.js 14 (App Router)
- **编程语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: Shadcn UI, Radix UI
- **设计风格**: Neo-brutalism（新粗野主义）
- **动画**: Framer Motion
- **国际化**: next-intl

### 核心库
- **视频处理**: FFmpeg.wasm
- **PPT生成**: PptxGenJS
- **文件处理**: File-saver, JSZip
- **WebSocket**: ws

### 开发工具
- **代码检查**: ESLint
- **包管理器**: pnpm
- **构建工具**: Next.js 内置

## 📖 使用说明

### 1. 本地视频处理
- 从设备上传视频文件
- 支持常见格式（MP4、AVI、MOV等）
- 处理并提取关键帧和内容

### 2. 在线视频处理
- 粘贴来自热门平台的视频链接
- 自动内容提取和分析
- 生成结构化演示文稿

### 3. 实时录屏
- 实时屏幕捕获
- 录制过程中实时生成PPT
- 完美适配现场演示和教程

## 🎯 使用场景

- **📹 会议记录**: 从录制的会议中提取要点，便于分享
- **📚 教育内容**: 将冗长的教学视频转化为简洁的学习材料
- **🎓 会议笔记**: 捕捉研讨会和工作坊中专家的深度见解
- **💼 培训材料**: 将培训视频转换为可重复使用的演示格式
- **📝 内容总结**: 从视频内容创建执行摘要

## 🏗️ 项目结构

```
video2ppt/
├── app/                          # Next.js 应用目录
│   ├── [locale]/                 # 国际化路由
│   │   ├── local-video/         # 本地视频处理
│   │   ├── online-video/        # 在线视频处理
│   │   └── screen-recording/    # 录屏功能
│   ├── api/                     # API 路由
│   └── utils/                   # 工具函数
├── components/                   # 可复用UI组件
├── hooks/                       # 自定义React Hooks
├── messages/                    # 国际化文件
│   ├── en.json                  # 英文翻译
│   └── zh.json                  # 中文翻译
├── public/                      # 静态资源
└── ...配置文件
```

## 🛠️ 开发指南

### 可用脚本

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint

# 类型检查
npx tsc --noEmit     # 检查 TypeScript 类型
```

### 添加新语言

1. 在 `i18n.ts` 中添加语言:
   ```typescript
   export const locales = ['zh', 'en', 'your-locale'] as const
   ```

2. 创建翻译文件:
   ```bash
   cp messages/en.json messages/your-locale.json
   ```

3. 在新文件中翻译内容

## 🤝 贡献指南

我们欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解详情。

### 开发流程

1. Fork 仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 打开 Pull Request

### 代码规范

- 遵循 TypeScript 最佳实践
- 使用函数式组件和 Hooks
- 遵循现有代码风格（Prettier + ESLint）
- 编写有意义的提交信息

## 📋 发展路线图

- [ ] **增强AI处理**: 改进内容提取算法
- [ ] **更多导出格式**: 支持Google Slides、Keynote
- [ ] **云存储集成**: 直接导出到云服务
- [ ] **高级模板**: 更多专业PPT模板
- [ ] **协作功能**: 实时协作编辑
- [ ] **API访问**: 为开发者提供RESTful API

## 🐛 错误报告和功能请求

发现了bug？有功能想法？请使用我们的[问题模板](.github/ISSUE_TEMPLATE/):

- [🐛 错误报告](.github/ISSUE_TEMPLATE/bug_report.md)
- [✨ 功能请求](.github/ISSUE_TEMPLATE/feature_request.md)

## 📄 许可证

**⚠️ 重要声明：本项目采用 CC BY-NC-SA 4.0 许可证**

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

### 您可以自由地：

- ✅ **分享** — 在任何媒介以任何形式复制、发行本材料
- ✅ **演绎** — 重新混合、转换或基于本材料进行创作
- ✅ **个人使用** — 用于学习、教育和研究
- ✅ **非营利使用** — 在非营利组织中使用

### 惟须遵守下列条件：

- 📝 **署名** — 您必须给出适当的署名，提供指向许可协议的链接，同时标明是否对原始作品作了修改
- 🚫 **非商业性使用** — 您不得将本材料用于商业目的
- 🔄 **相同方式共享** — 如果您重新混合、转换或基于本材料进行创作，您必须基于与原先许可协议相同的许可协议分发您的贡献

### 禁止商业使用

本项目**严格禁止商业使用**，包括但不限于：

- ❌ 出售软件或其衍生作品
- ❌ 在商业产品或服务中使用
- ❌ 用于盈利性活动
- ❌ 集成到商业软件中
- ❌ 基于本软件提供付费服务

### 商业许可

如需商业使用，请联系版权持有者获取商业许可：

- 📧 **联系方式**: wangxs1995s@gmail.com
- 🔗 **GitHub**: https://github.com/AxisIndie/video2ppt
- 💼 **商业咨询**: 提供灵活的商业许可方案

### 完整许可证

- 📄 **许可证文本**: [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
- 📋 **法律条文**: [完整法律文本](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
- 📖 **本地文件**: 详细条款请查看 [LICENSE](./LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) 团队提供的出色框架
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) 提供客户端视频处理
- [Shadcn UI](https://ui.shadcn.com/) 提供精美组件
- [Tailwind CSS](https://tailwindcss.com/) 提供实用优先的样式

## 📞 支持与联系

- 🌐 **网站**: [video2ppt.com](https://video2ppt.com)
- 📧 **邮箱**: wangxs1995s@gmail.com
- 🐙 **GitHub**: [AxisIndie/video2ppt](https://github.com/AxisIndie/video2ppt)
- 💬 **问题**: [GitHub Issues](https://github.com/AxisIndie/video2ppt/issues)

---

**Copyright (c) 2025 Video2PPT - Licensed under CC BY-NC-SA 4.0**

用 ❤️ 制作，由 Video2PPT 团队出品 