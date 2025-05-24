import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 从环境变量获取认证信息
    const appKey = process.env.NEXT_PUBLIC_VOLC_APP_KEY;
    const accessKey = process.env.NEXT_PUBLIC_VOLC_ACCESS_KEY;
    const resourceId = process.env.NEXT_PUBLIC_VOLC_RESOURCE_ID || "volc.bigasr.sauc.duration";
    
    if (!appKey || !accessKey) {
      return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { action, data } = body;

    // 生成连接 ID
    const connectId = generateUUID();

    // 根据不同的 action 处理不同的请求
    switch (action) {
      case 'connect':
        return NextResponse.json({ 
          success: true, 
          connectId,
          message: 'Use WebSocket connection directly with authentication headers' 
        });
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 