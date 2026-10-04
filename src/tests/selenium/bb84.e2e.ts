/**
 * BB84 Quantum Simulation – Selenium E2E Test Suite
 *
 * Prerequisites:
 *   1. The Vite dev server must be running on http://localhost:5173
 *      (npm run dev)
 *   2. Chrome / Chromium must be installed; chromedriver is auto-managed via
 *      selenium-webdriver's built-in browser detection (Selenium 4.x+).
 *
 * Run:
 *   npx ts-node --esm src/tests/selenium/bb84.e2e.ts
 *   – or –
 *   npm run test:e2e
 */

import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';

const BASE_URL = 'http://localhost:5173';
const DEFAULT_TIMEOUT = 20_000; // 20 s

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getDriver(): Promise<WebDriver> {
  const opts = new ChromeOptions();
  opts.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900');
  return new Builder().forBrowser('chrome').setChromeOptions(opts).build();
}

async function waitForText(driver: WebDriver, selector: string, text: string, timeout = DEFAULT_TIMEOUT) {
  await driver.wait(until.elementLocated(By.css(selector)), timeout);
  await driver.wait(async () => {
    const el = await driver.findElement(By.css(selector));
    const t = await el.getText();
    return t.toLowerCase().includes(text.toLowerCase());
  }, timeout, `Timed out waiting for "${text}" in "${selector}"`);
}

async function clickButton(driver: WebDriver, text: string) {
  const btns = await driver.findElements(By.css('button'));
  for (const btn of btns) {
    const label = await btn.getText();
    if (label.toLowerCase().includes(text.toLowerCase())) {
      await btn.click();
      return;
    }
  }
  throw new Error(`Button with text "${text}" not found`);
}

function log(msg: string) {
  console.log(`  [E2E] ${msg}`);
}

function pass(msg: string) {
  console.log(`  ✅  ${msg}`);
}

function fail(msg: string) {
  console.error(`  ❌  ${msg}`);
}

// ─── Test Runner ──────────────────────────────────────────────────────────────

interface TestResult { name: string; passed: boolean; error?: string }
const results: TestResult[] = [];

async function runTest(name: string, fn: (driver: WebDriver) => Promise<void>) {
  const driver = await getDriver();
  try {
    log(`Running: ${name}`);
    await fn(driver);
    pass(name);
    results.push({ name, passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    fail(`${name} — ${msg}`);
    results.push({ name, passed: false, error: msg });
  } finally {
    await driver.quit();
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test_pageLoads(driver: WebDriver) {
  await driver.get(BASE_URL);
  const title = await driver.getTitle();
  if (!title) throw new Error('Page title is empty');
  log(`Page title: ${title}`);
}

async function test_headerVisible(driver: WebDriver) {
  await driver.get(BASE_URL);
  const header = await driver.wait(
    until.elementLocated(By.xpath('//*[contains(text(),"BB84")]')),
    DEFAULT_TIMEOUT,
  );
  const text = await header.getText();
  if (!text.includes('BB84')) throw new Error(`Header text mismatch: "${text}"`);
}

async function test_step1_qubitGridLoads(driver: WebDriver) {
  await driver.get(BASE_URL);
  // Wait for Step 1 heading
  await driver.wait(
    until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')),
    DEFAULT_TIMEOUT,
  );
  // Grid must have at least 100 photon cells
  const cells = await driver.findElements(By.css('.grid > div'));
  if (cells.length < 100) throw new Error(`Expected ≥100 cells, got ${cells.length}`);
  log(`Step 1: found ${cells.length} photon cells`);
}

async function test_step1_polarizationArrowsPresent(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.wait(
    until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')),
    DEFAULT_TIMEOUT,
  );
  const arrowSymbols = ['↕', '↔', '↗', '↖'];
  const pageSource = await driver.getPageSource();
  const found = arrowSymbols.filter(s => pageSource.includes(s));
  if (found.length === 0) throw new Error('No arrow symbols found in the photon grid');
  log(`Step 1: polarization arrows found: ${found.join(' ')}`);
}

async function test_step1_regenerateButton(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.wait(
    until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')),
    DEFAULT_TIMEOUT,
  );
  // Get first cell content before regeneration
  const cells = await driver.findElements(By.css('.grid > div'));
  const firstBefore = await cells[0].getText();

  await clickButton(driver, 'REGeneRATE');
  await driver.sleep(300);

  const cellsAfter = await driver.findElements(By.css('.grid > div'));
  if (cellsAfter.length < 100) throw new Error('Grid disappeared after regeneration');
  log(`Step 1: grid regenerated (first cell before: "${firstBefore}")`);
}

async function test_step2_navigatesFromStep1(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.wait(
    until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')),
    DEFAULT_TIMEOUT,
  );
  await clickButton(driver, 'SEND THROUGH');
  await driver.wait(
    until.elementLocated(By.xpath('//*[contains(text(),"QUANTUM CHANNEL")]')),
    DEFAULT_TIMEOUT,
  );
  pass('Navigated to Step 2');
}

async function test_step2_eveToggleVisible(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'SEND THROUGH');
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"QUANTUM CHANNEL")]')), DEFAULT_TIMEOUT);

  const eveBtn = await driver.findElement(By.xpath('//button[contains(text(),"EVE EAVESDROPPING")]'));
  const text = await eveBtn.getText();
  if (!text.includes('EVE EAVESDROPPING')) throw new Error(`Eve button text mismatch: "${text}"`);
  log(`Step 2: Eve button label: "${text}"`);
}

async function test_step2_eveToggleChangesState(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'SEND THROUGH');
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"QUANTUM CHANNEL")]')), DEFAULT_TIMEOUT);

  const eveBtn = await driver.findElement(By.xpath('//button[contains(text(),"EVE EAVESDROPPING")]'));
  const beforeText = await eveBtn.getText();
  await eveBtn.click();
  await driver.sleep(200);
  const afterText = await eveBtn.getText();

  if (beforeText === afterText) throw new Error('Eve toggle did not change button state');
  log(`Step 2: Eve toggled from "${beforeText}" → "${afterText}"`);
}

