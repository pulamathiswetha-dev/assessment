import { test, expect, Page } from "@playwright/test";
import { getCaseIdFromFile } from "./helpers/fileHelper";
import { BASE_URL } from "./helpers/config";
import assessmentData from "./fixtures/assessmentData.json";

// Helper function to navigate to Assessment List page
async function navigateToAssessmentList(page: Page) {
  // Navigate to Case Management
  const caseManagementButton = page.getByRole("button", {
    name: "Case Management route_to",
  });
  await caseManagementButton.waitFor({ state: "visible", timeout: 30000 });
  await caseManagementButton.click();

  // Wait for dashboard to fully load
  await page.waitForLoadState("networkidle");

  // Navigate to Member List
  const memberListNav = page.locator("span.nav-text", {
    hasText: "Member List",
  });
  await memberListNav.waitFor({ state: "visible", timeout: 30000 });
  await expect(memberListNav).toBeEnabled({ timeout: 30000 });
  await memberListNav.click();

  // Wait for the member list page to load
  await page.waitForLoadState("networkidle");
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
  await page.waitForTimeout(2000);
  await page.waitForLoadState("networkidle");

  // Find and click on the Member name in the table
  const firstTableRow = page.locator("table tbody tr").first();
  await firstTableRow.waitFor({ state: "visible", timeout: 30000 });

  // Find the member name cell (second column - index 1)
  const memberNameCell = firstTableRow.locator("td").nth(1);
  await memberNameCell.waitFor({ state: "visible", timeout: 30000 });

  // Click on the member name cell to navigate to Member Info
  await memberNameCell.click();

  // Wait for navigation to Member Info page
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Verify we're on the Member Info page
  const memberInfoHeading = page
    .getByRole("main")
    .getByRole("heading", { name: "Member Info" });
  await memberInfoHeading.waitFor({ state: "visible", timeout: 30000 });
  await expect(memberInfoHeading).toBeVisible({ timeout: 30000 });

  // Navigate to Assessments side nav menu option
  await page.getByText("Assessments").click();
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/.*assessmentlist.*/, { timeout: 30000 });
}

// Helper function to click OHRA Adult Assessment START button
async function clickAssessmentStartButton(page: Page) {
  let ohraElement = page.getByText("OHRA Adult Assessment");
  await ohraElement.waitFor({ state: "visible", timeout: 30000 });
  await expect(ohraElement).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "START" }).nth(1).click();

  // Wait for navigation to assessment page
  await expect(page).toHaveURL(/.*assessment.*/, { timeout: 30000 });

  // Wait for assessment content to load
  await page.getByRole("main").waitFor({ state: "visible", timeout: 30000 });
}

// Helper function to fill text fields
async function fillTextField(page: Page, fieldId: string, value: string) {
  // Target specifically input elements with the given id (not divs)
  const field = page.locator(`input[id="${fieldId}"]`);
  const count = await field.count();

  if (count === 0) {
    // If no input found, try text areas
    const textAreaField = page.locator(`textarea[id="${fieldId}"]`);
    await textAreaField.waitFor({ state: "visible", timeout: 10000 });
    await textAreaField.click();
    await textAreaField.clear();
    await textAreaField.fill(value);
  } else if (count > 1) {
    // If multiple inputs, get the last one (it's usually the visible response field)
    const lastField = field.last();
    await lastField.waitFor({ state: "visible", timeout: 10000 });
    await lastField.click();
    await lastField.clear();
    await lastField.fill(value);
  } else {
    // Single input found
    await field.waitFor({ state: "visible", timeout: 10000 });
    await field.click();
    await field.clear();
    await field.fill(value);
  }
  console.log(`✓ Filled text field [${fieldId}] with value: ${value}`);
}

// Helper function to select radio button by field ID
async function selectRadio(page: Page, fieldId: string, value: string) {
  // Scope the selector to the specific field container, then find the option label
  const fieldContainer = page.locator(`[id="${fieldId}"]`);
  const radioButton = fieldContainer.locator(`.assessment-option-label`, {
    hasText: value,
  });

  await radioButton.waitFor({ state: "visible", timeout: 10000 });
  await radioButton.click();
  console.log(`✓ Selected radio [${fieldId}]: ${value}`);
}

// Helper function to select multiple radio options
async function selectMultipleRadios(
  page: Page,
  fieldId: string,
  values: string[],
) {
  const fieldContainer = page.locator(`[id="${fieldId}"]`);

  for (const value of values) {
    const radioButton = fieldContainer.locator(`.assessment-option-label`, {
      hasText: value,
    });
    await radioButton.waitFor({ state: "visible", timeout: 10000 });
    await radioButton.click();
    console.log(`✓ Selected radio [${fieldId}]: ${value}`);
  }
}

