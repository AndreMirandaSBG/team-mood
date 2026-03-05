import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'

/**
 * Replaces __FIREBASE_*__ placeholders in firebase-messaging-sw.js
 * with actual env values at build time.
 */
function swEnvPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'sw-env-inject',
    apply: 'build',
    generateBundle(_options, bundle) {
      const sw = bundle['firebase-messaging-sw.js']
      if (sw && sw.type === 'asset' && typeof sw.source === 'string') {
        sw.source = sw.source
          .replace('self.__FIREBASE_API_KEY__', JSON.stringify(env.VITE_FIREBASE_API_KEY))
          .replace('self.__FIREBASE_AUTH_DOMAIN__', JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN))
          .replace('self.__FIREBASE_PROJECT_ID__', JSON.stringify(env.VITE_FIREBASE_PROJECT_ID))
          .replace('self.__FIREBASE_STORAGE_BUCKET__', JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET))
          .replace('self.__FIREBASE_MESSAGING_SENDER_ID__', JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID))
          .replace('self.__FIREBASE_APP_ID__', JSON.stringify(env.VITE_FIREBASE_APP_ID))
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png', 'icons/*.svg'],
        manifest: false, // using our own public/manifest.json
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          // Don't let Workbox precache the FCM SW — it manages itself
          globIgnores: ['firebase-messaging-sw.js'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firestore-cache',
                networkTimeoutSeconds: 10,
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
      swEnvPlugin(env),
    ],
  }
})
