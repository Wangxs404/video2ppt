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
export const generateTimestampFileName = (): string => {
  const now = new Date()
  const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`
  return `Video2PPT_${timestamp}.pptx`
}

/**
 * 创建并下载PPT
 * @param screenshots 截图Blob数组
 * @param maxSlides 最大幻灯片数量限制
 * @returns Promise表示操作完成
 */
export const createAndDownloadPPT = async (
  screenshots: Blob[],
  maxSlides: number = 256
): Promise<void> => {
  if (screenshots.length === 0) return
  
  try {
    const pptx = new pptxgen()
    
    // 选择要添加到PPT的截图
    const screenshotsToUse = screenshots.length <= maxSlides 
      ? screenshots 
      : screenshots.slice(0, maxSlides) // 取前maxSlides张
    
    // 为每张截图创建幻灯片
    for (let i = 0; i < screenshotsToUse.length; i++) {
      const slide = pptx.addSlide()
      
      // 将截图转换为base64
      const base64 = await blobToBase64(screenshotsToUse[i])
      
      // 添加图片到幻灯片
      slide.addImage({
        data: base64,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%'
      })
    }
    
    // 生成文件名
    const fileName = generateTimestampFileName()
    
    // 写入并下载文件
    await pptx.writeFile({ fileName })
    
  } catch (error) {
    console.error('PPT生成错误:', error)
    throw error
  }
} 