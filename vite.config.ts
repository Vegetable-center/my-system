import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/uploads': {
        target: 'http://localhost:3000', // 后端 Nest 服务地址
        changeOrigin: true, // 开启跨域
        secure: false, // 开发环境关闭 HTTPS 验证
        // 可选：重写路径（如果后端有前缀，比如 /api/uploads，就需要重写）
        // rewrite: (path) => path.replace(/^\/uploads/, '/api/uploads'),
      },
    }
  }
})
