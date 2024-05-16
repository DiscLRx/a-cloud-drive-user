import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        port: 80,
        host: '0.0.0.0',
        proxy: {
            '/api/identity': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/identity/, '/api')
            },
            '/api/file': {
                target: 'http://127.0.0.1:3002',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/file/, '/api')
            }
        },
    }
})
