import { test, expect } from "@playwright/test";
import { navigateToAddCaseRequest, searchMemberByNumber, selectMemberFromResults, selectReferralSource } from "./helpers/navigation";
import { writeFileSync } from "fs";
import { BASE_URL } from "./helpers/config";

test.describe("Add Case Request", () => {
  const MEMBER_NUMBER = "25682743B-01";
  // const MEMBER_NUMBER = "1127127569-01";

  test.beforeEach(async ({ page }) => {
    // Navigate to app first (auth state will be automatically loaded)
    await page.goto(BASE_URL);
    await navigateToAddCaseRequest(page);
  });

  test("Navigate to Add Case Request page", async ({ page }) => {
    const memberNumberInput = page.getByRole("textbox", {
      name: "Member Number",
    });
    await memberNumberInput.waitFor({ state: "visible", timeout: 30000 });
    await expect(memberNumberInput).toBeVisible({ timeout: 30000 });
  });

  test("Search for member by Member Number", async ({ page }) => {
    await searchMemberByNumber(page, MEMBER_NUMBER);

    // Wait for member search results - check for radio button or other member selection element
    const radioButton = page.getByRole("radio");
    await radioButton.waitFor({ state: "visible", timeout: 30000 });
    await expect(radioButton).toBeVisible({ timeout: 30000 });
  });

  test("Select member from search results", async ({ page }) => {
    await searchMemberByNumber(page, MEMBER_NUMBER);
    await selectMemberFromResults(page);

    const radioButton = page.getByRole("radio");
    await expect(radioButton).toBeChecked({ timeout: 30000 });
  });

  test("Select Referral Source for case request", async ({ page }) => {
    await searchMemberByNumber(page, MEMBER_NUMBER);
    await selectMemberFromResults(page);
    await selectReferralSource(page);

    const referralSourceCombo = page.getByRole("combobox", {
      name: "Referral Source",
    });
    await expect(referralSourceCombo).toHaveValue("AVP Case Management", {
      timeout: 30000,
    });
  });

  test("Create Case Request and verify success", async ({ page }) => {
    await searchMemberByNumber(page, MEMBER_NUMBER);
    await selectMemberFromResults(page);
    await selectReferralSource(page);

    const createButton = page.getByRole("button", {
      name: "CREATE CASE REQUEST",
    });
    await createButton.waitFor({ state: "visible", timeout: 30000 });
    await createButton.click();

    // Wait for page to load after clicking create
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Wait for success message - it should contain "Case" and "ID" and have an ID
    const successMessage = page.locator(
      "text=/Case.*ID.*\\w+/",
    );

    await successMessage.waitFor({ state: "visible", timeout: 30000 });
    await expect(successMessage).toBeVisible({ timeout: 30000 });

    const message = (await successMessage.textContent()) || "";
    // Try to extract case ID from different formats:
    // "Case Request created with Case ID AVP000000051145"
    // "Active Case Management case already exists for this member with Case ID – AVP000000051145"
    let caseId = "";
    const caseIdMatch = message.match(/Case ID (\w+)/);
    if (caseIdMatch && caseIdMatch[1]) {
      caseId = caseIdMatch[1];
    } else {
      // Try alternative format with – or - dash
      const altMatch = message.match(/Case ID\s*[–\-]?\s*(\w+)/);
      if (altMatch && altMatch[1]) {
        caseId = altMatch[1];
      }
    }

    if (!caseId) {
      throw new Error("Unable to locate Case ID in success message: " + message);
    }

    writeFileSync("./caseId.txt", caseId);
    console.log(`Case ID saved: ${caseId}`);
  });

  // test("Close success message dialog", async ({ page }) => {
  //   await searchMemberByNumber(page, MEMBER_NUMBER);
  //   await selectMemberFromResults(page);
  //   await selectReferralSource(page);

  //   const createButton = page.getByRole("button", {
  //     name: "CREATE CASE REQUEST",
  //   });
  //   await createButton.click();

  //   // Wait for page to load after clicking create
  //   await page.waitForLoadState("networkidle");
  //   await page.waitForTimeout(1000);

  //   // Wait for success message - it should contain "Case" and "ID" and have an ID
  //   const successMessage = page.locator(
  //     "text=/Case.*ID.*\\w+/",
  //   );

  //   await successMessage.waitFor({ state: "visible", timeout: 30000 });

  //   const closeButton = page.getByRole("button", { name: "CLOSE" });
  //   await closeButton.waitFor({ state: "visible", timeout: 30000 });
  //   await closeButton.click();

  //   await expect(successMessage).not.toBeVisible({ timeout: 30000 });
  // });
});
