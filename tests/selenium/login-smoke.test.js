import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'node:assert/strict';

const APP_URL = process.env.SELENIUM_BASE_URL || 'http://127.0.0.1:5173';
const HEADLESS = process.env.SELENIUM_HEADLESS !== 'false';

async function buildDriver() {
  const options = new chrome.Options();

  if (HEADLESS) {
    options.addArguments('--headless=new');
  }

  options.addArguments('--window-size=1440,900');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

async function run() {
  const driver = await buildDriver();

  try {
    await driver.get(APP_URL);

    const loginHeading = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-heading"]')),
      10000
    );

    const headingText = await loginHeading.getText();
    assert.match(headingText, /Welcome to/i);

    const emailInput = await driver.findElement(By.css('[data-testid="login-email"]'));
    const passwordInput = await driver.findElement(By.css('[data-testid="login-password"]'));

    await emailInput.sendKeys('bad-email');
    await passwordInput.sendKeys('123');
    await driver.findElement(By.css('[data-testid="login-submit"]')).click();

    const emailError = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Invalid email format')]")),
      10000
    );

    assert.ok(await emailError.isDisplayed());

    await driver.findElement(By.css('[data-testid="register-link"]')).click();

    const registerHeading = await driver.wait(
      until.elementLocated(By.css('[data-testid="register-heading"]')),
      10000
    );

    assert.equal(await registerHeading.getText(), 'Join Our Community');
    console.log('Selenium smoke test passed.');
  } finally {
    await driver.quit();
  }
}

run().catch((error) => {
  console.error('Selenium smoke test failed.');
  console.error(error);
  process.exit(1);
});
