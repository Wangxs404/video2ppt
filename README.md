# Video2PPT - 知识的快照，智慧的永存

Video2PPT是一个免费的在线工具，可以将任意来源的视频转换为PPT演示文稿。无论是本地视频文件、在线视频链接还是实时录屏，我们都能帮您提取关键信息，生成精美的PPT文档。

## 项目特点

- **多源支持**: 支持本地视频文件、在线视频链接或实时录屏
- **实时提取**: 边看视频边生成PPT，适合网络会议、研讨会、在线课程等多种场景
- **隐私安全**: 所有处理均在本地完成，不会上传视频内容，保证数据隐私和安全
- **完全免费**: 所有功能免费使用，无广告干扰
- **智能总结**: 自动提取视频中的关键信息点，生成结构化的PPT内容

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI 组件
- Neo-brutalism 设计风格

## 快速开始

安装依赖:

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

运行开发服务器:

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 适用场景

- **网络会议**: 提取会议中的关键内容，制作会议纪要
- **在线课程**: 将冗长的教学视频转化为简洁PPT，便于学习和复习
- **研讨会**: 捕捉专家分享的精华内容，形成易于传播的知识结晶
- **自学进修**: 从教育视频中提取知识点，辅助自主学习

  You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.

  Code Style and Structure

  - Write concise, technical TypeScript code with accurate examples.
  - Use functional and declarative programming patterns; avoid classes.
  - Prefer iteration and modularization over code duplication.
  - Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
  - Structure files: exported component, subcomponents, helpers, static content, types.

  Naming Conventions

  - Use lowercase with dashes for directories (e.g., components/auth-wizard).
  - Favor named exports for components.

  TypeScript Usage

  - Use TypeScript for all code; prefer interfaces over types.
  - Avoid enums; use maps instead.
  - Use functional components with TypeScript interfaces.

  Syntax and Formatting

  - Use the "function" keyword for pure functions.
  - Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
  - Use declarative JSX.

  UI and Styling

  - Use Shadcn UI, Radix, and Tailwind for components and styling.
  - Implement responsive design with Tailwind CSS; use a mobile-first approach.

  Performance Optimization

  - Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
  - Wrap client components in Suspense with fallback.
  - Use dynamic loading for non-critical components.
  - Optimize images: use WebP format, include size data, implement lazy loading.

  Key Conventions

  - Use 'nuqs' for URL search parameter state management.
  - Optimize Web Vitals (LCP, CLS, FID).
  - Limit 'use client':
    - Favor server components and Next.js SSR.
    - Use only for Web API access in small components.
    - Avoid for data fetching or state management.

  Follow Next.js docs for Data Fetching, Rendering, and Routing.