// Helper function to select dropdown option
async function selectDropdown(
  page: Page,
  fieldLabel: string,
  optionValue: string,
) {
  const dropdown = page.getByRole("combobox", { name: fieldLabel });
  await dropdown.waitFor({ state: "visible", timeout: 10000 });
  await dropdown.click();

  // Use exact: true to match the exact option name
  const option = page.getByRole("option", { name: optionValue, exact: true });
  await option.waitFor({ state: "visible", timeout: 10000 });
  await option.click();
  console.log(`✓ Selected dropdown [${fieldLabel}]: ${optionValue}`);
}

// Helper function to fill array fields (like phone and email together)
async function fillArrayField(page: Page, inputs: any[]) {
  for (const input of inputs) {
    if (input.label === "Cell Phone") {
      const phoneField = page.getByRole("textbox", { name: "Cell Phone" });
      await phoneField.waitFor({ state: "visible", timeout: 10000 });
      await phoneField.click();
      await phoneField.fill(input.value);
      console.log(`✓ Filled ${input.label}: ${input.value}`);
    } else if (input.label === "Email") {
      const emailField = page.getByRole("textbox", { name: "Email" });
      await emailField.waitFor({ state: "visible", timeout: 10000 });
      await emailField.click();
      await emailField.fill(input.value);
      console.log(`✓ Filled ${input.label}: ${input.value}`);
    }
  }
}

// Helper function to add assessment note
async function addAssessmentNote(page: Page, noteContent: string) {
  console.log(`\n📝 Adding assessment note: "${noteContent}"`);

  // Click the "+ADD ASSESSMENT NOTE(s)" button
  const addNoteButton = page.getByRole("button", {
    name: "+ADD ASSESSMENT NOTE(s)",
  });
  await addNoteButton.waitFor({ state: "visible", timeout: 10000 });
  await addNoteButton.click();
  console.log("✓ Clicked +ADD ASSESSMENT NOTE(s) button");

  // Wait for modal to open
  await page.waitForTimeout(1000);
  const noteModal = page.getByRole("dialog", { name: /Add Assessment Note/i });
  await noteModal.waitFor({ state: "visible", timeout: 10000 });
  console.log("✓ Assessment Note modal opened");

  // Fill the note content in the rich text editor
  const noteEditor = page.locator('div[contenteditable="true"]').first();
  await noteEditor.waitFor({ state: "visible", timeout: 10000 });
  await noteEditor.click();
  await noteEditor.fill(noteContent);
  console.log(`✓ Filled note content: "${noteContent}"`);

  // Click the SAVE button in the modal
  const saveButton = page.getByRole("button", { name: "SAVE" }).first();
  await saveButton.waitFor({ state: "visible", timeout: 10000 });
  await saveButton.click();
  console.log("✓ Clicked SAVE button");

  // Wait for modal to close
  await page.waitForTimeout(1000);
  await expect(noteModal).not.toBeVisible({ timeout: 5000 });
  console.log("✓ Note saved and modal closed");
}

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
});

