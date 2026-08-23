import fs from "fs";
import path from "path";
import { getBrowser } from "../playwright/browser.js";
import { generateImage } from "../playwright/generateImage.js";
import { safeClosePage } from "../playwright/safeClosePage.js";
export async function generateImages(
    narrationJson,
    accountId = 1
) {
   console.log(
    `Generating Images : ${narrationJson.title} | Account ${accountId}`
);
    const cleanTitle = narrationJson.title
 .replace(/^\d+(\.\d+)*(\([A-Z]\))?\s*/, ""); 
 
const safeTitle = cleanTitle
    .replace(/⁰/g, "0")
    .replace(/¹/g, "1")
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .replace(/⁴/g, "4")
    .replace(/⁵/g, "5")
    .replace(/⁶/g, "6")
    .replace(/⁷/g, "7")
    .replace(/⁸/g, "8")
    .replace(/⁹/g, "9")
    .replace(/ⁿ/g, "n")
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi");

const folderName = (
    narrationJson.sectionNumber
        ? `${narrationJson.sectionNumber}-${safeTitle}`
        : safeTitle
)
    // Remove Windows-invalid filename characters
    .replace(/[\\/:*?"<>|]/g, "")

    // Remove newline, carriage return and tab
    .replace(/[\r\n\t]/g, " ")

    // Convert multiple spaces into one
    .replace(/\s+/g, " ")

    // Remove trailing dots/spaces
    .replace(/[. ]+$/g, "")

    .trim();

const safeChapterName = String(narrationJson.chapterName || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
    
        console.log("className:", narrationJson.className);
console.log("subject:", narrationJson.subject);
console.log("section:", narrationJson.sectionNumber);
console.log("title:", narrationJson.title);

  const outputFolder = path.join(
    "generated",
    "images",
    narrationJson.className,
    narrationJson.subject,
    safeChapterName,
    folderName
);

    await fs.promises.mkdir(outputFolder, {
        recursive: true
    });

    // --------------------------
    // Open Gemini ONLY ONCE
    // --------------------------

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
    await page.goto("https://gemini.google.com/app");

    console.log("Gemini Opened Once");

    await page.waitForTimeout(3000);

    // --------------------------
    // Image Counter
    // --------------------------

    let imageCount = 0;

    // --------------------------
    // Generate all scenes
    // --------------------------

    for (const scene of narrationJson.scenes) {

        // Open a new Gemini chat after every 6 images
        if (imageCount > 0 && imageCount % 6 === 0) {

            console.log("Opening New Chat...");

// --------------------------
// 1. Try normal New Chat button
// --------------------------

let newChatButton = page.locator(
    '[data-test-id="new-chat-button"]'
).first();

// --------------------------
// 2. Agar sidebar collapsed hai,
// to sidebar open karo
// --------------------------

if (!(await newChatButton.isVisible().catch(() => false))) {

    console.log("Sidebar Closed. Opening Sidebar...");

    const menuButton = page.locator(
        'button[aria-label*="menu"], button[aria-label*="Menu"]'
    ).first();

    if (await menuButton.isVisible().catch(() => false)) {

        await menuButton.click();

        await page.waitForTimeout(1500);

    }

    // Dubara New Chat locate karo
    newChatButton = page.locator(
        '[data-test-id="new-chat-button"]'
    ).first();

}

// --------------------------
// 3. Click New Chat
// --------------------------

await newChatButton.waitFor({
    state: "visible",
    timeout: 30000
});

await newChatButton.click({
    force: true
});

console.log("New Chat Opened");

await page.waitForTimeout(4000);

        }

        console.log(
            `Generating Scene ${scene.scene}`
        );

        const fileName =
            String(scene.scene).padStart(2, "0") +
            ".png";

        const imagePath = path.join(
    outputFolder,
    fileName
);

if (fs.existsSync(imagePath)) {

    console.log(`${fileName} Already Exists`);

    imageCount++;

    continue;

}

       await generateImage(
    page,
    {
        ...scene,
        type: narrationJson.type,
        subject: narrationJson.subject
    },
    outputFolder,
    fileName,
    narrationJson,
    accountId
);

        console.log("Folder Files:",fs.readdirSync(outputFolder));

        console.log(
            `${fileName} Generated`
        );

        imageCount++;

    }
await safeClosePage(page);}