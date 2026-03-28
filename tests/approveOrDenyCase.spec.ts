import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://dentalpayer.health3d.ai/");
  await page.getByRole("button", { name: "Start" }).click();
  await page
    .getByRole("textbox", { name: "someone@example.com" })
    .fill("casemanager2@careassistantb2c.onmicrosoft.com");
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator("#i0118").fill("Commonpassword$0724");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "Yes" }).click();
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
  await page.getByText("Active Case Management case").click();
  await page.getByText("Active Case Management case").click();
  await page.getByText("Active Case Management case").click();
  await page.getByRole("button", { name: "CLOSE" }).click();
  await page.getByText("Case Request", { exact: true }).click();
  await page.getByRole("textbox", { name: "Search" }).click();
  await page.getByRole("textbox", { name: "Search" }).fill("caseId");
  await page.getByRole("textbox", { name: "Search" }).press("Enter");
  await page.getByText("APPROVE").click();
  await page.getByRole("combobox", { name: "Subject" }).click();
  await page
    .getByRole("option", { name: "Meets Case Management Criteria" })
    .click();
  await page
    .getByRole("textbox", { name: "Dental Needs/Primary Reason" })
    .click();
  await page
    .getByRole("textbox", { name: "Dental Needs/Primary Reason" })
    .fill("Test reason");
  await page.getByRole("textbox", { name: "Approve Note" }).click();
  await page
    .getByRole("textbox", { name: "Approve Note" })
    .fill("Test approval note");
  await page.getByRole("textbox", { name: "Approve Note" }).click();
  await page.getByRole("button", { name: "SAVE" }).click();
  await page.getByRole("heading", { name: "Message" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^You have successfully approved the case$/ })
    .click();
  await page.getByRole("button", { name: "CLOSE" }).click();
  await page.locator("div:nth-child(4)").click();
  await page
    .getByRole("textbox", { name: "Case ID First Name Last Name" })
    .click();
  await page
    .getByRole("textbox", { name: "Case ID First Name Last Name" })
    .fill("AVP000000051137");
  await page
    .getByRole("textbox", { name: "Case ID First Name Last Name" })
    .press("Enter");
  await page.getByText("TAYNA CAMISA").click();
});
