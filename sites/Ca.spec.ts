import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.setTimeout(360000); // 6 minutes

const screenshotsDir = './screenshots';
const performanceLogPath = './performance-metrics-ca.json';

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

const pages = [
  {
    title: 'Home',
    url: 'https://www.forbes.com/advisor/ca/',
    h1: 'Smart Financial Decisions Made Simple'
  },
  {
    title: 'Investing',
    url: 'https://www.forbes.com/advisor/ca/investing/',
    h1: 'What Is Investing?'
  },
  {
    title: 'Credit Cards',
    url: 'https://www.forbes.com/advisor/ca/credit-cards/',
    h1: 'Best Credit Cards In Canada For 2024'
  },
  {
    title: 'Mortgage',
    url: 'https://www.forbes.com/advisor/ca/mortgages/',
    h1: 'Best Mortgage Lenders In Canada For May 2024'
  }
];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('Delayed audit of Forbes CA pages with performance tracking', async ({ page }) => {
  const performanceData: any[] = [];

  for (let i = 0; i < pages.length; i++) {
    const { url, title } = pages[i];
    const screenshotPath = path.join(screenshotsDir, `${title.toLowerCase().replace(/ /g, '-')}.png`);
    const resources: { url: string; duration: number }[] = [];

    const requestTimings = new Map<string, number>();

    page.on('request', request => {
      if (request.url().includes('forbes.com/advisor/ca/')) {
        requestTimings.set(request.url(), Date.now());
      }
    });

    page.on('response', response => {
      const requestUrl = response.url();
      if (requestTimings.has(requestUrl)) {
        const start = requestTimings.get(requestUrl)!;
        const duration = Date.now() - start;
        resources.push({ url: requestUrl, duration });
      }
    });

    try {
      const startTime = Date.now();
      await page.goto(url, { waitUntil: 'load' });

      const loadTime = await page.evaluate(() => {
        const timing = window.performance.timing;
        return timing.loadEventEnd - timing.navigationStart;
      });

      await page.setViewportSize({ width: 1280, height: 720 });
      await page.screenshot({ path: screenshotPath, fullPage: true });

      performanceData.push({
        page: title,
        url,
        loadTime,
        slowestResources: resources
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5)
      });

      console.log(`✅ ${title} load time: ${loadTime} ms`);
    } catch (err) {
      console.error(`❌ Error visiting ${title}:`, err);
    }

    if (i < pages.length - 1) {
      console.log('⏳ Waiting 60 seconds...');
      await delay(60000);
    }
  }

  fs.writeFileSync(performanceLogPath, JSON.stringify(performanceData, null, 2));
});
