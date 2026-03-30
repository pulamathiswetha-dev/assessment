import { Page } from "@playwright/test";

/**
 * Opens the task completion modal by finding and clicking the task menu
 * Returns false and skips if task is not found
 */
export async function openTaskCompletionModal(
  page: Page,
  taskName: string
): Promise<boolean> {
  console.log(`Looking for ${taskName} task...`);
  const task = page.locator(`text=${taskName}`).first();

  const taskExists = await task
    .waitFor({ state: "visible", timeout: 15000 })
    .then(() => true)
    .catch(() => false);

  if (!taskExists) {
    console.log(`⚠ ${taskName} task not found - skipping this task`);
    return false;
  }

  console.log(`✓ ${taskName} task found`);

  try {
    // Find and click the menu button
    const menuButton = task.locator(
      "xpath=ancestor::div[contains(@class, 'card-inner-layout')]/div[contains(@class, 'dot-action')]"
    );
    await menuButton.waitFor({ state: "visible", timeout: 10000 });
    await menuButton.click();

    // Wait for context menu to appear
    await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

    // Click Complete option
    const completeOption = page.locator("text=/Complete/i").first().locator("..");
    await completeOption.waitFor({ state: "visible", timeout: 10000 });

    try {
      await completeOption.click({ timeout: 5000 });
    } catch (e) {
      await completeOption.click({ force: true });
    }

    // Wait for modal to appear
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

    const modalHeading = page.getByRole("heading", { name: "Task Complete" });
    const modalVisible = await modalHeading
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!modalVisible) {
      console.log(`⚠ Task Complete modal did not appear for ${taskName} - skipping`);
      return false;
    }

    console.log(`✓ Task Complete modal opened for ${taskName}`);
    return true;
  } catch (error) {
    console.log(`⚠ Error opening modal for ${taskName}: ${error.message} - skipping`);
    return false;
  }
}

/**
 * Fills the task completion form with duration and notes
 */
export async function fillTaskCompletionForm(
  page: Page,
  notes: string,
  durationHours: string = "01",
  durationMinutes: string = "01"
): Promise<void> {
  try {
    // Fill Duration(Hr)
    console.log("📋 Filling Duration(Hr)...");
    const durationHrDropdown = page.getByRole("combobox", {
      name: "Duration(Hr)",
    });
    await durationHrDropdown.waitFor({ state: "visible", timeout: 5000 });
    await durationHrDropdown.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    const hourOpt = page.getByRole("option", { name: durationHours }).first();
    await hourOpt.waitFor({ state: "visible", timeout: 5000 });
    await hourOpt.click();
    console.log(`✓ Duration(Hr) filled with ${durationHours}`);

    // Fill Duration(Min)
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    console.log("📋 Filling Duration(Min)...");
    const durationMinDropdown = page.getByRole("combobox", {
      name: "Duration(Min)",
    });
    await durationMinDropdown.waitFor({ state: "visible", timeout: 5000 });
    await durationMinDropdown.click();
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    const minOpt = page.getByRole("option", { name: durationMinutes });
    await minOpt.waitFor({ state: "visible", timeout: 5000 });
    await minOpt.click();
    console.log(`✓ Duration(Min) filled with ${durationMinutes}`);

    // Fill Notes
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    console.log("📋 Filling Notes field...");
    let notesEditor = page.locator("[contenteditable='true']").first();
    const editorFound = await notesEditor.isVisible().catch(() => false);

    if (!editorFound) {
      console.log("⚠️  Contenteditable not found, trying textarea...");
      notesEditor = page.locator("textarea").first();
    }

    await notesEditor.waitFor({ state: "visible", timeout: 5000 });
    await notesEditor.click();
    await notesEditor.fill(notes);
    console.log("✓ Notes field filled");
  } catch (error) {
    console.error(`❌ Error filling form: ${error.message}`);
    throw error;
  }
}

/**
 * Submits the task completion form and verifies modal closes
 * Skips gracefully if form elements not found
 */
export async function submitTaskCompletionForm(page: Page): Promise<boolean> {
  try {
    const modalHeading = page.getByRole("heading", { name: "Task Complete" });

    const saveButton = page.getByRole("button", { name: "SAVE" });
    const saveButtonExists = await saveButton
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!saveButtonExists) {
      console.log("⚠ Save button not found - skipping submission");
      return false;
    }

    console.log("💾 Clicking Save button...");

    // Check for validation errors before saving
    const validationErrors = page.locator("[role='alert'], .error, .validation-error").first();
    const hasErrors = await validationErrors.isVisible().catch(() => false);
    if (hasErrors) {
      const errorText = await validationErrors.textContent().catch(() => "Unknown error");
      console.log(`⚠️  Validation error detected: ${errorText}`);
    }

    await saveButton.click();

    // Wait longer for backend processing and UI update
    console.log("⏳ Waiting for form submission and page refresh (5 seconds)...");
    await page.evaluate(() => new Promise((r) => setTimeout(r, 5000)));

    // Additional wait for network activity
    try {
      await page.waitForLoadState("networkidle", { timeout: 5000 });
      console.log("✓ Network idle detected");
    } catch {
      console.log("⚠️  Network idle timeout - page may still be updating");
    }

    // Check for success message
    const successMessage = page.locator("text=/success|completed|saved/i").first();
    const hasSuccessMsg = await successMessage.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasSuccessMsg) {
      const msgText = await successMessage.textContent().catch(() => "");
      console.log(`✅ Success message: ${msgText}`);
    }

    // Check modal visibility
    const isClosed = await modalHeading
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!isClosed) {
      console.log("✓ Task Complete modal closed successfully");

      // Double-check page URL or content changed
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);

      return true;
    } else {
      console.log("⚠️  Task Complete modal still visible after save");

      // Try clicking save again
      console.log("🔄 Retrying save button click...");
      try {
        await saveButton.click({ force: true });
        await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));
        const isClosedRetry = await modalHeading.isVisible({ timeout: 3000 }).catch(() => false);
        if (!isClosedRetry) {
          console.log("✓ Modal closed after retry");
          return true;
        }
      } catch (e) {
        console.log(`⚠️  Retry failed: ${e.message}`);
      }

      return false;
    }
  } catch (error) {
    console.error(`❌ Error submitting form: ${error.message}`);
    return false;
  }
}

