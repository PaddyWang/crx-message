import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const buildVersion = (mainYear = 2025) => {
  const date = new Date()
  return `${date.getFullYear() - mainYear}.${
    date.getMonth() + 1
  }.${date.getDate()}.${date.getHours()}${date.getMinutes()}`
}

export const version = buildVersion()

export default defineManifest(() => {
  return {
    manifest_version: 3,
    name: packageJson.name,
    description: packageJson.description,
    version,
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: [
          'src/content/index.ts',
          'src/content-page/index.ts'
        ],
        run_at: 'document_start',
      },
    ],
    background: {
      service_worker: 'src/background/index.ts',
    },
    permissions: ['storage', 'scripting', 'activeTab', 'tabs', 'notifications'],
    host_permissions: ['<all_urls>']
  }
})
