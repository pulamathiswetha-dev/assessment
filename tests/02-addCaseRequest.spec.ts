import { test, expect } from "@playwright/test";
import { navigateToAddCaseRequest, searchMemberByNumber, selectMemberFromResults, selectReferralSource } from "./helpers/navigation";
import { writeFileSync } from "fs";
import { BASE_URL } from "./helpers/config";

test.describe("Add Case Request", () => {
  const MEMBER_NUMBER = "25682743B-01";
  // const MEMBER_NUMBER = "1127127569-01";

  test("Complete full case request creation flow", async ({ page }) => {
    // Navigate to Add Case Request page
    await navigateToAddCaseRequest(page);
    // STEP 1: Verify Member Number input field is visible
    const memberNumberInput = page.getByRole("textbox", {
      name: "Member Number",
    });
    await memberNumberInput.waitFor({ state: "visible", timeout: 30000 });
    await expect(memberNumberInput).toBeVisible({ timeout: 30000 });
    console.log("✓ Member Number input field found");

    // STEP 2: Search for member by Member Number
    await searchMemberByNumber(page, MEMBER_NUMBER);

    // Wait for member search results - check for radio button or other member selection element
    const radioButton = page.getByRole("radio");
    await radioButton.waitFor({ state: "visible", timeout: 30000 });
    await expect(radioButton).toBeVisible({ timeout: 30000 });
    console.log("✓ Member search results displayed");

    // STEP 3: Select member from search results
    await selectMemberFromResults(page);

    const radioButtonChecked = page.getByRole("radio");
    await expect(radioButtonChecked).toBeChecked({ timeout: 30000 });
    console.log("✓ Member selected from results");

    // STEP 4: Select Referral Source for case request
    await selectReferralSource(page);

    const referralSourceCombo = page.getByRole("combobox", {
      name: "Referral Source",
    });
    await expect(referralSourceCombo).toHaveValue("AVP Case Management", {
      timeout: 30000,
    });
    console.log("✓ Referral Source selected");

    // STEP 5: Create Case Request and verify success
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
    console.log(`✓ Case Request created successfully with Case ID: ${caseId}`);
  });

  // test("Close success message dialog", async ({ page }) => {
  //   const closeButton = page.getByRole("button", { name: "CLOSE" });
  //   await closeButton.waitFor({ state: "visible", timeout: 30000 });
  //   await closeButton.click();

  //   const successMessage = page.locator("text=/Case.*ID.*\\w+/");
  //   await expect(successMessage).not.toBeVisible({ timeout: 30000 });
  // });
});
