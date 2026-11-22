import {defineConfig} from '@playwright/test'

export default defineConfig({
  testDir: './tests', workers: 1, reporter: 'list',
  use: {baseURL: 'http://127.0.0.1:4186', viewport: {width: 1280, height: 850},
    launchOptions: {executablePath: process.env.CHROMIUM_PATH || undefined}},
  webServer: {command: 'node tests/test-server.mjs', url: 'http://127.0.0.1:4186/api/books', reuseExistingServer: false},
})

