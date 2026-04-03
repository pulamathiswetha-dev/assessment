import { test, expect } from "@playwright/test";
import { BASE_URL } from "./helpers/config";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app (auth state will be automatically loaded by Playwright)
    await page.goto(BASE_URL);
  });

  test("Verify user is authenticated after login", async ({ page }) => {

    // Verify the Case Management button is visible (indicates successful authentication)
    const caseManagementButton = page.getByRole("button", {
      name: "Case Management route_to",
    });
    await caseManagementButton.waitFor({ state: "visible", timeout: 30000 });
    await expect(caseManagementButton).toBeVisible({ timeout: 30000 });
  });

  test("Navigate to Case Management dashboard", async ({ page }) => {
    // Click on Case Management button
    const caseManagementButton = page.getByRole("button", {
      name: "Case Management route_to",
    });
    await caseManagementButton.waitFor({ state: "visible", timeout: 30000 });
    await expect(caseManagementButton).toBeEnabled({ timeout: 30000 });
    await caseManagementButton.click();

    // Verify the dashboard page is launched
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });
    await page.waitForLoadState("networkidle");
  });

  test("Verify dashboard navigation options are visible", async ({ page }) => {
    // Navigate to Case Management
    const caseManagementButton = page.getByRole("button", {
      name: "Case Management route_to",
    });
    await caseManagementButton.click();
    await page.waitForLoadState("networkidle");

    // Verify sidebar navigation items are visible
    const addCaseNav = page.locator("span.nav-text", {
      hasText: "Add Case Request",
    });
    await addCaseNav.waitFor({ state: "visible", timeout: 30000 });
    await expect(addCaseNav).toBeVisible({ timeout: 30000 });
  });
});
