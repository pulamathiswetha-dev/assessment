import { test, Page } from "@playwright/test";
import { login } from "./helpers/auth";
import { getCaseIdFromFile } from "./helpers/fileHelper";

/**
 * DEBUG TEST: Detailed logging for First Initial Outreach task completion
 * Run this to see exactly what happens during task submission
 */

async function navigateToTasksPage(page: Page) {
  await login(page);
  await page.getByRole("button", { name: "Case Management route_to" }).click();

  const memberListNav = page.locator("span.nav-text", {
    hasText: "Member List",
  });
  await memberListNav.waitFor({ state: "visible", timeout: 10000 });
  await memberListNav.click();

  await page.waitForSelector("table", { timeout: 10000 });

  const caseId = getCaseIdFromFile();
  console.log(`Searching for case ID: ${caseId}`);

  const caseIdSearchField = page.getByRole("textbox", { name: "Case ID" });
  await caseIdSearchField.waitFor({ state: "visible", timeout: 10000 });
  await caseIdSearchField.click();
  await caseIdSearchField.clear();
  await caseIdSearchField.fill(caseId);
  await caseIdSearchField.press("Enter");
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

  const firstTableRow = page.locator("table tbody tr").first();
  await firstTableRow.waitFor({ state: "visible", timeout: 10000 });

  const memberNameCell = firstTableRow.locator("td").nth(1);
  await memberNameCell.click();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

  const tasksNav = page.locator("span.nav-text", {
    hasText: "Tasks",
  });
  await tasksNav.waitFor({ state: "visible", timeout: 10000 });
  await tasksNav.click();

  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {
    console.log("Network idle timeout - proceeding anyway");
  });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
}

