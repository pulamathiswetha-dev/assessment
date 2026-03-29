import { Page } from "@playwright/test";

export async function fillApproveRequestForm(
  page: Page,
  noteType: string = "Case Status Approve",
  subject: string = "Meets Case Management Criteria",
  dentalNeeds: string = "Test reason for approval",
  approveNote: string = "Test approval note"
) {
  // Fill Note Type
  const noteTypeCombo = page.getByRole("combobox", { name: "Note Type" });
  await noteTypeCombo.click();

  const noteTypeOption = page.getByRole("option", { name: noteType });
  await noteTypeOption.waitFor({ state: "visible", timeout: 30000 });
  await noteTypeOption.click();

  // Select Yes for urgent
  const yesOption = page.locator("text=/^Yes$/").first();
  await yesOption.waitFor({ state: "visible", timeout: 30000 });
  await yesOption.click();

  // Fill Subject
  const subjectCombo = page.getByRole("combobox", { name: "Subject" });
  await subjectCombo.waitFor({ state: "visible", timeout: 30000 });
  await subjectCombo.click();

  const subjectOption = page.getByRole("option", { name: subject });
  await subjectOption.waitFor({ state: "visible", timeout: 30000 });
  await subjectOption.click();

  // Fill Dental Needs
  const dentalNeedsInput = page.getByRole("textbox", {
    name: /Dental Needs|Primary Reason/,
  });
  await dentalNeedsInput.waitFor({ state: "visible", timeout: 30000 });
  await dentalNeedsInput.fill(dentalNeeds);

  // Fill Approve Note
  const approveNoteInput = page.getByRole("textbox", {
    name: "Approve Note",
  });
  await approveNoteInput.waitFor({ state: "visible", timeout: 30000 });
  await approveNoteInput.fill(approveNote);
}

export async function findAndClickApproveButton(page: Page) {
  const approveLocators = [
    page.locator("button:has-text('APPROVE')").first(),
    page.locator("span:has-text('APPROVE')").first(),
    page.locator("div[role='button']:has-text('APPROVE')").first(),
    page.locator("[class*='approve']:not([class*='deny'])").first(),
  ];

  let approveButton: any = null;
  for (const locator of approveLocators) {
    try {
      const isVisible = await locator
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      if (isVisible) {
        approveButton = locator;
        break;
      }
    } catch {
      // Try next selector
    }
  }

  if (!approveButton) {
    approveButton = page
      .locator("button, [role='button'], span, div")
      .filter({ hasText: "APPROVE" })
      .first();
  }

  if (approveButton) {
    await approveButton.waitFor({ state: "visible", timeout: 30000 });
    await approveButton.click();
  }

  return approveButton;
}
