import { Page } from "@playwright/test";

export async function navigateToCaseManagement(page: Page) {
  const caseManagementButton = page.getByRole("button", {
    name: "Case Management route_to",
  });
  await caseManagementButton.waitFor({ state: "visible", timeout: 30000 });
  await caseManagementButton.click();
  await page.waitForLoadState("networkidle");
}

export async function navigateToAddCaseRequest(page: Page) {
  await navigateToCaseManagement(page);
  const addCaseRequestButton = page.locator("span.nav-text", {
    hasText: "Add Case Request",
  });
  await addCaseRequestButton.waitFor({ state: "visible", timeout: 30000 });
  await addCaseRequestButton.click();
  await page.waitForLoadState("networkidle");
}

export async function navigateToCaseRequestList(page: Page) {
  await navigateToCaseManagement(page);
  const caseRequestNav = page.getByText("Case Request", { exact: true });
  await caseRequestNav.waitFor({ state: "visible", timeout: 30000 });
  await caseRequestNav.click();
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("table", { timeout: 30000 });
}

export async function searchCaseById(page: Page, caseId: string) {
  const searchField = page.getByRole("textbox", { name: "Search" }).first();
  await searchField.waitFor({ state: "visible", timeout: 30000 });
  await searchField.click();
  await searchField.clear();
  await searchField.fill(caseId);
  await searchField.press("Enter");
  await page.waitForTimeout(2000);
  await page.waitForLoadState("networkidle");
}

export async function searchMemberByNumber(page: Page, memberNumber: string) {
  const memberNumberInput = page.getByRole("textbox", {
    name: "Member Number",
  });
  await memberNumberInput.waitFor({ state: "visible", timeout: 30000 });
  await memberNumberInput.click();
  await memberNumberInput.fill(memberNumber);

  const searchButton = page.getByRole("button", { name: "SEARCH MEMBER" });
  await searchButton.waitFor({ state: "visible", timeout: 30000 });
  await searchButton.click();

  await page.waitForLoadState("networkidle");
  // Wait for member search results section to appear
  await page.waitForTimeout(1000);
}

export async function selectMemberFromResults(page: Page) {
  const radioButton = page.getByRole("radio");
  await radioButton.waitFor({ state: "visible", timeout: 30000 });
  await radioButton.check();
}

export async function selectReferralSource(
  page: Page,
  sourceOption: string = "AVP Case Management"
) {
  const referralSourceCombo = page.getByRole("combobox", {
    name: "Referral Source",
  });
  await referralSourceCombo.waitFor({ state: "visible", timeout: 30000 });
  await referralSourceCombo.click();

  const referralOption = page.getByRole("option", {
    name: sourceOption,
  });
  await referralOption.waitFor({ state: "visible", timeout: 30000 });
  await referralOption.click();
}
