import { chromium } from "@playwright/test";
import { login } from "./helpers/auth";
import { BASE_URL } from "./helpers/config";

async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🔐 Global Setup: Authenticating once for all tests...");

  // Login once and navigate to home
  await login(page);

  // Navigate back to home page after login for consistent starting state
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");

  // Save auth state for all tests
  await context.storageState({ path: "tests/.auth/user.json" });

  console.log("✅ Authentication complete. Auth state saved.");

  await context.close();
  await browser.close();
}

export default globalSetup;
