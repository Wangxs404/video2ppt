/**
 * 检查文件是否为视频类型
 * @param file 要检查的文件
 * @returns 是否为视频文件
 */
export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/')
}

/**
 * 创建文件的Object URL
 * @param file 要处理的文件
 * @returns 文件的Object URL
 */
export const createFileObjectURL = (file: File): string => {
  return URL.createObjectURL(file)
}

/**
 * 释放文件的Object URL
 * @param url 要释放的URL
 */
export const revokeFileObjectURL = (url: string): void => {
  if (url) {
    URL.revokeObjectURL(url)
  }
}

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @param decimals 小数位数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
} 