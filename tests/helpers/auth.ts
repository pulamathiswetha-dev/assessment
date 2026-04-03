import { expect, Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://dentalpayer.health3d.ai/";
const USERNAME = process.env.USERNAME || "";
const PASSWORD = process.env.PASSWORD || "";

export async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.getByRole("button", { name: "Start" }).click();
  await page.locator("#i0116").fill(USERNAME);
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator("#i0118").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "Yes" }).click();

  // Wait for the page to load after login
  await expect(
    page.getByRole("button", { name: "Case Management route_to" }),
  ).toBeVisible();
}
