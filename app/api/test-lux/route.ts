import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    // lux.exe路径
    const luxPath = path.join(process.cwd(), 'bin', 'lux.exe');
    
    // 检查lux.exe是否存在
    if (!fs.existsSync(luxPath)) {
      return NextResponse.json({ 
        error: 'lux.exe 文件不存在',
        path: luxPath
      }, { status: 500 });
    }

    // 测试lux --version
    const result = await testLux(luxPath);

    return NextResponse.json({
      success: true,
      luxPath,
      version: result.version,
      output: result.output,
      supportedSites: result.supportedSites
    });

  } catch (error) {
    console.error('测试lux错误:', error);
    return NextResponse.json({
      success: false,
      error: `测试失败: ${error}`
    }, { status: 500 });
  }
}

function testLux(luxPath: string): Promise<{
  version: string;
  output: string;
  supportedSites: string[];
}> {
  return new Promise((resolve, reject) => {
    console.log(`测试命令: ${luxPath} --version`);

    const luxProcess = spawn(luxPath, ['--version'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    luxProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
    });

    luxProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
    });

    luxProcess.on('close', (code) => {
      console.log(`lux --version 退出代码: ${code}`);
      console.log('输出:', stdout);
      console.log('错误:', stderr);

      if (code === 0 || stdout.includes('lux')) {
        // 从输出中提取版本信息
        const versionMatch = stdout.match(/lux\s+version\s+([^\s]+)/i) || stderr.match(/lux\s+version\s+([^\s]+)/i);
        const version = versionMatch ? versionMatch[1] : 'unknown';

        // 支持的网站列表
        const supportedSites = [
          'bilibili.com',
          'youtube.com', 
          'douyin.com',
          'iqiyi.com',
          'qq.com',
          'youku.com'
        ];

        resolve({
          version,
          output: stdout + stderr,
          supportedSites
        });
      } else {
        reject(new Error(`lux测试失败: ${stderr || stdout}`));
      }
    });

    luxProcess.on('error', (error) => {
      reject(error);
    });

    // 10秒超时
    setTimeout(() => {
      luxProcess.kill();
      reject(new Error('测试超时'));
    }, 10000);
  });
} 