import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' so the build runs from S3/CloudFront, Amplify or a local folder
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
