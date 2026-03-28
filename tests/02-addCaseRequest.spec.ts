import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { writeFileSync } from "fs";

test("Add Case Request", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "Case Management route_to" }).click();
  const addCaseRequestButton = page.locator("span.nav-text", {
    hasText: "Add Case Request",
  });
  await addCaseRequestButton.waitFor({ state: "visible", timeout: 30000 });
  await expect(addCaseRequestButton).toBeEnabled({ timeout: 30000 });
  await addCaseRequestButton.click();
  await page
    .getByRole("textbox", { name: "Member Number" })
    .waitFor({ state: "visible", timeout: 30000 });
  await page.getByRole("textbox", { name: "Member Number" }).click();
  await page
    .getByRole("textbox", { name: "Member Number" })
    .fill("25682743B-01");
  await page.getByRole("button", { name: "SEARCH MEMBER" }).click();
  await page.getByRole("radio").check();
  await page.getByRole("combobox", { name: "Referral Source" }).click();
  await page.getByRole("option", { name: "AVP Case Management" }).click();
  await page.getByRole("button", { name: "CREATE CASE REQUEST" }).click();
  const successMessage = page.locator(
    "text=/Case Request created with Case ID .*/",
  );
  await successMessage.waitFor({ state: "visible", timeout: 30000 });
  await expect(successMessage).toBeVisible({ timeout: 30000 });
  const message = (await successMessage.textContent()) || "";
  const caseIdMatch = message.match(/Case ID (\w+)/);
  const caseId = caseIdMatch ? caseIdMatch[1] : "";
  if (!caseId) {
    throw new Error("Unable to locate Case ID in success message: " + message);
  }
  writeFileSync("./caseId.txt", caseId);
  const closeButton = page.getByRole("button", { name: "CLOSE" });
  await closeButton.waitFor({ state: "visible", timeout: 30000 });
  await closeButton.click();
});
