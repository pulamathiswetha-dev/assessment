import { readFileSync } from "fs";
import { resolve } from "path";

export function getCaseIdFromFile(): string {
  try {
    const filePath = resolve(__dirname, "../../caseId.txt");
    const content = readFileSync(filePath, "utf-8");
    return content.trim();
  } catch (error) {
    throw new Error(`Failed to read caseId from file: ${error}`);
  }
}