test("DEBUG: First Initial Outreach - Complete Step-by-Step", async ({ page }) => {
  // Listen to all network requests
  const requests: any[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" || request.method() === "PUT") {
      console.log(`🌐 ${request.method()} ${request.url()}`);
      requests.push({
        method: request.method(),
        url: request.url(),
        time: new Date().toISOString(),
      });
    }
  });

  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      (response.url().includes("task") || response.url().includes("complete"))
    ) {
      console.log(
        `❌ ERROR RESPONSE: ${response.status()} ${response.url()}`
      );
    }
  });

  await navigateToTasksPage(page);
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => null);
  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

  console.log("\n📌 === STARTING DEBUG: FIRST INITIAL OUTREACH ===\n");

  // Find task
  console.log("🔍 Looking for 'First Initial Outreach' task...");
  const task = page.locator("text=First Initial Outreach").first();
  const exists = await task.isVisible({ timeout: 10000 }).catch(() => false);

  if (!exists) {
    console.log("❌ Task not found on page");
    const allText = await page.content().catch(() => "");
    if (allText.includes("First Initial Outreach")) {
      console.log(
        "⚠️  Task text exists in DOM but not visible - may be hidden"
      );
    }
    return;
  }

  console.log("✅ Task found!");

  // Click menu
  console.log("🖱️  Clicking task menu button...");
  const menuButton = task.locator(
    "xpath=ancestor::div[contains(@class, 'card-inner-layout')]/div[contains(@class, 'dot-action')]"
  );
  await menuButton.click();
  await page.evaluate(() => new Promise((r) => setTimeout(r, 1500)));

  // Click Complete
  console.log("🖱️  Clicking 'Complete' option...");
  const completeOption = page.locator("text=/Complete/i").first().locator("..");
  await completeOption.click({ force: true });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 1500)));

  // Check modal
  console.log("📋 Checking for 'Task Complete' modal...");
  const modal = page.getByRole("heading", { name: "Task Complete" });
  const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);

  if (!modalVisible) {
    console.log("❌ Modal did not appear!");
    await page.screenshot({ path: "debug-no-modal.png" });
    return;
  }

  console.log("✅ Modal opened");

  // Check all form fields
  console.log("\n📝 === FORM STATE ===");

  // Duration Hr
  const durationHr = page.getByRole("combobox", { name: "Duration(Hr)" });
  const durationHrVisible = await durationHr.isVisible().catch(() => false);
  console.log(`Duration(Hr): ${durationHrVisible ? "✅ Visible" : "❌ Hidden"}`);

  if (durationHrVisible) {
    await durationHr.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    const hourOption = page.getByRole("option", { name: "01" }).first();
    const hourExists = await hourOption.isVisible().catch(() => false);
    console.log(`  Option "01": ${hourExists ? "✅ Exists" : "❌ Not found"}`);
    await hourOption.click();
  }

  // Duration Min
  const durationMin = page.getByRole("combobox", { name: "Duration(Min)" });
  const durationMinVisible = await durationMin.isVisible().catch(() => false);
  console.log(`Duration(Min): ${durationMinVisible ? "✅ Visible" : "❌ Hidden"}`);

  if (durationMinVisible) {
    await durationMin.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    const minOption = page.getByRole("option", { name: "01" });
    const minExists = await minOption.isVisible().catch(() => false);
    console.log(`  Option "01": ${minExists ? "✅ Exists" : "❌ Not found"}`);
    await minOption.click();
  }

  // Notes
  console.log("\n📝 === NOTES FIELD ===");
  let notesEditor = page.locator("[contenteditable='true']").first();
  let isContentEditable = await notesEditor.isVisible().catch(() => false);

  if (!isContentEditable) {
    console.log("Contenteditable not found, trying textarea...");
    notesEditor = page.locator("textarea").first();
  }

  const notesVisible = await notesEditor.isVisible().catch(() => false);
  console.log(`Notes field: ${notesVisible ? "✅ Visible" : "❌ Hidden"}`);
  console.log(`Field type: ${isContentEditable ? "contenteditable" : "textarea"}`);

  if (notesVisible) {
    await notesEditor.click();
    await notesEditor.fill("DEBUG: Initial outreach task completed");
    const filledValue = await notesEditor.inputValue().catch(async () => {
      return await notesEditor.textContent();
    });
    console.log(`Notes value filled: ${filledValue ? "✅" : "❌"}`);
  }

  // Check for Save button
  console.log("\n💾 === SAVE BUTTON ===");
  const saveButton = page.getByRole("button", { name: "SAVE" });
  const saveButtonVisible = await saveButton.isVisible().catch(() => false);
  console.log(`Save button: ${saveButtonVisible ? "✅ Visible" : "❌ Hidden"}`);

  if (saveButtonVisible) {
    console.log("🔴 IMPORTANT: All form fields are ready!");
    console.log("💾 Clicking SAVE button...");
    await saveButton.click();

    console.log("⏳ Waiting for API response (5 seconds)...");
    await page.evaluate(() => new Promise((r) => setTimeout(r, 5000)));

    // Check if modal closed
    const stillVisible = await modal.isVisible().catch(() => false);
    console.log(`\nModal after save: ${stillVisible ? "❌ Still Open" : "✅ Closed"}`);

    // Check for success message
    const successMsg = page
      .locator("text=/success|completed|saved/i")
      .first();
    const hasSuccess = await successMsg.isVisible().catch(() => false);
    console.log(`Success message: ${hasSuccess ? "✅ Visible" : "❌ Not found"}`);

    if (hasSuccess) {
      const msgText = await successMsg.textContent();
      console.log(`Message: "${msgText}"`);
    }

    // Check for error message
    const errorMsg = page.locator("[role='alert'], .error").first();
    const hasError = await errorMsg.isVisible().catch(() => false);
    if (hasError) {
      const errText = await errorMsg.textContent();
      console.log(`❌ ERROR: "${errText}"`);
    }

    console.log(`\n📡 Network requests made: ${requests.length}`);
    requests.forEach((r) => {
      console.log(`  ${r.method} ${r.url.substring(r.url.lastIndexOf("/"))}`);
    });
  }

  console.log("\n📸 Taking screenshot...");
  await page.screenshot({ path: `debug-final-${Date.now()}.png` });

  console.log("\n📌 === DEBUG TEST COMPLETE ===\n");
});
