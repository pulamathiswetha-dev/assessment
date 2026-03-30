import { expect, Page } from "@playwright/test";

export async function startOHRAssessment(page: Page) {
  await page.getByText("Assessments").click();

  await expect(page.getByText("OHRA Adult Assessment")).toBeVisible();

  await page.getByRole("button", { name: "START" }).nth(1).click();
}
