import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test("Login with valid credentials", async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/.*health3d\.ai.*/);
});

test("Navigate to Case Management workflow", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "Case Management route_to" }).click();
  // Verify the dashboard page is launched
  await expect(page).toHaveURL(/.*\/dashboard/);
  // Wait for some time on the dashboard page
  await page.waitForTimeout(5000);
});
