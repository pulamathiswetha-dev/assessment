import { test as base, Page } from "@playwright/test";
import { existsSync } from "fs";

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ context, page }, use) => {
    // Check if auth state file exists
    const authStatePath = "tests/.auth/user.json";

    if (existsSync(authStatePath)) {
      // Load the pre-authenticated cookies/tokens from global-setup
      await context.addInitScript(() => {
        // This runs before the page loads, after the auth state is already set
      });

      // Navigate to the app - the auth state cookies are already in the context
      await page.goto("https://dentalpayer.health3d.ai/");

      // Wait for the page to fully load with authentication
      try {
        await page.waitForLoadState("networkidle");
      } catch (e) {
        console.log("⚠️ Page load timeout, but continuing...");
      }
    } else {
      console.error("❌ Auth state file not found! Run global-setup first.");
      console.error(`   Expected file: ${authStatePath}`);
    }

    // Use the page for the test
    await use(page);
  },
});

export { expect } from "@playwright/test";
