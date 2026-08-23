import fs from "fs";
import path from "path";
import { getBrowser } from "../playwright/browser.js";
import { generateThumbnailImage } from "../playwright/generateThumbnailImage.js";
import { safeClosePage } from "../playwright/safeClosePage.js";
export async function generateThumbnail(
    narrationJson,
    accountId = 1
) {
console.log("========== THUMBNAIL START ==========");
    console.log(
        `Generating Thumbnail : ${narrationJson.title}`
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
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
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

        const fileName = "thumbnail.png";

const imagePath = path.join(
    outputFolder,
    fileName
);

// Agar thumbnail pehle se hai to skip
if (fs.existsSync(imagePath)) {

    console.log("Thumbnail Already Exists");

    await safeClosePage(page);
    return;

}

await generateThumbnailImage(
    page,
    narrationJson,
    outputFolder,
    fileName
);

console.log("Thumbnail Generated");
await safeClosePage(page);}