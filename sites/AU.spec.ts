import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.setTimeout(360000); // 6 minutes

const screenshotsDir = './screenshots';
const performanceLogPath = './performance-metrics.json';

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

const pages = [
  {
    title: 'Home',
    url: 'https://www.forbes.com/advisor/au/',
    h1: 'Smart Financial Decisions Made Simple'
  },
  {
    title: 'Investing',
    url: 'https://www.forbes.com/advisor/au/investing/',
    h1: 'How To Invest'
  },
  {
    title: 'Credit Cards',
    url: 'https://www.forbes.com/advisor/au/credit-cards/best-credit-cards/',
    h1: 'Our Pick Of The Best Credit Cards For Australians'
  },
  {
    title: 'SuperFunds',
    url: 'https://www.forbes.com/advisor/au/superannuation/best-default-superannuation-funds-in-australia/',
    h1: 'Our Pick Of The Best Default Superannuation Funds In 2025'
  }
];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('Delayed audit of Forbes AU pages with performance tracking', async ({ page }) => {
  const performanceData: any[] = [];

  for (let i = 0; i < pages.length; i++) {
    const { url, title } = pages[i];
    const screenshotPath = path.join(screenshotsDir, `${title.toLowerCase().replace(/ /g, '-')}.png`);
    const resources: { url: string; duration: number }[] = [];

    const requestTimings = new Map<string, number>();

    page.on('request', request => {
      if (request.url().includes('forbes.com/advisor/au/')) {
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
