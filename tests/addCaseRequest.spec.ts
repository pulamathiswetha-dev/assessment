import { test, expect } from "@playwright/test";

test("Add Case Request", async ({ page }) => {
  await page.getByRole("button", { name: "Case Management route_to" }).click();
  await page.getByText("Add Case Request").click();
  await page.getByRole("textbox", { name: "Member Number" }).click();
  await page
    .getByRole("textbox", { name: "Member Number" })
    .fill("1127127569-01");
  await page.getByRole("button", { name: "SEARCH MEMBER" }).click();
  await page.getByRole("radio").check();
  await page.getByRole("combobox", { name: "Referral Source" }).click();
  await page.getByRole("option", { name: "AVP Case Management" }).click();
  await page.getByRole("button", { name: "CREATE CASE REQUEST" }).click();
  await page.getByText("Active Case Management case").dblclick();
  await page
    .locator("div")
    .filter({ hasText: "MessageActive Case Management" })
    .nth(1)
    .press("ControlOrMeta+c");
  await page.getByRole("button", { name: "CLOSE" }).click();
});
