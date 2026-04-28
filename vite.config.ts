import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'HSGuru-Chinese-Plus',
        namespace: 'https://www.hsguru.com/',
        version: '2.1.0',
        description: '将HSGuru网站的部分英文替换为中文，并提供界面美化及功能优化。',
        author: 'QuanQuan',
        match: ['https://www.hsguru.com/*'],
        connect: ['api2.iyingdi.com'],
        grant: ['GM_getValue', 'GM_setValue', 'GM_xmlhttpRequest'],
      },
      build: {
        fileName: 'hsguru-chinese-plus.js',
      },
    }),
  ],
});