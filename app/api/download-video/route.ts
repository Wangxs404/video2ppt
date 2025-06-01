import { NextRequest, NextResponse } from 'next/server';

const FLY_API_BASE_URL = 'https://video-backend-flyio.fly.dev';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ success: false, error: '请提供视频URL' }, { status: 400 });
    }

    console.log('调用Fly.io服务下载视频:', videoUrl);

    const response = await fetch(`${FLY_API_BASE_URL}/api/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error('Fly.io服务错误:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: `Fly.io服务错误: ${data.error || data.message || response.statusText}`,
          logs: data.logs
        }, 
        { status: response.status }
      );
    }

  } catch (error: any) {
    console.error('调用Fly.io服务时发生错误:', error);
    return NextResponse.json(
      { success: false, error: `调用Fly.io服务失败: ${error.message || '未知错误'}` }, 
      { status: 500 }
    );
  }
} 