import { chromium } from "@playwright/test";
import { login } from "./helpers/auth";
import fs from "fs";
import path from "path";

const AUTH_DIR = path.join(__dirname, ".auth");
const AUTH_FILE = path.join(AUTH_DIR, "user.json");

async function globalSetup() {
  console.log("🔐 Global Setup: Authenticating once for all tests...");

  // ✅ Ensure auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    console.log("📁 Auth directory created");
  }

  // 🧹 Delete old auth state
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE);
    console.log("🗑️ Old auth state deleted");
  }

  const browser = await chromium.launch({ headless: false }); // 👈 set true in CI
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ✅ Perform login
    await login(page);

    // ✅ Wait for stability after login
    await page.waitForLoadState("networkidle");

    // 💾 Save auth state
    console.log("➡️ Saving auth state...");
    await context.storageState({ path: AUTH_FILE });

    console.log("✅ Authentication complete. Auth state saved.");
    console.log("📍 Saved at:", AUTH_FILE);
  } catch (error) {
    console.error("❌ Global setup failed:", error);

    // 📸 Capture screenshot for debugging
    await page.screenshot({ path: "global-setup-error.png", fullPage: true });
    throw error; // important: fail the setup
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
