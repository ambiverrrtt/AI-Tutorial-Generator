import { getBrowser } from "./browser.js";
import { downloadImage } from "./downloadImage.js";
import fs from "fs";

const browser = await getBrowser();

const context = browser.contexts()[0];

const page =
    context.pages()[0] || await context.newPage();

await page.goto("https://gemini.google.com/app");

console.log("Gemini Opened");

// Wait
await page.waitForTimeout(2000);

// Prompt box
const input = page.locator('div[contenteditable="true"]').first();

await input.click();

// Type prompt
await input.fill("Generate a realistic pizza image");

// Send button
const sendButton = page.locator('button[aria-label*="Send"], button:has(svg)').last();

await sendButton.click();

console.log("Prompt Sent");

// Wait for image generation
await page.getByLabel("Download full size image").last().waitFor({
    state: "visible",
    timeout: 120000
});

// await page.pause();

// 👇 downloadImage function call karo
await downloadImage(page);

console.log("Done");

// Keep browser open for testing
await page.waitForTimeout(600000);