// Data-driven helper function to fill and submit assessment form
async function fillAndSubmitAssessment(page: Page) {
  // Wait for assessment page to load
  await page.waitForLoadState("networkidle");
  // await expect(
  //   page.getByRole("row", { name: "BOWMAN First Name HAERTEL" }),
  // ).toBeVisible({ timeout: 10000 });

  console.log("Starting assessment form fill using data-driven approach...");

  // Iterate through all sections and fields in the assessment data
  for (const section of assessmentData) {
    console.log(`\n📋 Processing section: ${section.section_name}`);

    for (const field of section.fields) {
      const fieldId = field.field_name;
      const fieldLabel = field.field_ui_label;
      const fieldType = field.field_ui_control;
      const selectedValue = field.field_selected_value?.[0];
      const selectedResponse = (field as any)
        .field_selected_value_response?.[0];

      console.log(`\nField: ${fieldLabel} (${fieldType})`);

      try {
        // Handle different field types
        switch (fieldType) {
          case "text": {
            if (selectedValue) {
              await fillTextField(page, fieldId, selectedValue as string);
            }
            break;
          }

          case "radio": {
            if (selectedValue) {
              await selectRadio(page, fieldId, selectedValue as string);

              // If field has a response (like phone number), fill it
              if (selectedResponse) {
                await fillTextField(page, fieldId, selectedResponse as string);
              }
            }
            break;
          }

          case "radio-multiple": {
            if (Array.isArray(field.field_selected_value)) {
              await selectMultipleRadios(
                page,
                fieldId,
                field.field_selected_value as string[],
              );
            }
            break;
          }

          case "array": {
            // For array fields like phone + email
            if (
              field.field_selected_value &&
              field.field_selected_value.length > 0
            ) {
              const arrayData = field.field_selected_value[0];
              const inputs = [
                { label: "Cell Phone", value: (arrayData as any).cellphone },
                { label: "Email", value: (arrayData as any).email },
              ];
              await fillArrayField(page, inputs);
            }
            break;
          }

          case "dropdown": {
            if (
              field.field_selected_value &&
              field.field_selected_value.length > 0
            ) {
              const selectedOption = field.field_selected_value[0] as any;
              const optionValue =
                selectedOption.value || selectedOption.label || selectedOption;
              await selectDropdown(page, fieldLabel, optionValue as string);
            }
            break;
          }

          case "note": {
            // Handle assessment notes
            if (
              field.field_selected_value &&
              field.field_selected_value.length > 0
            ) {
              const noteData = field.field_selected_value[0] as any;
              const noteContent =
                noteData.note_content || noteData.mark_up_note_content;
              if (noteContent) {
                await addAssessmentNote(page, noteContent);
              }
            }
            break;
          }

          default:
            console.log(`⚠ Unknown field type: ${fieldType}`);
        }
      } catch (error) {
        console.error(`✗ Error filling field [${fieldId}]: ${error}`);
        throw error;
      }
    }
  }

  console.log("\n✓ Assessment form filled successfully");
  console.log("\n⏸ Pausing for 10 seconds to review filled answers...");
  console.log("📋 Check the form to verify all answers are correct");

  // Pause for 10 seconds so you can visually inspect the filled form
  await page.waitForTimeout(10000);

  console.log("\nSubmitting assessment...");

  try {
    // Scroll down to make sure COMPLETE button is visible
    await page
      .locator("body")
      .evaluate((el) => (el.scrollTop = el.scrollHeight));
    await page.waitForTimeout(1000);

    // Submit the assessment
    const completeButton = page.getByRole("button", { name: "COMPLETE" });
    await completeButton.waitFor({ state: "visible", timeout: 10000 });
    await completeButton.click();
    console.log("✓ Clicked COMPLETE button");

    // Wait for any dialog to appear
    await page.waitForTimeout(2000);

    // Try to find completion dialog with flexible name matching
    const dialog = page.locator('div[role="dialog"]').first();
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    console.log("✓ Completion dialog appeared");

    // Click Yes button in the dialog
    const yesButton = page.getByRole("button", { name: "Yes" }).first();
    await yesButton.waitFor({ state: "visible", timeout: 10000 });
    await yesButton.click();
    console.log("✓ Clicked Yes to confirm completion");

    // Wait for success message
    await page.waitForTimeout(2000);

    // Click CLOSE button
    const closeButton = page.getByRole("button", { name: "CLOSE" });
    await closeButton.waitFor({ state: "visible", timeout: 10000 });
    await closeButton.click();
    console.log("✓ Clicked CLOSE button");

    // Verify we're back on Case Management
    // await expect(page.getByRole("heading", { name: /Case Management/ })).toBeVisible({ timeout: 10000 });
    // console.log("✓ Assessment submitted successfully");
  } catch (error) {
    console.error("✗ Error during assessment submission:", error);
    throw error;
  }
}

// Individual test cases for step-by-step validation

test("Step 1: Launch the page and navigate to AssessmentList", async ({
  page,
}) => {
  await navigateToAssessmentList(page);
});

test("Step 2: Find OHRA Adult Assessment and Click Start button", async ({
  page,
}) => {
  await navigateToAssessmentList(page);
  await clickAssessmentStartButton(page);
});

test("Step 3: Verify OHRA Adult Assessment page is loaded", async ({
  page,
}) => {
  await navigateToAssessmentList(page);
  await clickAssessmentStartButton(page);

  // Verify assessment page loaded
  await expect(page).toHaveURL(/.*assessment.*/, { timeout: 30000 });

  let ohraElementHeading = page.getByText("OHRA Adult Assessment");
  await ohraElementHeading.waitFor({ state: "visible", timeout: 30000 });
  await expect(ohraElementHeading).toBeVisible({ timeout: 30000 });
});

// End-to-End Assessment Flow with data-driven form fill and submission
test("Step 4: Complete and submit OHRA Adult Assessment (Data-Driven)", async ({
  page,
}) => {
  await navigateToAssessmentList(page);
  await clickAssessmentStartButton(page);
  await fillAndSubmitAssessment(page);
});
