/**
 * 截图导航相关的实用函数
 */

/**
 * 移动到上一张截图
 * @param currentIndex 当前索引
 * @param setIndex 设置索引的函数
 */
export const navigateToPreviousScreenshot = (
  currentIndex: number,
  setIndex: (updater: (prev: number) => number) => void
): void => {
  if (currentIndex > 0) {
    setIndex(prev => prev - 1)
  }
}

/**
 * 移动到下一张截图
 * @param currentIndex 当前索引
 * @param maxIndex 最大索引
 * @param setIndex 设置索引的函数
 */
export const navigateToNextScreenshot = (
  currentIndex: number,
  maxIndex: number,
  setIndex: (updater: (prev: number) => number) => void
): void => {
  if (currentIndex < maxIndex) {
    setIndex(prev => prev + 1)
  }
}

/**
 * 移动到最新的截图
 * @param maxIndex 最大索引
 * @param setIndex 设置索引的函数
 */
export const navigateToLatestScreenshot = (
  maxIndex: number,
  setIndex: (value: number) => void
): void => {
  setIndex(maxIndex)
}

/**
 * 初始化新增截图的索引
 * @param setIndex 设置索引的函数
 */
export const initializeScreenshotIndex = (
  setIndex: (updater: (prev: number) => number) => void
): void => {
  setIndex(prev => prev + 1)
}

/**
 * 重置截图浏览状态
 * @param options 重置选项
 */
export const resetScreenshotNavigation = (
  options: {
    setScreenshots: (value: string[]) => void,
    setCurrentIndex: (value: number) => void,
    setStats: (value: { total: number, saved: number }) => void,
    lastImageDataRef: React.MutableRefObject<ImageData | null>
  }
): void => {
  const { setScreenshots, setCurrentIndex, setStats, lastImageDataRef } = options
  
  setScreenshots([])
  setCurrentIndex(-1)
  setStats({ total: 0, saved: 0 })
  lastImageDataRef.current = null
} 