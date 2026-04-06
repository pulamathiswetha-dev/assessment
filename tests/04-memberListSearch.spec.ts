import { test, expect } from "@playwright/test";
import { getCaseIdFromFile } from "./helpers/fileHelper";
import { BASE_URL } from "./helpers/config";

test("Complete full member list search and navigation flow", async ({ page }) => {
  // Navigate to app first (auth state will be automatically loaded)
  await page.goto(BASE_URL);

  // STEP 1: Navigate to Member List from side navigation
  const caseManagementButton = page.getByRole("button", { name: "Case Management route_to" });
  await caseManagementButton.waitFor({ state: "visible", timeout: 30000 });
  await caseManagementButton.click();
  await page.waitForLoadState("networkidle");
  console.log("✓ Navigated to Case Management");

  // Click on Member List in the side navigation
  const memberListNav = page.locator("span.nav-text", {
    hasText: "Member List",
  });
  await memberListNav.waitFor({ state: "visible", timeout: 30000 });
  await expect(memberListNav).toBeEnabled({ timeout: 30000 });
  await memberListNav.click();

  // Verify the member list page is loaded
  await expect(page).toHaveURL(/.*\/memberlist/, { timeout: 30000 });
  await page.waitForLoadState("networkidle");

  // Verify the page title or heading is visible (target main content only)
  const pageHeading = page
    .getByRole("main")
    .getByRole("heading", { name: "Member List" });
  await pageHeading.waitFor({ state: "visible", timeout: 30000 });
  await expect(pageHeading).toBeVisible({ timeout: 30000 });
  console.log("✓ Member List page loaded");

  // STEP 2: Search for case by Case ID in Member List
  await page.waitForSelector("table", { timeout: 30000 });

  // Read caseId from file
  const caseId = getCaseIdFromFile();
  console.log(`Searching for case ID: ${caseId}`);

  // Find and fill the Case ID search field
  const caseIdSearchField = page.getByRole("textbox", { name: "Case ID" });
  await caseIdSearchField.waitFor({ state: "visible", timeout: 30000 });
  await caseIdSearchField.click();
  await caseIdSearchField.clear();
  await caseIdSearchField.fill(caseId);

  // Press Enter to search
  await caseIdSearchField.press("Enter");

  // Wait for the table to filter and show results
  await page.waitForTimeout(2000); // Give the table time to filter
  await page.waitForLoadState("networkidle");

  // Verify search results are displayed
  // Check if the case ID is visible in the table
  const searchResult = page.locator(`text=${caseId}`);
  await searchResult.waitFor({ state: "visible", timeout: 30000 });
  await expect(searchResult).toBeVisible({ timeout: 30000 });

  // Verify table has data (not showing "No data" message)
  const noDataMessage = await page
    .locator("text=No Matching Data is available")
    .isVisible()
    .catch(() => false);

  expect(noDataMessage).toBeFalsy();
  console.log("✓ Case found in Member List");

  // STEP 3: Click on Member name and navigate to Member Info page
  // Find and click on the Member name in the table
  // The member name is in the first row of the table
  const firstTableRow = page.locator("table tbody tr").first();
  await firstTableRow.waitFor({ state: "visible", timeout: 30000 });

  // Find the member name cell (second column - index 1)
  const memberNameCell = firstTableRow.locator("td").nth(1);
  await memberNameCell.waitFor({ state: "visible", timeout: 30000 });

  // Click on the member name cell
  await memberNameCell.click();

  // Wait for navigation to complete
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000); // Additional wait for page transition

  // Verify we're on the Member Info page by checking the heading (target main content only)
  const memberInfoHeading = page
    .getByRole("main")
    .getByRole("heading", { name: "Member Info" });
  await memberInfoHeading.waitFor({ state: "visible", timeout: 30000 });
  await expect(memberInfoHeading).toBeVisible({ timeout: 30000 });

  // Verify the page URL contains caserequest (the member info page URL pattern)
  await expect(page).toHaveURL(/.*\/caserequest\/.*/, { timeout: 30000 });

  console.log("✓ Navigated to Member Info page successfully");

  // Wait for some time to view the member info screen
  await page.waitForTimeout(3000);
});
