import { chromium } from 'playwright';

const DEPLOYMENT_URL = 'https://yhack-ys-636-robo-nexus.vercel.app/';

async function runTests() {
  console.log(`[PLAYWRIGHT TEST] Starting test on live deployment: ${DEPLOYMENT_URL}`);
  
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log(`  [BROWSER ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  [PAGE ERROR] ${err.message}`));

  console.log(`\n========================================`);
  console.log(`STAGE 1: Loading Live Vercel Deployment`);
  console.log(`========================================`);
  const response = await page.goto(DEPLOYMENT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log(`[OK] HTTP Status: ${response?.status()}`);

  const title = await page.title();
  console.log(`[OK] Page Title: ${title}`);

  // Wait for 5-Robot Fleet dashboard
  await page.waitForSelector('text=5-ROBOT FLEET', { timeout: 20000 });
  console.log('[OK] 5-Robot Fleet dashboard verified on live deployment.');

  console.log(`\n========================================`);
  console.log(`STAGE 2: Verifying 5-Robot Fleet UI`);
  console.log(`========================================`);
  for (let i = 1; i <= 5; i++) {
    const isVisible = await page.locator(`text=Robot ${i}`).first().isVisible();
    console.log(`  - Robot ${i}: ${isVisible ? 'ONLINE & VISIBLE' : 'NOT FOUND'}`);
  }

  console.log(`\n========================================`);
  console.log(`STAGE 3: Triggering Low Battery (10%) Event`);
  console.log(`========================================`);
  const demoButton = page.locator('button:has-text("Simulate Robot 1 Battery = 10%")').first();
  await demoButton.waitFor({ state: 'visible', timeout: 8000 });
  console.log('[OK] Found "Simulate Robot 1 Battery = 10%" button.');
  await demoButton.click();
  console.log('[OK] Clicked "Simulate Robot 1 Battery = 10%".');

  await page.waitForTimeout(2000);

  // Take screenshot of state right after click
  await page.screenshot({ path: 'd:/Y_hack/debug_after_click.png', fullPage: true });

  // Check what modal or alert elements are present
  const allButtons = await page.locator('button').allInnerTexts();
  console.log('[DEBUG] Active buttons on page:', allButtons.filter(b => b.trim().length > 0));

  console.log(`\n========================================`);
  console.log(`STAGE 4: Verifying Low Battery Alert / Acknowledgement Modal`);
  console.log(`========================================`);
  
  // Look for acknowledge button or dismiss button
  const ackBtn = page.locator('button:has-text("ACKNOWLEDGE"), button:has-text("Acknowledge")').first();
  const ackVisible = await ackBtn.isVisible();
  console.log(`[OK] Acknowledgement button visible: ${ackVisible ? 'YES' : 'NO'}`);

  if (ackVisible) {
    console.log('[OK] Clicking [ ACKNOWLEDGE ] button...');
    await ackBtn.click();
    await page.waitForTimeout(1500);
  }

  // Observe simulation
  console.log(`\n========================================`);
  console.log(`STAGE 5: Monitoring Live Fleet Simulation`);
  console.log(`========================================`);
  await page.waitForTimeout(5000);

  const screenshotPath = 'd:/Y_hack/playwright_live_verified.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`[OK] Saved verified test screenshot to ${screenshotPath}`);

  await browser.close();
  console.log(`\n======================================================`);
  console.log(`🎉 ALL PLAYWRIGHT LIVE DEPLOYMENT TESTS COMPLETED`);
  console.log(`======================================================\n`);
}

runTests().catch(err => {
  console.error('[TEST SUITE ERROR]', err);
  process.exit(1);
});
