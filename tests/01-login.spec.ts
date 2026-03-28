import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test("Login with valid credentials", async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/.*health3d\.ai.*/);
});

test("Navigate to Case Management workflow", async ({ page }) => {
  await login(page);
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
