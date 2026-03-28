import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { getCaseIdFromFile } from "./helpers/fileHelper";

test("Should search for case by ID and approve it", async ({ page }) => {
  // Login
  await login(page);

  // Navigate to Case Management
  await page.getByRole("button", { name: "Case Management route_to" }).click();

  // Navigate to Case Request list
  await page.getByText("Case Request", { exact: true }).click();

  // Wait for the table to load
  await page.waitForSelector("table", { timeout: 30000 });

  // Wait for the page to be fully loaded
  await page.waitForLoadState("networkidle");

  // Read caseId from file
  const caseId = getCaseIdFromFile();
  console.log(`Searching for case ID: ${caseId}`);

  // Find and fill the search field
  const searchField = page.getByRole("textbox", { name: "Search" }).first();
  await searchField.waitFor({ state: "visible", timeout: 30000 });
  await searchField.click();
  await searchField.clear();
  await searchField.fill(caseId);

  // Press Enter to search
  await searchField.press("Enter");

  // Wait for table to filter and show results
  await page.waitForTimeout(2000); // Give the table time to filter
  await page.waitForLoadState("networkidle");

  // Check if there's any data in the table
  const noDataMessage = await page
    .locator("text=No Matching Data is available")
    .isVisible()
    .catch(() => false);

  if (noDataMessage) {
    // Skip the test if no data is available
    test.skip();
  }

  // Find and click APPROVE button
  // The button could be in different formats, so we try multiple selectors
  const approveLocators = [
    page.locator("button:has-text('APPROVE')").first(), // Standard button
    page.locator("span:has-text('APPROVE')").first(),   // Span element
    page.locator("div[role='button']:has-text('APPROVE')").first(), // Div with button role
    page.locator("[class*='approve']:not([class*='deny'])").first(), // Class name based selector
  ];

  let approveButton: any = null;
  for (const locator of approveLocators) {
    try {
      const isVisible = await locator.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        approveButton = locator;
        break;
      }
    } catch {
      // Try next selector
    }
  }

  if (!approveButton) {
    // Last resort - find any clickable element with APPROVE text
    approveButton = page.locator("button, [role='button'], span, div").filter({ hasText: "APPROVE" }).first();
  }

  if (approveButton) {
    await approveButton.waitFor({ state: "visible", timeout: 30000 });
    await approveButton.click();
  }

  // Wait for modal to appear - look for the modal heading or SAVE button
  await page.waitForSelector("text=Approve Request", { timeout: 30000 });

  // Fill in the Approve modal fields
  // Note Type dropdown - select "Case Status Approve"
  const noteTypeCombo = page.getByRole("combobox", { name: "Note Type" });
  await noteTypeCombo.waitFor({ state: "visible", timeout: 30000 });
  await noteTypeCombo.click();

  const approveOption = page.getByRole("option", { name: "Case Status Approve" });
  await approveOption.waitFor({ state: "visible", timeout: 30000 });
  await approveOption.click();

  // Select "Is the case type urgent?" - Yes (it's a generic element, not a button)
  const yesOption = page.locator("text=/^Yes$/").first();
  await yesOption.waitFor({ state: "visible", timeout: 30000 });
  await yesOption.click();

  // Select Subject dropdown
  const subjectCombo = page.getByRole("combobox", { name: "Subject" });
  await subjectCombo.waitFor({ state: "visible", timeout: 30000 });
  await subjectCombo.click();

  const subjectOption = page.getByRole("option", { name: "Meets Case Management Criteria" });
  await subjectOption.waitFor({ state: "visible", timeout: 30000 });
  await subjectOption.click();

  // Fill in Dental Needs/Primary Reason text field
  const dentalNeedsInput = page.getByRole("textbox", { name: /Dental Needs|Primary Reason/ });
  await dentalNeedsInput.waitFor({ state: "visible", timeout: 30000 });
  await dentalNeedsInput.fill("Test reason for approval");

  // Fill in Approve Note text field
  const approveNoteInput = page.getByRole("textbox", { name: "Approve Note" });
  await approveNoteInput.waitFor({ state: "visible", timeout: 30000 });
  await approveNoteInput.fill("Test approval note");

  // Click SAVE button in modal
  const saveButton = page.getByRole("button", { name: "SAVE" });
  await saveButton.waitFor({ state: "visible", timeout: 30000 });
  await saveButton.click();

  // Verify success message - wait for the dialog to appear
  await page.waitForSelector("text=/You have successfully approved the case/", { timeout: 30000 });

  // Verify the success message is visible
  await expect(
    page.locator("text=/You have successfully approved the case/")
  ).toBeVisible({ timeout: 30000 });

  // Close success message
  const closeButton = page.getByRole("button", { name: "CLOSE" });
  await closeButton.waitFor({ state: "visible", timeout: 30000 });
  await closeButton.click();
});
