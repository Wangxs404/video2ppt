# WebSocket 代理服务器使用说明

## 问题背景

火山引擎 ASR WebSocket API 要求在握手阶段设置特定的认证头部（如 `X-Api-App-Key`），但浏览器的安全机制不允许 JavaScript 在 WebSocket 握手时设置自定义头部，导致出现 1006 连接关闭错误。

## 解决方案

我们创建了一个本地 WebSocket 代理服务器来解决这个问题：

1. **前端** → 连接到本地代理服务器 (`ws://localhost:3000/api/ws-proxy`)
2. **代理服务器** → 连接到火山引擎 API 并设置认证头部
3. **代理服务器** → 在前端和火山引擎之间转发消息

## 使用步骤

### 1. 确保环境变量配置正确

在 `.env.local` 文件中设置：

```env
NEXT_PUBLIC_VOLC_APP_KEY=你的应用密钥
NEXT_PUBLIC_VOLC_ACCESS_KEY=你的访问密钥
NEXT_PUBLIC_VOLC_RESOURCE_ID=volc.bigasr.sauc.duration
```

### 2. 启动代理服务器

```bash
npm run dev
```

这会启动：
- Next.js 应用在 `http://localhost:3000`
- WebSocket 代理服务器在 `ws://localhost:3000/api/ws-proxy`

### 3. 访问应用

打开浏览器访问 `http://localhost:3000/transcribe`

## 架构说明

```
浏览器 ←→ 本地代理服务器 ←→ 火山引擎 ASR API
       ws://localhost:3000/api/ws-proxy    wss://openspeech.bytedance.com/...
```

### 代理服务器功能

- ✅ 处理 WebSocket 握手认证
- ✅ 转发音频数据到火山引擎
- ✅ 转发转录结果到前端
- ✅ 错误处理和连接管理
- ✅ 自动生成连接 ID

## 文件说明

- `server.js` - 自定义 Next.js 服务器，包含 WebSocket 代理
- `app/components/realtime-transcriber.tsx` - 前端组件，连接到代理服务器
- `package.json` - 更新了启动脚本

## 注意事项

1. **不需要购买额外服务器** - 代理服务器运行在你的本地开发环境
2. **仅用于开发环境** - 生产环境需要部署到支持 WebSocket 的服务器
3. **音频格式问题** - 当前使用 MediaRecorder，可能需要转换为 PCM 格式
4. **防火墙设置** - 确保本地 3000 端口没有被防火墙阻止

## 故障排除

### 连接失败
- 检查 `.env.local` 文件中的 API 密钥是否正确
- 确保使用 `npm run dev` 而不是 `npm run dev:next`
- 检查控制台是否有错误信息

### 音频问题
- 确保浏览器有麦克风权限
- 检查音频格式是否为 PCM（当前可能需要额外处理）

### 代理服务器日志
代理服务器会在控制台输出详细的连接和消息转发日志，便于调试。 