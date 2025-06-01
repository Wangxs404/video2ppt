import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return new NextResponse('文件名不能为空', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'downloads', fileName);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return new NextResponse('文件不存在', { status: 404 });
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(filePath);

    // 获取文件扩展名来设置正确的MIME类型
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.mp4':
        contentType = 'video/mp4';
        break;
      case '.webm':
        contentType = 'video/webm';
        break;
      case '.avi':
        contentType = 'video/x-msvideo';
        break;
      case '.mov':
        contentType = 'video/quicktime';
        break;
      case '.mkv':
        contentType = 'video/x-matroska';
        break;
    }

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('文件下载错误:', error);
    return new NextResponse('服务器错误', { status: 500 });
  }
} 