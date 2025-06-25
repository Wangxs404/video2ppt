// 根页面现在由中间件处理语言检测和重定向
// 如果用户直接访问根路径，中间件会根据浏览器语言自动重定向

export default function RootPage() {
  // 这个组件实际上不会被渲染，因为中间件会重定向
  return null
} 