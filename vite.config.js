import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mvt,json}']
      },
      injectManifest: true,
      manifest: {
        "short_name": "Amtraker",
        "name": "Amtraker | Amtrak Tracker",
        "description": "Amtraker is a free, open source, and easy to use Train Tracker for Amtrak, Brightline, and VIA Rail!",
        "lang": "en",
        "categories": [
          "travel",
          "navigation",
          "utilities"
        ],
        "iarc_rating_id": "d0eb13d4-2074-43ed-9865-8e8f180aedf7",
        "related_applications": [
          {
            "platform": "play",
            "url": "https://play.google.com/store/apps/details?id=com.amtrak.piero",
            "id": "com.amtrak.piero"
          }
        ],
        "screenshots": [
          {
            "src": "content/screenshots/tablet/home.png",
            "sizes": "1068x733",
            "type": "image/png",
            "platform": "wide",
            "label": "Homescreen of Amtraker"
          },
          {
            "src": "content/screenshots/tablet/map.png",
            "sizes": "1068x733",
            "type": "image/png",
            "platform": "wide",
            "label": "Amtraker Map"
          },
          {
            "src": "content/screenshots/tablet/train-list.png",
            "sizes": "1068x733",
            "type": "image/png",
            "platform": "wide",
            "label": "List of Trains"
          },
          {
            "src": "content/screenshots/tablet/train.png",
            "sizes": "1068x733",
            "type": "image/png",
            "platform": "wide",
            "label": "Individual Train Page"
          },
          {
            "src": "content/screenshots/mobile/home.png",
            "sizes": "384x733",
            "type": "image/png",
            "platform": "narrow",
            "label": "Homescreen of Amtraker"
          },
          {
            "src": "content/screenshots/mobile/map.png",
            "sizes": "384x733",
            "type": "image/png",
            "platform": "narrow",
            "label": "Amtraker Map"
          },
          {
            "src": "content/screenshots/mobile/train-list.png",
            "sizes": "384x733",
            "type": "image/png",
            "platform": "narrow",
            "label": "List of Trains"
          },
          {
            "src": "content/screenshots/mobile/train.png",
            "sizes": "384x733",
            "type": "image/png",
            "platform": "narrow",
            "label": "Individual Train Page"
          }
        ],
        "protocol_handlers": [
          {
            "protocol": "web+amtraker",
            "url": "https://amtraker.com/trains/%s"
          }
        ],
        "orientation": "portrait-primary",
        "icons": [
          {
            "src": "favicon.ico",
            "sizes": "64x64 32x32 24x24 16x16",
            "type": "image/x-icon"
          },
          {
            "src": "logo192.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "logo512.png",
            "type": "image/png",
            "sizes": "512x512"
          }
        ],
        "start_url": ".",
        "display": "standalone",
        "display_override": [
          "window-controls-overlay"
        ],
        "theme_color": "#ffffff",
        "background_color": "#111111",
        "shortcuts": [
          {
            "name": "View All Trains",
            "shortName": "New Train",
            "url": "https://amtraker.com/trains",
            "chosenIconUrl": "https://amtraker.com/content/icons/trains.png"
          },
          {
            "name": "View All Stations",
            "shortName": "All Stations",
            "url": "https://amtraker.com/stations",
            "chosenIconUrl": "https://amtraker.com/content/icons/stations.png"
          },
          {
            "name": "View the Map",
            "shortName": "Map",
            "url": "https://amtraker.com/map",
            "chosenIconUrl": "https://amtraker.com/content/icons/map.png"
          }
        ]
      }
    })
  ],
})
