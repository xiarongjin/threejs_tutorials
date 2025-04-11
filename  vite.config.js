// vite.config.js
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm'; // 必须安装此插件

export default defineConfig({
  plugins: [ wasm()],
  build: {
    target: 'esnext', // 确保支持动态导入
    rollupOptions: {
      output: {
        format: 'es', // 必须使用 ES 模块格式
      },
    },
  },
  server: {
    fs: {
      strict: false, // 允许访问 node_modules/.vite
    },
  },
});