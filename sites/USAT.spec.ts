import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.setTimeout(1200000); // 20 minutes

const screenshotsDir = './screenshots';
const reportsDir = './reports';
const performanceCsvPath = path.join(reportsDir, 'performance-metrics.csv');

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

const pages = [
  {
    title: 'Blueprint Home',
    url: 'https://www.usatoday.com/money/blueprint/',
    h1: 'USA TODAY Blueprint'
  },
  {
    title: 'Auto Insurance',
    url: 'https://www.usatoday.com/money/blueprint/auto-insurance/best-auto-insurance/',
    h1: 'Best car insurance companies'
  },
  {
    title: 'Pet Insurance',
    url: 'https://www.usatoday.com/money/blueprint/pet-insurance/best-pet-insurance/',
    h1: 'Best pet insurance companies of 2024'
  },
  {
    title: 'Life Insurance',
    url: 'https://www.usatoday.com/money/blueprint/life-insurance/best-life-insurance-companies/',
    h1: 'Best life insurance Companies'
  },
  {
    title: 'Renters Insurance',
    url: 'https://www.usatoday.com/money/blueprint/renters-insurance/renters-insurance-costs/',
    h1: 'Average renters insurance cost in 2024'
  },
  {
    title: 'Mortgage Lenders',
    url: 'https://www.usatoday.com/money/blueprint/mortgages/best-mortgage-lenders/',
    h1: 'Best mortgage lenders of 2024'
  },
  {
    title: 'CD Rates',
    url: 'https://www.usatoday.com/money/blueprint/banking/cds/best-cd-rates/',
    h1: 'Best CD rates of 2024'
  },
{
    title: 'Dividend ETFs',
    url: 'https://www.usatoday.com/money/blueprint/investing/best-dividend-etf/',
    h1: 'Best dividend ETFs of 2024'
  },
  {
    title: 'Best Credit Cards',
    url: 'https://www.usatoday.com/money/blueprint/credit-cards/best-credit-cards/',
    h1: 'Best credit cards of 2024'
  },
  {
    title: 'Chase Sapphire Review',
    url: 'https://www.usatoday.com/money/blueprint/credit-cards/reviews/chase-sapphire-preferred/',
    h1: 'Chase Sapphire Preferred review'
  },
  {
    title: 'Personal Loans',
    url: 'https://www.usatoday.com/money/blueprint/personal-loans/best-personal-loans/',
    h1: 'Best personal loans of 2024'
  },
  {
    title: 'Private Student Loans',
    url: 'https://www.usatoday.com/money/blueprint/student-loans/best-private-student-loans/',
    h1: 'Best private student loans of 2024'
  },
  {
    title: 'Protect 401k',
    url: 'https://www.usatoday.com/money/blueprint/retirement/protect-your-401k-during-recession/',
    h1: 'Protecting your 401(k) during a recession'
  },
  {
    title: 'LLC Services',
    url: 'https://www.usatoday.com/money/blueprint/business/business-formation/best-llc-services/',
    h1: 'Best LLC services of 2024'
  }
];
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Write CSV header
fs.writeFileSync(performanceCsvPath, 'Page,URL,LoadTime(ms),TopSlowResources\n');

test('Delayed audit of USA TODAY Blueprint pages with performance CSV', async ({ page }) => {
  for (let i = 0; i < pages.length; i++) {
    const { url, title } = pages[i];
    const screenshotPath = path.join(screenshotsDir, `${title.toLowerCase().replace(/ /g, '-')}.png`);
    const resources: { url: string; duration: number }[] = [];

    const requestTimings = new Map<string, number>();

    page.on('request', request => {
      if (request.url().includes('usatoday.com/money/blueprint')) {
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
