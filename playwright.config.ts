import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './sites',  // Folder containing your test files
  fullyParallel: true,
  forbidOnly: !!process.env.CI,  // Disallow `.only` in CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { open: 'never' }],  // Removed custom outputFolder
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
  ],
});
