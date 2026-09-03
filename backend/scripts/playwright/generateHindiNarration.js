import { getBrowser } from "./browser.js";
import { typeLargePrompt } from "./chunkPrompt.js";
import { safeClosePage } from "./safeClosePage.js";
export async function generateHindiNarrationPlaywright(
    prompt,
    accountId = 1
) {
    const browser = await getBrowser(accountId);

    let context = browser.contexts()[0];

if (!context) {
    const contexts = browser.contexts();

    if (!contexts.length) {
        throw new Error(
            "No browser context found. Restart debug browser for this account."
        );
    }

    context = contexts[0];
}

const page = await context.newPage();

    await page.goto(
        "https://gemini.google.com/app",
        {
            waitUntil: "domcontentloaded",
            timeout: 120000
        }
    );

    console.log("Gemini Opened");

    await page.waitForTimeout(3000);

    await page.waitForSelector(
        'div[contenteditable="true"]',
        {
            timeout: 30000
        }
    );
    console.log("Input Box Found");

    const input = page.getByRole("textbox");

    await input.click();
    await input.focus();

    await typeLargePrompt(page, prompt);

    await page.keyboard.press("Enter");

console.log("Prompt Submitted");

console.log("model-response:", await page.locator("model-response").count());
console.log(".markdown:", await page.locator(".markdown").count());
console.log("model-response .markdown:", await page.locator("model-response .markdown").count());
console.log(".model-response-text:", await page.locator(".model-response-text").count());

console.log("Waiting for response...");

// Response start hone ka wait
await page.waitForSelector("model-response", {
    timeout: 300000
});

let previous = "";
let stableCount = 0;
const startTime = Date.now();

while (true) {
    if (Date.now() - startTime > 300000) {
        throw new Error("Hindi Gemini response timeout.");
    }

    await page.waitForTimeout(3000);

    const responseBlock = page
        .locator("model-response")
        .last();

    let current = "";

    const markdown = responseBlock.locator(".markdown").last();

    if (await markdown.count()) {
        current = await markdown.innerText();
    } else {
        current = await responseBlock.innerText();
    }

    current = current.trim();

    if (!current) {
        continue;
    }

    console.log("Current Length:", current.length);

    const hasJson =
        current.includes("{") &&
        current.includes("}");

    const hasExpectedJson =
        current.includes('"narrations"') ||
        current.includes('"scene"') ||
        current.includes('"text"');

    if (
        current === previous &&
        hasJson &&
        hasExpectedJson
    ) {
        stableCount++;
    } else {
        stableCount = 0;
    }

    if (stableCount >= 2) {
        previous = current;
        break;
    }

    previous = current;
}

const response = previous;

// ========================================
// GEMINI ERROR RESPONSE DETECTION
// ========================================

const geminiErrorPatterns = [
    "I encountered an error doing what you asked",
    "Could you try again?",
    "I'm having a hard time fulfilling your request",
    "Can I help you with something else instead?"
];

const isGeminiError = geminiErrorPatterns.some(
    errorText =>
        response
            .toLowerCase()
            .includes(errorText.toLowerCase())
);

if (isGeminiError) {

    console.log(
        "\n❌ Gemini returned an error response."
    );

    console.log(
        "Gemini Error Response:",
        response
    );

    await safeClosePage(page);

    throw new Error(
        `Gemini temporary error response: ${response}`
    );
}
console.log("Response Ends with :");
console.log(response.slice(-200));

console.log("Final Length:", response.length);
console.log("Gemini Response:", response);
await safeClosePage(page);
return response;
}