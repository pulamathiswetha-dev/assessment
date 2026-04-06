import { expect, Page } from "@playwright/test";
// import dotenv from "dotenv";
// dotenv.config();

const BASE_URL = "https://dentalpayer.health3d.ai/";
const USERNAME = "casemanager2@careassistantb2c.onmicrosoft.com";
const PASSWORD = "Commonpassword$0724";

export async function login(page: Page) {
  await page.goto(BASE_URL);

  await page.getByRole("button", { name: "Start" }).click();

  await page.locator("#i0116").fill(USERNAME);
  await page.getByRole("button", { name: "Next" }).click();

  await page.locator("#i0118").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page
    .locator('input[type="submit"][value="Yes"]')
    .click({ force: true });

  const caseManagementButton = page.getByRole("button", {
    name: "Case Management route_to",
  });
  await caseManagementButton.waitFor({ state: "visible", timeout: 30000 });
  await expect(caseManagementButton).toBeVisible({ timeout: 30000 });
}
