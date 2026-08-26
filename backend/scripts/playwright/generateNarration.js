import { getBrowser } from "./browser.js";
import { typeLargePrompt } from "./chunkPrompt.js";
import { safeClosePage } from "./safeClosePage.js";
export async function generateNarrationPlaywright(
    prompt,
    accountId = 1
) {
    const browser = await getBrowser(accountId);

    let context = browser.contexts()[0];

if (!context) {
    const contexts = browser.contexts();

    if (!contexts.length) {
        throw new Error(
            "Chrome debug browser is connected but no context exists. Restart startBrowsers.js and login Gemini again."
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

// Start a completely new Gemini chat
try {

    const newChat = page.getByRole("button", {
        name: /new chat/i
    });
    console.log(
    "New Chat Count:",
    await newChat.count()
);

    if (await newChat.count()) {
        await newChat.first().click();
        await page.waitForTimeout(3000);
        console.log("Started New Chat");
    }

} catch (e) {

    console.log("New Chat button not found");

}

    await page.waitForSelector(
        'div[contenteditable="true"]',
        {
            timeout: 30000
        }
    );
    console.log("Input Box Found");

const input = page.getByRole("textbox");

    await input.click();

await page.keyboard.down("Control");
await page.keyboard.press("KeyA");
await page.keyboard.up("Control");

await page.keyboard.press("Backspace");

await input.focus();

await page.waitForTimeout(500);

    await typeLargePrompt(page, prompt);

    const typedText = await input.textContent();

console.log("========== PROMPT TYPED ==========");
console.log(typedText.length);
console.log(typedText);
console.log("==================================");

    const oldResponseCount =
    await page.locator("model-response").count();

    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

const text = await input.textContent();

console.log("Textbox after Enter:", text);

console.log("Prompt Submitted");

// Response start hone ka wait
await page.waitForFunction(
    oldCount => {

        return document
            .querySelectorAll("model-response")
            .length > oldCount;

    },
    oldResponseCount,
    {
        timeout: 300000
    }
);

console.log("Waiting for Gemini response to stabilize...");

await page.waitForTimeout(5000);

let previous = "";
let stableCount = 0;
const startTime = Date.now();

while (true) {
    if (Date.now() - startTime > 300000) {
        throw new Error("Gemini response timeout.");
    }

    await page.waitForTimeout(3000);

    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });

    const responses = page.locator("model-response");

    const responseBlock = responses.nth(oldResponseCount);

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

    const geminiErrorPhrases = [
    "something went wrong",
    "sorry, something went wrong",
    "please try your request again",
    "i seem to be encountering an error",
    "can i try something else",
    "i'm having a hard time fulfilling this request",
    "unable to generate",
    "couldn't generate",
    "can't generate"
];

const normalizedCurrent =
    current.toLowerCase();

const geminiErrorDetected =
    geminiErrorPhrases.some(
        phrase => normalizedCurrent.includes(phrase)
    );

if (geminiErrorDetected) {

    console.log("=================================");
    console.log("GEMINI UI ERROR DETECTED");
    console.log("=================================");
    console.log(current);
    console.log("=================================");

    throw new Error(
        "GEMINI_REQUEST_FAILED"
    );
}

  const hasJson =
    current.includes("{") &&
    current.includes("}");

const hasExpectedJson =
    current.includes('"steps"') ||
    current.includes('"scenes"') ||
    current.includes('"narration"') ||
    current.includes('"mainIdea"') ||
    current.includes('"mainIdeas"');
if (
    current === previous &&
    hasJson &&
    hasExpectedJson
) {
    stableCount++;
} else {
    stableCount = 0;
}

    if (stableCount >= 3) {
        previous = current;
        break;
    }

    previous = current;
}

const response = previous;

console.log("Response Ends with :");
console.log(response.slice(-200));

console.log("Final Length:", response.length);
console.log("Gemini Response:", response);
const cleaned = response
    .replace(/\r/g, "")
    .replace(/\u2028/g, "")
    .replace(/\u2029/g, "");
await safeClosePage(page);
return cleaned;

}