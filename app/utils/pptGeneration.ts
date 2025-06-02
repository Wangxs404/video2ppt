import pptxgen from 'pptxgenjs'

/**
 * 将Blob对象转换为base64字符串
 * @param blob Blob对象
 * @returns Promise包含base64字符串
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

/**
 * 生成时间戳文件名
 * @returns 格式化的时间戳字符串，用于文件名
 */
export const generateTimestampFileName = (extension: string = 'pptx'): string => {
  const now = new Date()
  const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`
  return `Video2PPT_${timestamp}.${extension}`
}

/**
 * 生成PPT的Blob数据
 * @param screenshots 截图Blob数组
 * @param maxSlides 最大幻灯片数量限制
 * @returns Promise包含PPT Blob和建议的文件名
 */
export const generatePptBlob = async (
  screenshots: Blob[],
  maxSlides: number = 256
): Promise<{ pptBlob: Blob, fileName: string }> => {
  if (screenshots.length === 0) {
    throw new Error("无法生成PPT：没有提供截图。");
  }
  
  try {
    const pptx = new pptxgen()
    
    const screenshotsToUse = screenshots.length <= maxSlides 
      ? screenshots 
      : screenshots.slice(0, maxSlides)
    
    for (let i = 0; i < screenshotsToUse.length; i++) {
      const slide = pptx.addSlide()
      const base64 = await blobToBase64(screenshotsToUse[i])
      slide.addImage({
        data: base64,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%'
      })
    }
    
    const fileName = generateTimestampFileName('pptx');
    
    // 生成PPT的Blob数据
    const pptBlob = await pptx.write({ outputType: 'blob' }) as Blob;
    
    return { pptBlob, fileName };
    
  } catch (error) {
    console.error('PPT生成错误:', error)
    // 保持抛出错误，以便上层捕获
    throw error;
  }
} 