/**
 * Verifies that a task was removed from the list (completion verification)
 * Checks specifically in the task container area
 */
export async function verifyTaskRemoved(
  page: Page,
  taskName: string,
  maxWaitTime: number = 15000
): Promise<boolean> {
  try {
    const startTime = Date.now();

    console.log(`⏳ Verifying ${taskName} is removed from task list (up to ${maxWaitTime / 1000}s)...`);

    // Look for the task card in the main content area (more specific)
    // This checks the actual task card container, not just any text on page
    const taskContainer = page.locator("main, [role='main'], .task-list, .tasks").first();

    // Poll for task removal with longer timeout
    while (Date.now() - startTime < maxWaitTime) {
      // Get all task cards/items
      const allTaskCards = await taskContainer
        .locator("div[class*='card'], div[class*='task'], [role='article']")
        .allTextContents()
        .catch(() => []);

      const taskFound = allTaskCards.some((cardText) =>
        cardText.includes(taskName)
      );

      if (!taskFound) {
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `✓ ${taskName} removed from task list after ${elapsedTime}s - completion verified`
        );
        return true;
      }

      // Log remaining tasks
      const remainingCount = allTaskCards.length;
      console.log(
        `⏳ Task still in list... (${remainingCount} tasks visible, checking again...)`
      );

      // Wait before next check
      await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));
    }

    console.log(
      `❌ ${taskName} STILL VISIBLE after ${maxWaitTime / 1000}s - task not actually removed!`
    );

    // Show what tasks are currently visible
    const currentTasks = await taskContainer
      .locator("div[class*='card'], div[class*='task']")
      .allTextContents()
      .catch(() => []);

    if (currentTasks.length > 0) {
      console.log("📋 Currently visible tasks:");
      currentTasks.forEach((task, idx) => {
        const taskText = task.split("\n")[0].substring(0, 50);
        console.log(`  ${idx + 1}. ${taskText}`);
      });
    }

    return false;
  } catch (error) {
    console.log(`⚠ Error verifying task removal: ${error.message}`);
    return false;
  }
}

/**
 * Wait for the next task to appear after completing one
 */
export async function waitForNextTask(
  page: Page,
  maxWaitTime: number = 10000
): Promise<boolean> {
  try {
    console.log(`⏳ Waiting for next task to appear...`);

    const taskContainer = page.locator("main, [role='main'], .task-list, .tasks").first();

    const startTime = Date.now();

    // Wait for task cards to update
    while (Date.now() - startTime < maxWaitTime) {
      const taskCards = await taskContainer
        .locator("div[class*='card'], div[class*='task'], [role='article']")
        .count()
        .catch(() => 0);

      if (taskCards > 0) {
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✓ Next task loaded after ${elapsedTime}s (${taskCards} task(s) visible)`);
        return true;
      }

      await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    }

    console.log(`⚠️  No new task appeared within ${maxWaitTime / 1000}s`);
    return false;
  } catch (error) {
    console.log(`⚠ Error waiting for next task: ${error.message}`);
    return false;
  }
}

/**
 * Complete task end-to-end: open modal, fill form, submit, verify completion
 * Waits longer for UI update after backend processing
 */
export async function completeTask(
  page: Page,
  taskName: string,
  notes: string,
  durationHours: string = "01",
  durationMinutes: string = "01"
): Promise<boolean> {
  try {
    const modalOpened = await openTaskCompletionModal(page, taskName);

    if (!modalOpened) {
      console.log(`⏭️  Skipping ${taskName} - task not found or modal didn't open`);
      return false;
    }

    await fillTaskCompletionForm(page, notes, durationHours, durationMinutes);
    const submitted = await submitTaskCompletionForm(page);

    if (!submitted) {
      console.log(`⏭️  Skipping ${taskName} - form submission failed`);
      return false;
    }

    // Verify task is actually removed from the list
    const removed = await verifyTaskRemoved(page, taskName, 15000);

    if (removed) {
      console.log(`✅ ${taskName} completed successfully - task removed from UI`);

      // Wait for next task to appear
      await waitForNextTask(page, 10000);

      return true;
    } else {
      console.log(`❌ ${taskName} NOT removed from UI - completion verification failed`);
      return false;
    }
  } catch (error) {
    console.log(`⏭️  Error completing ${taskName}: ${error.message}`);
    return false;
  }
}
