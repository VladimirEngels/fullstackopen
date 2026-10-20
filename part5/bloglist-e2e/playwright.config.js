// @ts-check
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  timeout: 10000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run db',
      cwd: '../../part4/bloglist-backend',
      port: 27017,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm run start:test',
      cwd: '../../part4/bloglist-backend',
      url: 'http://localhost:3003/api/blogs',
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      cwd: '../bloglist-frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
    },
  ],
})
