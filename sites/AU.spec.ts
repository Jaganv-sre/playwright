import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';


// Ensure screenshots directory exists
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}


// Set test timeout to 30 seconds
test.setTimeout(60000);


// Helper functions
async function setupPage(page) {
  await page.setViewportSize({ width: 1280, height: 720 });
  page.on('pageerror', error => console.error('[RUNTIME ERROR]', error));
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
          return url.hostname.includes('forbes.com');
        } catch {
          return false;
        }
      })
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  });

  console.log(`\nTop 5 slowest internal resources for ${pageUrl}:`);
  console.table(performanceEntries);
}

async function runPageAudit(page, pageUrl, expectedTitle) {
  const start = Date.now();
  const title = test.info().title.replace(/ /g, '-');

  try {
    console.log(`[STATUS] Starting audit for ${test.info().title}`);
    await setupPage(page);
    await page.goto(pageUrl);

    // Basic page checks
    await expect(page.locator('h1')).toContainText(expectedTitle);
    await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();

    // Performance metrics
    const loadTime = ((Date.now() - start) / 1000).toFixed(3);
    test.info().annotations.push({ type: 'metric', description: `LoadTime:${loadTime}` });
    await capturePerformanceMetrics(page, pageUrl);

    // Screenshot
    await page.screenshot({ path: path.join(screenshotsDir, `${title}.png`), fullPage: true });
    console.log(`[INFO] Screenshot saved for ${test.info().title} audit`);
    console.log(`[STATUS] ${test.info().title} audit complete ✅`);
  } catch (error) {
    console.error(`[ERROR] ${test.info().title} audit failed ❌`, error);
    await page.screenshot({ path: path.join(screenshotsDir, `${title}-failure.png`), fullPage: true });
    throw error;
  }
}

// Common assertions that are used across all pages
async function verifyCommonElements(page) {
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
}

// Performance metrics tracking
async function trackPerformanceMetrics(page, pageUrl) {
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
          return url.hostname.includes('forbes.com');
        } catch {
          return false;
        }
      })
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  });

  console.log(`\nTop 5 slowest internal resources for ${pageUrl}:`);
  console.table(performanceEntries);
}

// Home page test
test('Home page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Smart Financial Decisions Made Simple');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, pageUrl);
});

// Investing page test
test('Investing page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/investing/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('How To Invest');
  await verifyCommonElements(page);
  await page.getByRole('link', { name: 'How To Invest', exact: true }).click();
  await expect(page.getByRole('link', { name: 'How To Invest', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, pageUrl);
});

// Credit Cards page test
test('Credit Cards page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/credit-cards/best-credit-cards/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best Credit Cards For Australians');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, pageUrl);
});

// SuperFunds page test
test('SuperFunds page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/superannuation/best-default-superannuation-funds-in-australia/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best Default Superannuation Funds In 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, pageUrl);
});

// Car Insurance page test
test('Car Insurance page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/car-insurance/best-comprehensive-car-insurance-providers/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best Comprehensive Car Insurance Providers in Australia');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, pageUrl);
});

// Health Insurance page test
test('Health Insurance page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/health-insurance/best-private-health-insurance-companies/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best Private Health Insurance Providers In Australia');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, pageUrl);
});

// Life Insurance page test
test('Life Insurance page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/life-insurance/best-life-insurance-australia/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best Life Insurance Providers For Australians');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, pageUrl);
});

// Pet Insurance page test
test('Pet Insurance page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/pet-insurance/best-pet-insurance-policies-in-australia/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best Comprehensive Pet Insurance Policies In Australia');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, pageUrl);
});

// Travel Insurance page test
test('Travel Insurance page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/travel-insurance/best-comprehensive-travel-insurance/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best Comprehensive Travel Insurance Providers In Australia');
  const page3Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Subscribe' }).click();
  const page3 = await page3Promise;
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, pageUrl);
});

// Business page test
test('Business page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/business/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Starting Your Small Business');
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Starting Your Small Business' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, pageUrl);
});

// Cryptocurrency page test
test('Cryptocurrency page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/investing/cryptocurrency/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Investing In Cryptocurrency');
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Investing In Cryptocurrency' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, pageUrl);
});

// Personal Loans page test
test('Personal Loans page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/personal-loans/best-personal-loans/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best Personal Loans For Australians');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, pageUrl);
});

// Savings Accounts page test
test('Savings Accounts page verification', async ({ page }) => {
  const pageUrl = 'https://www.forbes.com/advisor/au/savings/best-high-interest-savings-accounts/';
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best High-Interest Savings Accounts In Australia');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, pageUrl);
});



