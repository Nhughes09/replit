import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Force Rebuild v11 - NEW GITHUB WAS USED
console.log("NEW GITHUB WAS USED: Vite Config Loaded");
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true
    }
})
