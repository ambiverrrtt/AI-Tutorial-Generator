import fs from "fs";
import path from "path";
import crypto from "crypto";

async function getImageHash(filePath) {

    const buffer = await fs.promises.readFile(filePath);

    return crypto
        .createHash("md5")
        .update(buffer)
        .digest("hex");

}

const generatedHashes = new Set();

export async function downloadImage(
    page,
    outputFolder,
    fileName,
    imageGenerationStartTime
) {

    console.log("Waiting for generated image...");

    // =============================================
// CAPTURE EXISTING IMAGES BEFORE GENERATION
// =============================================

const previousImageSources = await page.locator("img").evaluateAll(
    (imgs) => {

        return imgs
            .map(img =>
                img.currentSrc ||
                img.src ||
                img.getAttribute("src") ||
                ""
            )
            .filter(Boolean);

    }
);

console.log(
    "Previous Image Count:",
    previousImageSources.length
);

// console.log(
//     "Previous Image Sources:",
//     previousImageSources.slice(-5)
// );

// Wait for a NEW image OR the last image src to change

const errorPhrases = [
    "sorry, something went wrong",
    "please try your request again",
    "i encountered an error",
    "could you try again",
    "i seem to be encountering an error",
    "can i try something else",
    "i'm having a hard time fulfilling your request",
    "unable to create",
    "can't create",
    "couldn't create"
];

let waitResult;

try {

    waitResult = await page.waitForFunction(
   ({ previousSources, errorPhrases }) => {

            const responses =
                document.querySelectorAll("model-response");

            let responseText = "";

            if (responses.length > 0) {

                const latestResponse =
                    responses[responses.length - 1];

                responseText =
                    latestResponse.innerText || "";

                const normalizedText =
                    responseText.toLowerCase();

                const hasError =
                    errorPhrases.some(
                        phrase => normalizedText.includes(phrase)
                    );

                if (hasError) {

                    return {
                        status: "GEMINI_ERROR",
                        responseCount: responses.length,
                        responseText: responseText.slice(-1000)
                    };

                }

            }


// ==========================================
// FIND ONLY NEW GENERATED GEMINI IMAGE
// ==========================================

const imgs =
    Array.from(
        document.querySelectorAll("img")
    );

const validImages = imgs
    .map((img, index) => {

        const rect =
            img.getBoundingClientRect();

        const src =
            img.currentSrc ||
            img.src ||
            img.getAttribute("src") ||
            "";

        return {
            index,
            src,
            width: rect.width,
            height: rect.height,

            area:
                rect.width *
                rect.height,

            visible:
                rect.width > 0 &&
                rect.height > 0 &&
                rect.bottom > 0 &&
                rect.right > 0
        };

    })
    .filter(img =>

        img.visible &&

        img.src &&

        // Ignore small icons, avatar,
        // microphone etc.
        img.width >= 300 &&

        img.height >= 180 &&

        img.area >= 100000

    )
    .sort(
        (a, b) =>
            b.area - a.area
    );


// ==========================================
// ONLY ACCEPT IMAGE THAT WAS NOT PRESENT
// BEFORE PROMPT WAS SENT
// ==========================================

const newImage =
    validImages.find(
        img =>
            !previousSources.includes(
                img.src
            )
    );
if (newImage) {

    return {

        status:
            "IMAGE_READY",

        responseCount:
            responses.length,

        imageCount:
            validImages.length,

        latestSrc:
            newImage.src,

        width:
            newImage.width,

        height:
            newImage.height

    };

}
// ==========================================
// OLD IMAGE ONLY
// KEEP WAITING
// ==========================================

console.log(
    "No NEW generated image yet. Continuing to wait..."
);

return false;

        },

      {
    previousSources: previousImageSources,
    errorPhrases
},

        {
            timeout: 300000
        }
    );

}
catch (err) {

    console.log("=================================");
    console.log("IMAGE GENERATION WAIT TIMEOUT");
    console.log("=================================");

    console.log(
        "Error:",
        err.message
    );

    // Capture Gemini page state
    try {

        const debugState = await page.evaluate(() => {

            const responses =
                document.querySelectorAll("model-response");

           const images =
    document.querySelectorAll("img");

            const visibleImages =
                Array.from(images).filter(
                    img => {

                        const rect =
                            img.getBoundingClientRect();

                        return (
                            rect.width > 0 &&
                            rect.height > 0
                        );

                    }
                );

            const latestResponse =
                responses.length > 0
                    ? responses[responses.length - 1]
                    : null;

            return {

                responseCount:
                    responses.length,

                latestResponseText:
                    latestResponse?.innerText || "",

                totalBlobImages:
                    images.length,

                visibleBlobImages:
                    visibleImages.length,

                imageSources:
                    Array.from(images)
                        .slice(-5)
                        .map(img => img.src)
                        .filter(Boolean)
                        .map(src => src.slice(0, 150))

            };

        });

        console.log(
            "Gemini Debug State:"
        );

        console.log(
            JSON.stringify(
                debugState,
                null,
                2
            )
        );

    }
    catch (debugError) {

        console.log(
            "Could not capture Gemini debug state:",
            debugError.message
        );

    }

    throw err;
}

const waitStatus = await waitResult.jsonValue();

if (waitStatus?.status === "IMAGE_READY") {

    const imageGenerationEndTime = Date.now();

    const imageGenerationTime =
        (imageGenerationEndTime - imageGenerationStartTime) / 1000;

    console.log(
        `GEMINI IMAGE GENERATION TIME: ${imageGenerationTime.toFixed(2)} seconds`
    );
     console.log(
        "IMAGE READY DETECTED AT:",
        new Date(imageGenerationEndTime).toISOString()
    );

}

console.log(
    "================================="
);

console.log(
    "IMAGE GENERATION WAIT RESULT"
);

console.log(
    "Status:",
    waitStatus?.status
);

console.log(
    "Response Count:",
    waitStatus?.responseCount
);

console.log(
    "Image Count:",
    waitStatus?.imageCount
);

if (waitStatus?.responseText) {

    console.log(
        "Latest Gemini Response:"
    );

    console.log(
        waitStatus.responseText
    );
}

console.log(
    "Latest Image Src:",
    waitStatus?.latestSrc
);

console.log(
    "================================="
);

if (waitStatus?.status === "GEMINI_ERROR") {

    console.log(
        "Gemini image generation failed. Throwing error for retry..."
    );

    throw new Error(
        "GEMINI_IMAGE_GENERATION_FAILED"
    );
}

if (waitStatus?.status !== "IMAGE_READY") {

    throw new Error(
        "IMAGE_NOT_READY"
    );
}

let imageOpened = false;

for (let attempt = 1; attempt <= 3; attempt++) {

    try {

        console.log(`Image Click Attempt ${attempt}`);

    // ============================================
// FIND GENERATED IMAGE
// ============================================

// DO NOT use:
// page.locator("img:visible").last();
//
// Gemini page par bahut saare img elements hote hain.
// Last visible img microphone/avatar/icon bhi ho sakta hai.
//
// Isliye large visible image ko identify karenge.

const imageInfo = await page.locator("img").evaluateAll(
    (imgs) => {

        return imgs
            .map((img, index) => {

                const rect =
                    img.getBoundingClientRect();

                const src =
                    img.currentSrc ||
                    img.src ||
                    img.getAttribute("src") ||
                    "";

                return {
                    index,
                    src,
                    width: rect.width,
                    height: rect.height,
                    area:
                        rect.width *
                        rect.height,

                    visible:
                        rect.width > 0 &&
                        rect.height > 0 &&
                        rect.bottom > 0 &&
                        rect.right > 0
                };

            })

            // Small icons, microphone, avatar etc. remove
            .filter(img =>
                img.visible &&
                img.width >= 300 &&
                img.height >= 180 &&
                img.area >= 100000
            )

            // Sabse badi image ko first rakho
            .sort(
                (a, b) =>
                    b.area - a.area
            )[0] || null;
    }
);

// console.log(
//     "Selected Generated Image:",
//     imageInfo
// );

if (!imageInfo) {

    throw new Error(
        "No large generated image found for clicking."
    );

}


// ============================================
// LOCATE SELECTED IMAGE AGAIN
// ============================================

const image =
    page.locator("img").nth(
        imageInfo.index
    );

await image.waitFor({
    state: "visible",
    timeout: 30000
});

await image.scrollIntoViewIfNeeded();

console.log(
    "Trying to click generated image..."
);


// ============================================
// NORMAL CLICK
// ============================================

try {

    await image.click({
        timeout: 10000
    });

    console.log(
        "Generated Image Clicked"
    );

} catch (clickError) {

    console.log(
        "Normal image click failed."
    );

    console.log(
        "Trying force click..."
    );


    // ========================================
    // FORCE CLICK
    // ========================================

    await image.click({
        force: true,
        timeout: 10000
    });

    console.log(
        "Generated Image Force Clicked"
    );
}

console.log("Step 1");

await page.waitForTimeout(2000);
console.log("Step 2");

const dialog = page.locator('[role="dialog"]');

console.log("Step 3");

console.log("Dialog Count:", await dialog.count());

console.log("Step 4");

// const downloadBtn = dialog.locator(
//     'button[aria-label="Download full-sized image"]'
// );
const downloadBtn = dialog.locator(
    'button[aria-label*="Download"]'
);

console.log("Step 5");

console.log(
    "Download Count:",
    await downloadBtn.count()

);

console.log("Step 6");

imageOpened = true;

break;

    }

    catch (err) {

    console.log("Image Click Failed");
    console.log(err);

    await page.screenshot({
        path: `click_failed_${attempt}.png`,
        fullPage: true
    });

    await page.waitForTimeout(3000);

}

}

if (!imageOpened) {

    throw new Error(
        "Unable to open generated image."
    );

}


    // Wait for Lightbox
  const dialog = page.locator('[role="dialog"]');

  await dialog.waitFor({
    state: "visible",
    timeout: 30000
  });

  console.log("Lightbox Opened");

    // Download button
//    const downloadButton = dialog
//     .locator('button[aria-label="Download full-sized image"]')
//     .last();

const downloadButton = dialog.getByRole("button", {
    name: /download/i
}).last();

await downloadButton.waitFor({
    state: "visible"
});

  const lightboxImage = page.locator(
    "img.generated-image"
).last();

await lightboxImage.waitFor({
    state: "visible",
    timeout: 30000
});

await page.waitForTimeout(2000);

    const imageFolder = outputFolder;

    await fs.promises.mkdir(imageFolder, {
        recursive: true
    });

    let download;
for (let attempt = 1; attempt <= 3; attempt++) {

    try {

        console.log(`Download Attempt ${attempt}`);

console.log("Clicking Download Button...");

 [download] = await Promise.all([
    page.waitForEvent("download", {
        timeout: 30000
    }),
    downloadButton.click({
        force: true
    })
]);

console.log("Download Started");

console.log("Current URL:", page.url());

console.log(
    "Open Pages:",
    page.context().pages().length
);

await page.waitForTimeout(5000);

        break;

    }

    catch(err) {

        console.log("Download Failed");

        console.log("Error:", err.message);

        await page.waitForTimeout(3000);

    }

}

if (!download) {

    throw new Error("Unable to download image.");

}

    await page.waitForTimeout(2000);

    console.log(
        "Suggested Filename:",
        await download.suggestedFilename()
    );

    // Final image path
    const destination = path.join(
        imageFolder,
        fileName
    );

   // Save image
await download.saveAs(destination);
console.log(
    "Suggested Filename:",
    await download.suggestedFilename()
);
const currentNumber = Number(
    fileName.replace(".png", "")
);

if (currentNumber > 1) {

    const previousImage = path.join(
        imageFolder,
        `${currentNumber - 1}.png`
    );

    if (fs.existsSync(previousImage)) {

        const previousHash =
            await getImageHash(previousImage);

        const currentHash =
            await getImageHash(destination);

        if (previousHash === currentHash) {

            console.log("Duplicate Image Found");

            await fs.promises.unlink(destination);

            throw new Error("DUPLICATE_IMAGE");

        }

    }

}

const currentHash = await getImageHash(destination);

if (generatedHashes.has(currentHash)) {

    console.log("Duplicate Image Found Anywhere");

    await fs.promises.unlink(destination);

    throw new Error("DUPLICATE_IMAGE");

}

generatedHashes.add(currentHash);

const stats = await fs.promises.stat(destination);

console.log(
    `Image Size: ${(stats.size / 1024).toFixed(2)} KB`
);

console.log("Image Saved:", destination);

// ================================
// Close Lightbox
// ================================

try {

    console.log("Closing Lightbox...");

    // 1. Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);

    // 2. Close Button (X)
    const closeButton = page.locator(
        'button[aria-label="Close"], button:has(svg)'
    ).first();

    if (await closeButton.isVisible().catch(() => false)) {

        console.log("Clicking Close Button");

        await closeButton.click({
            force: true
        });

        await page.waitForTimeout(1000);

    }

    // 3. Back Button
    const backButton = page.locator(
        'button:has(mat-icon[data-mat-icon-name="arrow_back"])'
    ).first();

    if (await backButton.isVisible().catch(() => false)) {

        console.log("Clicking Back Button");

        await backButton.click({
            force: true
        });

        await page.waitForTimeout(1000);

    }

    // 4. Backdrop
    const backdrop = page.locator(
        ".image-expansion-dialog-backdrop"
    );

    if (await backdrop.count()) {

        console.log("Clicking Backdrop");

        await backdrop.first().click({
            force: true
        }).catch(()=>{});

    }

    await page.waitForTimeout(2000);

}
catch {

    console.log("Lightbox close skipped.");

}

// Wait until prompt box becomes usable again

const input = page.locator('div[contenteditable="true"]').first();

await input.waitFor({
    state: "visible",
    timeout: 60000
});

await page.waitForTimeout(1500);

console.log("Ready For Next Prompt");

return destination;
}