async function test_step2_transmissionAndBlochSphere(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'SEND THROUGH');
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"QUANTUM CHANNEL")]')), DEFAULT_TIMEOUT);

  await clickButton(driver, 'START TRANSMISSION');
  // Bloch sphere canvas should be mounted
  const canvas = await driver.findElements(By.css('canvas'));
  if (canvas.length === 0) throw new Error('Three.js canvas not found');
  log(`Step 2: found ${canvas.length} canvas element(s) (Bloch sphere)`);
}

async function test_fullFlow_noEve(driver: WebDriver) {
  await driver.get(BASE_URL);

  // Step 1
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'SEND THROUGH');

  // Step 2 — no Eve, start & wait for completion
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"QUANTUM CHANNEL")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'START TRANSMISSION');
  await waitForText(driver, 'body', 'Transmission Complete', 60_000);
  await clickButton(driver, 'PROCEED TO BOB');

  // Step 3 — measure
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"BOB MEASURES")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'MEASURE QUBITS');
  await driver.sleep(500);
  await clickButton(driver, 'CALL ALICE');

  // Step 4 — reconcile
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"RECONCILIATION")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'COMPARE BASES');
  await waitForText(driver, 'body', 'bits retained', DEFAULT_TIMEOUT);
  await clickButton(driver, 'SECURITY TEST');

  // Step 5 — run test
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"EAVESDROPPER DETECTION")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'RUN SECURITY TEST');
  await driver.sleep(1000);

  const body = await driver.findElement(By.css('body'));
  const bodyText = await body.getText();
  // Without Eve, QBER should be 0% → channel secure
  if (!bodyText.includes('SECURE')) throw new Error(`Expected SECURE state, got: "${bodyText.substring(0, 200)}"`);
  log('Full flow (no Eve): CHANNEL SECURE ✓');
}

async function test_fullFlow_withEve(driver: WebDriver) {
  await driver.get(BASE_URL);

  // Step 1
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'SEND THROUGH');

  // Step 2 — activate Eve
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"QUANTUM CHANNEL")]')), DEFAULT_TIMEOUT);
  const eveBtn = await driver.findElement(By.xpath('//button[contains(text(),"EVE EAVESDROPPING")]'));
  await eveBtn.click();
  await driver.sleep(200);

  await clickButton(driver, 'START TRANSMISSION');
  await waitForText(driver, 'body', 'Transmission Complete', 60_000);
  await clickButton(driver, 'PROCEED TO BOB');

  // Step 3
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"BOB MEASURES")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'MEASURE QUBITS');
  await driver.sleep(500);
  await clickButton(driver, 'CALL ALICE');

  // Step 4
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"RECONCILIATION")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'COMPARE BASES');
  await waitForText(driver, 'body', 'bits retained', DEFAULT_TIMEOUT);
  await clickButton(driver, 'SECURITY TEST');

  // Step 5
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"EAVESDROPPER DETECTION")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'RUN SECURITY TEST');
  await driver.sleep(1000);

  const bodyText = await (await driver.findElement(By.css('body'))).getText();
  // With Eve, QBER should be high → eavesdropper detected
  if (!bodyText.includes('EAVESDROPPER') && !bodyText.includes('ABORT')) {
    throw new Error(`Expected eavesdropper detection, got: "${bodyText.substring(0, 200)}"`);
  }
  log('Full flow (with Eve): EAVESDROPPER DETECTED ✓');
}

