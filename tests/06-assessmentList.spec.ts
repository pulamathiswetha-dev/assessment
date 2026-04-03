import { test, expect, Page } from "@playwright/test";
import { getCaseIdFromFile } from "./helpers/fileHelper";
import { BASE_URL } from "./helpers/config";

// Helper function to navigate to Assessment List page and click Start on the Assessment
async function navigateToAssessmentList(page: Page) {
  // Navigate to app first if not already there
  if (page.url() === "about:blank") {
    await page.goto(BASE_URL);
  }

  // Navigate to Case Management
  await page.getByRole("button", { name: "Case Management route_to" }).click();

  // Navigate to Member List
  const memberListNav = page.locator("span.nav-text", {
    hasText: "Member List",
  });
  await memberListNav.waitFor({ state: "visible", timeout: 10000 });
  await memberListNav.click();

  // Wait for the member list page to load
  await page.waitForSelector("table", { timeout: 10000 });

  // Read caseId from file
  const caseId = getCaseIdFromFile();
  console.log(`Searching for case ID: ${caseId}`);

  // Find and fill the Case ID search field
  const caseIdSearchField = page.getByRole("textbox", { name: "Case ID" });
  await caseIdSearchField.waitFor({ state: "visible", timeout: 10000 });
  await caseIdSearchField.click();
  await caseIdSearchField.clear();
  await caseIdSearchField.fill(caseId);

  // Press Enter to search
  await caseIdSearchField.press("Enter");

  // Wait for the table to filter and show results
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

  // Find and click on the Member name in the table
  const firstTableRow = page.locator("table tbody tr").first();
  await firstTableRow.waitFor({ state: "visible", timeout: 10000 });

  // Find the member name cell (second column - index 1)
  const memberNameCell = firstTableRow.locator("td").nth(1);
  await memberNameCell.waitFor({ state: "visible", timeout: 10000 });

  // Click on the member name cell to navigate to Member Info
  await memberNameCell.click();

  // Wait for navigation to Member Info page
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

  // Verify we're on the Member Info page
  const memberInfoHeading = page
    .getByRole("main")
    .getByRole("heading", { name: "Member Info" });
  await memberInfoHeading.waitFor({ state: "visible", timeout: 10000 });
  await expect(memberInfoHeading).toBeVisible({ timeout: 10000 });

  // Navigate to Assessments via sidebar navigation
  //   const tasksNav = page.locator("span.nav-text", {
  //     hasText: "Assessments",
  //   });
  await page.getByText("Assessments").click();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
  await expect(page).toHaveURL(/.*assessmentlist.*/);
  //   await expect(page.getByText("OHRA Adult Assessment")).toBeVisible();
  //   await page.getByRole("button", { name: "START" }).nth(1).click();
  //   await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
}

async function clickAssessmentStartButton(page: Page) {
  let ohraElement = page.getByText("OHRA Adult Assessment");
  await ohraElement.waitFor({ state: "visible", timeout: 10000 });
  await expect(ohraElement).toBeVisible();
  await page.getByRole("button", { name: "START" }).nth(1).click();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
}

test("Step 1: Launch the page and navigate to AssessmentList", async ({
  page,
}) => {
  await page.goto("https://dentalpayer.health3d.ai/");
  await navigateToAssessmentList(page);
});

test("Step 2: Find OHRA Adult Assessment and Click Start button", async ({
  page,
}) => {
  await page.goto("https://dentalpayer.health3d.ai/");
  await navigateToAssessmentList(page);
  await clickAssessmentStartButton(page);
});

test("Step 2: Find OHRA Adult Assessment is loaded or not", async ({
  page,
}) => {
  await page.goto("https://dentalpayer.health3d.ai/");
  await navigateToAssessmentList(page);
  await clickAssessmentStartButton(page);
  await expect(page).toHaveURL(/.*assessment.*/);
  let ohraElementHeading = page.getByText("OHRA Adult Assessment");
  await ohraElementHeading.waitFor({ state: "visible", timeout: 10000 });
  await expect(ohraElementHeading).toBeVisible();
});
