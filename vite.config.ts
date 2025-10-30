import { defineConfig } from 'vite';
import { hydrogen } from '@shopify/hydrogen/vite';
import { oxygen } from '@shopify/mini-oxygen/vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// Remove the module declaration as it's not needed for React Router

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    reactRouter(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: ['react', 'react-dom', 'cookie', 'react-router', 'react-router-dom'],
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'cookie', 'react-router', 'react-router-dom'],
  },
  server: {
    port: 4000,
    warmup: {
      clientFiles: [
        './app/**/!(*.server|*.test)*.tsx', // Include all .tsx files except server and test files (add more patterns if required)
      ],
    },
  }
});