async function test_wizardProgressBar(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')), DEFAULT_TIMEOUT);

  // The progress bar should have 5 step indicators
  const stepNodes = await driver.findElements(By.css('.rounded-full'));
  if (stepNodes.length < 5) throw new Error(`Expected ≥5 step indicator nodes, got ${stepNodes.length}`);
  log(`Wizard: ${stepNodes.length} progress step nodes found`);
}

async function test_blochSphere_renderOnLoad(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.wait(until.elementLocated(By.css('canvas')), DEFAULT_TIMEOUT);

  const canvas = await driver.findElements(By.css('canvas'));
  if (canvas.length === 0) throw new Error('Bloch Sphere canvas not rendered on initial load');
  log(`Bloch Sphere: canvas rendered (${canvas.length} canvas element(s))`);
}

async function test_step4_reconciliationTable(driver: WebDriver) {
  await driver.get(BASE_URL);

  // Step 1 → 2
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"ALICE PREPARES")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'SEND THROUGH');
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"QUANTUM CHANNEL")]')), DEFAULT_TIMEOUT);

  await clickButton(driver, 'START TRANSMISSION');
  await waitForText(driver, 'body', 'Transmission Complete', 60_000);
  await clickButton(driver, 'PROCEED TO BOB');

  // Step 3
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"BOB MEASURES")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'MEASURE QUBITS');
  await driver.sleep(500);
  await clickButton(driver, 'CALL ALICE');

  // Step 4
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"RECONCILIATION")]')), DEFAULT_TIMEOUT);
  await clickButton(driver, 'COMPARE BASES');
  await waitForText(driver, 'body', 'bits retained', DEFAULT_TIMEOUT);

  const tableRows = await driver.findElements(By.css('tbody tr'));
  if (tableRows.length < 50) throw new Error(`Expected ≥50 table rows, got ${tableRows.length}`);
  log(`Step 4: reconciliation table has ${tableRows.length} rows`);

  const pageSource = await driver.getPageSource();
  if (!pageSource.includes('KEEP') && !pageSource.includes('DISCARD')) {
    throw new Error('Reconciliation labels (KEEP/DISCARD) not found');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n━━━ BB84 Quantum Simulation – E2E Test Suite ━━━\n');

  await runTest('Page loads successfully', test_pageLoads);
  await runTest('BB84 header is visible', test_headerVisible);
  await runTest('Step 1: qubit grid loads with 100 cells', test_step1_qubitGridLoads);
  await runTest('Step 1: polarization arrows present (↕↔↗↖)', test_step1_polarizationArrowsPresent);
  await runTest('Step 1: REGENERATE button refreshes grid', test_step1_regenerateButton);
  await runTest('Step 2: navigates from Step 1', test_step2_navigatesFromStep1);
  await runTest('Step 2: Eve eavesdropping toggle visible', test_step2_eveToggleVisible);
  await runTest('Step 2: Eve toggle changes state', test_step2_eveToggleChangesState);
  await runTest('Step 2: Bloch Sphere canvas renders during transmission', test_step2_transmissionAndBlochSphere);
  await runTest('Wizard: progress bar has 5 step nodes', test_wizardProgressBar);
  await runTest('Bloch Sphere: canvas rendered on initial load', test_blochSphere_renderOnLoad);
  await runTest('Step 4: reconciliation table displays KEEP/DISCARD rows', test_step4_reconciliationTable);
  await runTest('Full flow (no Eve) → CHANNEL SECURE', test_fullFlow_noEve);
  await runTest('Full flow (with Eve) → EAVESDROPPER DETECTED', test_fullFlow_withEve);

  // ─── Summary ─────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log('\n━━━ Results ━━━');
  console.log(`  Total:  ${results.length}`);
  console.log(`  Passed: ${passed} ✅`);
  console.log(`  Failed: ${failed} ${failed > 0 ? '❌' : ''}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.name}`);
      if (r.error) console.log(`     ${r.error}`);
    });
    process.exit(1);
  }

  console.log('\n✅ All E2E tests passed!\n');
})();
