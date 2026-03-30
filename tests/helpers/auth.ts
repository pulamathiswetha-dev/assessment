import { expect, Page } from "@playwright/test";

export async function login(page: Page) {
  await page.goto("https://dentalpayer.health3d.ai/");
  await page.getByRole("button", { name: "Start" }).click();
  await page.locator("#i0116").fill("casemanager2@careassistantb2c.onmicrosoft.com");
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator("#i0118").fill("Commonpassword$0724");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "Yes" }).click();

  // Wait for the page to load after login
  await expect(
    page.getByRole("button", { name: "Case Management route_to" }),
  ).toBeVisible();
}
