import { getBrowser } from "./browser.js";
import { typeLargePrompt } from "./chunkPrompt.js";
import fs from "fs";
import { safeClosePage } from "./safeClosePage.js";
export async function generateTopicsPlaywright(
    prompt,
    pdfPath,
    accountId = 1
) {

    const browser = await getBrowser(accountId);

    let context = browser.contexts()[0];

if (!context) {
    throw new Error(
        "No browser context found. Restart debug browser for this account."
    );
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

    await page.waitForSelector(
        'div[contenteditable="true"]'
    );

    console.log("Input Found");

    await page.getByRole("button", {
    name: /Upload (&|and) tools/i
}).click();

const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("menuitem", {
        name: "Upload files"
    }).click()
]);

await fileChooser.setFiles(pdfPath);

await page.waitForTimeout(15000);

console.log("PDF Uploaded");

const input = page.locator('[data-test-id="textarea-wrapper"]').getByRole('paragraph')
await input.click();
await input.focus();

const jsonSafetyInstruction = `

IMPORTANT JSON VALIDITY RULES:

Return ONLY one valid JSON object.

The response MUST be directly parseable using JavaScript JSON.parse().

Inside JSON string values:
- Every double quote character must be escaped as \\"
- Never place an unescaped double quote inside a string value.
- Preserve quotation marks from the textbook content by escaping them correctly.
- Escape backslashes correctly.
- Use \\n for line breaks inside string values.
- Do not use Markdown code fences.
- Do not add explanations before or after the JSON object.

Before submitting the final answer, verify that the complete response is valid JSON.

Example of correct JSON:

{
  "content": "This explains the \\"distributive property\\" of multiplication."
}

Example of WRONG JSON:

{
  "content": "This explains the "distributive property" of multiplication."
}
`;

const finalPrompt = `${prompt}\n\n${jsonSafetyInstruction}`;

await typeLargePrompt(page, finalPrompt);

await page.waitForTimeout(1000);

console.log("Prompt length:", finalPrompt.length);
console.log(finalPrompt.substring(0, 300));

console.log("Searching Send Button...");

const sendButton = page.getByRole("button", {
    name: /Send/i
});

await sendButton.waitFor({
    state: "visible",
    timeout: 30000
});

console.log("Send Button Found");

await sendButton.click();

console.log("Send Button Clicked");
console.log("Prompt Submitted");
console.log("Waiting for model-response...");

await page.waitForSelector("model-response", {
    timeout: 300000
});

console.log("model-response Found");
// Gemini ke Stop button ke gayab hone ka wait
console.log("Waiting for Stop button...");

await page.waitForFunction(() => {
    return document.querySelector('button[aria-label*="Stop"]') === null;
}, {
    timeout: 300000
});

console.log("Stop button disappeared");


let previous = "";

while (true) {

    await page.waitForTimeout(3000);

    const current = await page
        .locator("model-response .markdown")
        .last()
        .innerText();

    console.log("Current Length:", current?.length);

   if (current === previous && current && current.length > 500) {
        break;
    }

    previous = current;
}

const response = previous;
let cleanedResponse = response.trim();

// Markdown remove
cleanedResponse = cleanedResponse
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/^JSON\s*/i, "")

.replace(/[“”]/g, '"');

// Agar beginning me "JSON" likha ho to hata do
cleanedResponse = cleanedResponse.replace(/^JSON\s*/i, "");

console.log("Response Ends with :");
console.log(cleanedResponse.slice(-200));
console.log("Final Length:", cleanedResponse.length);
// console.log("Gemini Response:", cleanedResponse);

fs.writeFileSync(
    "rawGemini.txt",
    cleanedResponse,
    "utf8"
);
await safeClosePage(page);
return cleanedResponse;}