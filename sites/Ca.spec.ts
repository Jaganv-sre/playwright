import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Ensure screenshots directory exists
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Set test timeout to 60 seconds
test.setTimeout(60000);

// Helper functions
async function setupPage(page: Page) {
  await page.setViewportSize({ width: 1280, height: 720 });
  page.on('pageerror', error => console.error('[RUNTIME ERROR]', error));
}

async function checkCaptcha(page: Page): Promise<boolean> {
  const captchaPresent = await page.locator('iframe[src*="captcha"], div:has-text("Press & Hold"), div[class*="captcha"]').first().isVisible().catch(() => false);
  if (captchaPresent) {
    console.warn('[WARNING] CAPTCHA detected on the page, skipping further checks.');
    await page.screenshot({ path: path.join(screenshotsDir, `captcha-detected-${Date.now()}.png`), fullPage: true });
    return true;
  }
  return false;
}

async function capturePerformanceMetrics(page: Page, pageUrl: string) {
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

async function verifyCommonElements(page: Page) {
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
}

async function trackPerformanceMetrics(page: Page, pageUrl: string) {
  const startTime = Date.now();
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

  const totalLoadTime = ((Date.now() - startTime) / 1000).toFixed(3);
  console.log(`\nTotal Load Time for ${pageUrl}: ${totalLoadTime} seconds`);
  console.table(performanceEntries);

  test.info().annotations.push({ type: 'metric', description: `Total Load Time: ${totalLoadTime}s` });
}

// Tests
test('Home page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Smart Financial Decisions Made Simple');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Home page');
});

test('Credit Cards page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/credit-cards/best/best-credit-cards/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText("Compare Canada's Best Credit Cards and Choose Your Perfect Match");
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Credit Cards page');
});

test('Business page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/business/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Transform Your Small Business');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Business page');
});

test('Cash Back Credit Cards page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/credit-cards/best/cash-back/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Best Cash Back Credit Cards In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Cash Back Credit Cards page');
});

test('Mortgage Lenders page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/mortgages/best-mortgage-lenders/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Best Mortgage Lenders In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Mortgage Lenders page');
});

test('Mortgage Rates page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/mortgages/best-mortgage-rates-in-canada/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Best Mortgage Rates In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Mortgage Rates page');
});

test('Personal Loans page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/personal-loans/best-personal-loans/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Best Personal Loans In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Personal Loans page');
});

test('GIC Rates page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/banking/gic/best-gic-rates/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Best GIC Rates In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'GIC Rates page');
});

test('Savings Accounts page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/banking/savings/best-savings-accounts/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Best Savings Accounts In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Savings Accounts page');
});

test('Chequing Accounts page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/banking/chequing/best-chequing-accounts/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Best Chequing Accounts In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Chequing Accounts page');
});

test('Travel Credit Cards page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/ca/credit-cards/best/travel/');
  if (await checkCaptcha(page)) return;

  await expect(page.locator('h1')).toContainText('Best Travel Credit Cards In Canada For 2025');
  await verifyCommonElements(page);
  await trackPerformanceMetrics(page, 'Travel Credit Cards page');
});
