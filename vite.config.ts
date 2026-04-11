import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Dev-time proxy for the LLM API. Browsers won't let us call
  // openrouter.ai (or api.openai.com) directly from localhost because the
  // response lacks a permissive Access-Control-Allow-Origin header. The
  // proxy sidesteps CORS by making the request server-side. In production,
  // replace this with a real backend route — never ship the key in the
  // client bundle.
  const llmBase = (env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api/llm': {
          target: llmBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/llm/, ''),
        },
      },
    },
  };
});
