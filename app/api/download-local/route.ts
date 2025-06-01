import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: '请提供视频URL' }, { status: 400 });
    }

    console.log('开始本地下载视频:', videoUrl);

    // lux.exe路径
    const luxPath = path.join(process.cwd(), 'bin', 'lux.exe');
    
    // 检查lux.exe是否存在
    if (!fs.existsSync(luxPath)) {
      return NextResponse.json({ 
        error: 'lux.exe 文件不存在，请确保已将lux.exe放置在 bin/ 目录下' 
      }, { status: 500 });
    }

    // 下载目录
    const downloadDir = path.join(process.cwd(), 'downloads');
    
    // 确保downloads目录存在
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // 执行lux下载
    const result = await downloadVideo(luxPath, videoUrl, downloadDir);

    if (result.success && result.fileName) {
      return NextResponse.json({
        success: true,
        message: '本地下载成功',
        filePath: result.filePath,
        fileName: result.fileName,
        downloadUrl: `/api/get-file?file=${encodeURIComponent(result.fileName)}`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('本地下载 API 发生严重错误:', error instanceof Error ? error.stack : error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      success: false,
      error: `本地下载失败: ${errorMessage}`
    }, { status: 500 });
  }
}

function downloadVideo(luxPath: string, videoUrl: string, outputDir: string): Promise<{
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    // 使用-o参数指定输出目录，确保文件下载到downloads文件夹
    const args = [
      '-o', outputDir,
      videoUrl
    ];

    console.log(`执行本地命令: ${luxPath} ${args.join(' ')}`);
    console.log(`预期下载到目录: ${outputDir}`);

    const luxProcess = spawn(luxPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      // 设置环境变量，可能有助于解决编码问题
      env: { ...process.env, LANG: 'en_US.UTF-8' }
    });

    let stdout = '';
    let stderr = '';

    luxProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log('本地LUX输出:', output.trim());
    });

    luxProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.log('本地LUX错误:', output.trim());
    });

    luxProcess.on('close', async (code) => {
      console.log(`本地lux进程退出，代码: ${code}`);
      console.log('本地完整stdout:', stdout);
      console.log('本地完整stderr:', stderr);

      if (code === 0) {
        try {
          // 在downloads目录查找下载的文件
          const files = await fsPromises.readdir(outputDir);
          console.log('downloads目录中的文件:', files);
          
          const videoFile = files.find(file => 
            /\.(mp4|mkv|webm|avi|mov|flv)$/i.test(file)
          );

          if (videoFile) {
            const filePath = path.join(outputDir, videoFile);
            console.log('找到本地视频文件:', filePath);
            resolve({
              success: true,
              filePath,
              fileName: videoFile
            });
          } else {
            resolve({
              success: false,
              error: '未找到本地下载的视频文件。downloads目录中的文件: ' + files.join(', ')
            });
          }
        } catch (err) {
          resolve({
            success: false,
            error: `本地查找文件失败: ${err}`
          });
        }
      } else {
        // 即使退出代码不是0，也检查是否有文件下载成功
        try {
          const files = await fsPromises.readdir(outputDir);
          const videoFile = files.find(file => 
            /\.(mp4|mkv|webm|avi|mov|flv)$/i.test(file)
          );

          if (videoFile) {
            console.log('本地虽然有错误，但文件已下载:', videoFile);
            resolve({
              success: true,
              filePath: path.join(outputDir, videoFile),
              fileName: videoFile
            });
          } else {
            resolve({
              success: false,
              error: `本地下载失败 (退出代码: ${code})\n最后的错误: ${stderr.split('\n').slice(-5).join('\n')}`
            });
          }
        } catch (err) {
          resolve({
            success: false,
            error: `本地下载失败 (退出代码: ${code})\n${stderr || stdout}`
          });
        }
      }
    });

    luxProcess.on('error', (error) => {
      console.error('本地lux进程错误:', error);
      resolve({
        success: false,
        error: `启动本地lux失败: ${error.message}`
      });
    });

    // 增加超时时间到15分钟
    setTimeout(() => {
      luxProcess.kill();
      resolve({
        success: false,
        error: '本地下载超时'
      });
    }, 900000);
  });
} 