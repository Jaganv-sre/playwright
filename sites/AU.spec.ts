import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const screenshotsDir = './screenshots';
const csvDir = './reports';

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir);

test.setTimeout(60000);

async function setupPage(page) {
  await page.setViewportSize({ width: 1280, height: 720 });
  page.on('pageerror', error => console.error('[RUNTIME ERROR]', error));
}

async function savePerformanceCSV(entries, filename) {
  const header = 'name,duration,initiatorType\n';
  const csvContent = entries.map(e =>
    `"\${e.name}",\${e.duration},\${e.initiatorType}`
  ).join('\n');
  fs.writeFileSync(path.join(csvDir, filename), header + csvContent);
}

async function capturePerformanceMetrics(page, pageUrl) {
  const performanceEntries = await page.evaluate(() => {
    return performance.getEntriesByType('resource')
      .map(entry => ({
        name: entry.name,
        duration: Number(entry.duration.toFixed(1)),
        initiatorType: (entry as PerformanceResourceTiming).initiatorType || 'unknown'
      }))
      .filter(entry => {
        try {
          const url = new URL(entry.name);
          return url.href.includes('/advisor/au/');
        } catch {
          return false;
        }
      })
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  });

  console.log(`\nTop 5 slowest internal resources for ${pageUrl}:`);
  console.table(performanceEntries);

  await savePerformanceCSV(performanceEntries, 'homepage_performance.csv');
  return performanceEntries;
}

// Main homepage test with screenshot and metrics
test('Homepage performance and screenshot', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/';
  const screenshotPath = path.join(screenshotsDir, 'homepage.png');

  await setupPage(page);
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toContainText('Smart Financial Decisions Made Simple');
  await capturePerformanceMetrics(page, pageUrl);
  await page.screenshot({ path: screenshotPath, fullPage: true });
});

// Basic ping tests for secondary URLs
const urls = [
  'https://www.forbes.com/advisor/au/investing/',
  'https://www.forbes.com/advisor/au/credit-cards/best-credit-cards/',
  'https://www.forbes.com/advisor/au/superannuation/best-default-superannuation-funds-in-australia/',
  'https://www.forbes.com/advisor/au/car-insurance/best-comprehensive-car-insurance-providers/',
  'https://www.forbes.com/advisor/au/health-insurance/best-private-health-insurance-companies/',
  'https://www.forbes.com/advisor/au/life-insurance/best-life-insurance-australia/',
  'https://www.forbes.com/advisor/au/pet-insurance/best-pet-insurance-policies-in-australia/',
  'https://www.forbes.com/advisor/au/travel-insurance/best-comprehensive-travel-insurance/',
  'https://www.forbes.com/advisor/au/business/',
  'https://www.forbes.com/advisor/au/investing/cryptocurrency/',
  'https://www.forbes.com/advisor/au/personal-loans/best-personal-loans/',
  'https://www.forbes.com/advisor/au/savings/best-high-interest-savings-accounts/'
];

for (const url of urls) {
  const name = url.split('/').filter(Boolean).pop();
  test(`Ping test: ${name}`, async ({ page }) => {
    await setupPage(page);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });
}
