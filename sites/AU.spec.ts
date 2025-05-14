import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { generateHtmlReport } from '../utils/htmlReportGenerator';

test.setTimeout(900000); // 15 minutes

const screenshotsDir = './screenshots';
const reportsDir = './reports';
const htmlReportPath = path.join(reportsDir, 'performance-report-AU.html');

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

const pages = [
  {
    title: 'Home',
    url: 'https://www.forbes.com/advisor/au/',
    h1: 'Smart Financial Decisions Made Simple'
  },
  {
    title: 'Savings Accounts',
    url: 'https://www.forbes.com/advisor/au/savings/best-high-interest-savings-accounts/',
    h1: 'Our Pick Of The Best High-Interest Savings Accounts In Australia'
  }
];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('Delayed audit of Forbes AU pages with HTML report', async ({ page }) => {
  const allResults: any[] = [];

  for (let i = 0; i < pages.length; i++) {
    const { url, title, h1 } = pages[i];
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
      await page.goto(url, { waitUntil: 'load' });
      await page.setViewportSize({ width: 1280, height: 720 });

      await page.screenshot({ path: screenshotPath, fullPage: true });
      await page.waitForSelector('h1');
      await page.locator('h1').waitFor({ timeout: 5000 });
      await page.locator('h1').isVisible();
      await page.locator('h1').textContent();

      const loadTime = await page.evaluate(() => {
        const timing = window.performance.timing;
        return timing.loadEventEnd - timing.navigationStart;
      });

      allResults.push({
        page: title,
        url,
        loadTime,
        screenshot: screenshotPath,
        topResources: resources
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

  generateHtmlReport(allResults, htmlReportPath);
});
