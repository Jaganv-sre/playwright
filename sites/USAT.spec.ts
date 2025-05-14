import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.setTimeout(900000); // 15 minutes

const screenshotsDir = './screenshots';
const reportsDir = './reports';
const performanceCsvPath = path.join(reportsDir, 'performance-metrics.csv');

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

const pages = [
  {
    title: 'Home',
    url: 'https://www.forbes.com/advisor/au/',
    h1: 'Smart Financial Decisions Made Simple'
  },
  {
    title: 'Investing',
    url: 'https://www.forbes.com/advisor/au/investing/',
    h1: 'Investing in Australia'
  },
  {
    title: 'Credit Cards',
    url: 'https://www.forbes.com/advisor/au/credit-cards/best-credit-cards/',
    h1: 'Best Credit Cards Australia'
  },
  {
    title: 'Loans',
    url: 'https://www.forbes.com/advisor/au/personal-loans/best-personal-loans/',
    h1: 'Best Personal Loans Australia'
  },
  {
    title: 'Superannuation Funds',
    url: 'https://www.forbes.com/advisor/au/superannuation/best-default-superannuation-funds-in-australia/',
    h1: 'Our Pick Of The Best Default Superannuation Funds In 2025'
  },
  {
    title: 'Car Insurance',
    url: 'https://www.forbes.com/advisor/au/car-insurance/best-comprehensive-car-insurance-providers/',
    h1: 'Our Pick Of The Best Comprehensive Car Insurance Providers in Australia'
  },
  {
    title: 'Health Insurance',
    url: 'https://www.forbes.com/advisor/au/health-insurance/best-private-health-insurance-companies/',
    h1: 'Our Pick Of The Best Private Health Insurance Providers In Australia'
  },
  {
    title: 'Life Insurance',
    url: 'https://www.forbes.com/advisor/au/life-insurance/best-life-insurance-australia/',
    h1: 'Our Pick Of The Best Life Insurance Providers For Australians'
  },
  {
    title: 'Pet Insurance',
    url: 'https://www.forbes.com/advisor/au/pet-insurance/best-pet-insurance-policies-in-australia/',
    h1: 'Our Pick Of The Best Comprehensive Pet Insurance Policies In Australia'
  },
  {
    title: 'Travel Insurance',
    url: 'https://www.forbes.com/advisor/au/travel-insurance/best-comprehensive-travel-insurance/',
    h1: 'Our Pick Of The Best Comprehensive Travel Insurance Providers In Australia'
  },
  {
    title: 'Cryptocurrency',
    url: 'https://www.forbes.com/advisor/au/investing/cryptocurrency/',
    h1: 'Investing In Cryptocurrency'
  },
  {
    title: 'Savings Accounts',
    url: 'https://www.forbes.com/advisor/au/savings/best-high-interest-savings-accounts/',
    h1: 'https://www.forbes.com/advisor/au/savings/best-high-interest-savings-accounts/'
  }
];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Write CSV header
fs.writeFileSync(performanceCsvPath, 'Page,URL,LoadTime(ms),TopSlowResources\n');

test('Delayed audit of Forbes AU pages with performance CSV', async ({ page }) => {
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

      const topResources = resources
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map(r => `${r.url} (${r.duration}ms)`)
        .join('; ');

      fs.appendFileSync(performanceCsvPath, `"${title}","${url}",${loadTime},"${topResources}"\n`);

      console.log(`✅ ${title} load time: ${loadTime} ms`);
    } catch (err) {
      console.error(`❌ Error visiting ${title}:`, err);
    }

    if (i < pages.length - 1) {
      console.log('⏳ Waiting 60 seconds...');
      await delay(60000);
    }
  }
});
