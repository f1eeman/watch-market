import { defineConfig, devices } from '@playwright/test'

const PORT = 4331

export default defineConfig({
  testDir: './tests',
  retries: 0,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: `yarn build && yarn preview --port ${String(PORT)}`,
    url: `http://localhost:${String(PORT)}`,
    timeout: 180_000,
    reuseExistingServer: false,
  },
})
