const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// 准备 Next.js 应用
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // 创建 WebSocket 服务器
  const wss = new WebSocket.Server({ 
    server,
    path: '/api/ws-proxy'
  });

  // 存储客户端连接
  const clients = new Map();

  wss.on('connection', (clientWs, req) => {
    console.log('客户端连接到代理服务器');

    // 从环境变量获取认证信息
    const appKey = process.env.NEXT_PUBLIC_VOLC_APP_KEY;
    const accessKey = process.env.NEXT_PUBLIC_VOLC_ACCESS_KEY;
    const resourceId = process.env.NEXT_PUBLIC_VOLC_RESOURCE_ID || "volc.bigasr.sauc.duration";
    const connectId = generateUUID();

    if (!appKey || !accessKey) {
      console.error('API keys not configured');
      clientWs.close(1008, 'API keys not configured');
      return;
    }

    // 连接到火山引擎 WebSocket
    const volcWs = new WebSocket('wss://openspeech.bytedance.com/api/v3/sauc/bigmodel', {
      headers: {
        'X-Api-App-Key': appKey,
        'X-Api-Access-Key': accessKey,
        'X-Api-Resource-Id': resourceId,
        'X-Api-Connect-Id': connectId,
      }
    });

    // 存储连接对
    clients.set(clientWs, volcWs);

    // 火山引擎 WebSocket 事件处理
    volcWs.on('open', () => {
      console.log('成功连接到火山引擎 ASR 服务');
      // 通知客户端连接成功
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ 
          type: 'connection', 
          status: 'connected',
          connectId: connectId
        }));
      }
    });

    volcWs.on('message', (data) => {
      // 转发火山引擎的消息到客户端
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data);
      }
    });

    volcWs.on('error', (error) => {
      console.error('火山引擎 WebSocket 错误:', error);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ 
          type: 'error', 
          message: '火山引擎连接错误: ' + error.message 
        }));
      }
    });

    volcWs.on('close', (code, reason) => {
      console.log('火山引擎 WebSocket 关闭:', code, reason.toString());
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(code, reason);
      }
      clients.delete(clientWs);
    });

    // 客户端 WebSocket 事件处理
    clientWs.on('message', (data) => {
      // 转发客户端的消息到火山引擎
      if (volcWs.readyState === WebSocket.OPEN) {
        volcWs.send(data);
      } else {
        console.warn('火山引擎 WebSocket 未连接，无法发送数据');
      }
    });

    clientWs.on('close', (code, reason) => {
      console.log('客户端断开连接:', code, reason.toString());
      if (volcWs.readyState === WebSocket.OPEN) {
        volcWs.close(1000, '客户端断开连接');
      }
      clients.delete(clientWs);
    });

    clientWs.on('error', (error) => {
      console.error('客户端 WebSocket 错误:', error);
      if (volcWs.readyState === WebSocket.OPEN) {
        volcWs.close(1011, '客户端错误');
      }
      clients.delete(clientWs);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket proxy available at ws://${hostname}:${port}/api/ws-proxy`);
  });
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 