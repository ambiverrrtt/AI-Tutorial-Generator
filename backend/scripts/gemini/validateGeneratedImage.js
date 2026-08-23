

import fs from "fs";
import path from "path";
import { getBrowser } from "../playwright/browser.js";
import { safeClosePage } from "../playwright/safeClosePage.js";

/**
 * Validate a generated educational image against
 * the CURRENT scene only.
 *
 * Important:
 * - Do NOT compare only with previous image.
 * - Current scene is the source of truth.
 * - Previous scenes are only context.
 *
 * PASS:
 *   Image correctly represents current Display Text
 *   and current Image Prompt.
 *
 * FAIL:
 *   Wrong equation
 *   Wrong number
 *   Wrong factor
 *   Missing Display Text
 *   Narration incorrectly rendered
 *   Extra unrelated concept
 *   Wrong diagram structure
 */

export async function validateGeneratedImage(
    imagePath,
    scene,
    narrationJson,
    accountId = 1
) {

    console.log("================================");
    console.log(
        `Validating Image: Scene ${scene.scene}`
    );
    console.log("================================");

    if (!fs.existsSync(imagePath)) {
        throw new Error(
            `IMAGE_NOT_FOUND_FOR_VALIDATION: ${imagePath}`
        );
    }

    const browser = await getBrowser(accountId);

    let context = browser.contexts()[0];

    if (!context) {

        const contexts = browser.contexts();

        if (!contexts.length) {
            throw new Error(
                "No browser context found for image validation."
            );
        }

        context = contexts[0];
    }

    const page = await context.newPage();

    try {

        await page.goto(
            "https://gemini.google.com/app",
            {
                waitUntil: "domcontentloaded",
                timeout: 120000
            }
        );

        console.log(
            "Gemini opened for image validation."
        );

        await page.waitForTimeout(3000);

        // ==========================================
        // NEW CHAT
        // ==========================================

        try {

            const newChat = page.getByRole(
                "button",
                {
                    name: /new chat/i
                }
            );

            if (await newChat.count()) {

                await newChat.first().click();

                await page.waitForTimeout(2000);
            }

        }
        catch {

            console.log(
                "New Chat button not found. Continuing..."
            );

        }

        // ==========================================
        // INPUT
        // ==========================================

        await page.waitForSelector(
            'div[contenteditable="true"]',
            {
                timeout: 30000
            }
        );

        const input = page
            .locator('div[contenteditable="true"]')
            .first();

        await input.click();

        // ==========================================
        // CURRENT SCENE DATA
        // ==========================================

        const currentDisplayText =
            String(scene.displayText || "")
                .trim();

        const currentNarration =
            String(scene.narration || "")
                .trim();

        const currentImagePrompt =
            String(scene.imagePrompt || "")
                .trim();

        const currentHeading =
            String(scene.heading || "")
                .trim();

        const subject =
            String(
                narrationJson.subject || ""
            ).trim();

            // ==========================================
// CURRENT VISUAL FACTS
// ==========================================

const currentVisualFacts =
    Array.isArray(scene.visualFacts)
        ? scene.visualFacts
        : [];

console.log(
    "Current Visual Facts:",
    currentVisualFacts
);

// ==========================================
// CURRENT MUST SHOW / MUST NOT SHOW
// ==========================================

const currentMustShow =
    Array.isArray(scene.mustShow)
        ? scene.mustShow
        : [];

const currentMustNotShow =
    Array.isArray(scene.mustNotShow)
        ? scene.mustNotShow
        : [];

console.log(
    "Current Must Show:",
    currentMustShow
);

console.log(
    "Current Must Not Show:",
    currentMustNotShow
);

        // ==========================================
        // PREVIOUS / NEXT CONTEXT
        // ==========================================

        const sceneNumber =
            Number(scene.scene);

        const allScenes =
            Array.isArray(narrationJson.scenes)
                ? narrationJson.scenes
                : [];

        const previousScene =
            allScenes.find(
                s =>
                    Number(s.scene) ===
                    sceneNumber - 1
            );

        const nextScene =
            allScenes.find(
                s =>
                    Number(s.scene) ===
                    sceneNumber + 1
            );

        // ==========================================
        // PREVIOUS CONTEXT
        // ==========================================

        const previousContext =
            previousScene
                ? `
PREVIOUS SCENE CONTEXT ONLY:

Scene: ${previousScene.scene}

Display Text:
${previousScene.displayText}

Image Prompt:
${previousScene.imagePrompt}

IMPORTANT:

This is ONLY for continuity.

Do NOT use the previous scene's equation,
number, factor, object, answer, or concept
unless the CURRENT scene explicitly requires it.
`
                : "";

        // ==========================================
        // NEXT CONTEXT
        // ==========================================

        const nextContext =
            nextScene
                ? `
NEXT SCENE CONTEXT ONLY:

Scene: ${nextScene.scene}

Display Text:
${nextScene.displayText}

IMPORTANT:

Do NOT use information from the next scene
to validate the current image.
`
                : "";

        // ==========================================
        // VALIDATION PROMPT
        // ==========================================

        const validationPrompt = `

You are an expert educational image validator.

Your ONLY job is to validate the CURRENT generated
image against the CURRENT SCENE.

This image belongs to:

Subject:
${subject}

Current Scene:
${sceneNumber}

Current Heading:
${currentHeading}

CURRENT DISPLAY TEXT:
${currentDisplayText}

CURRENT NARRATION:
${currentNarration}

CURRENT IMAGE PROMPT:
${currentImagePrompt}

CURRENT VISUAL FACTS:
${
    currentVisualFacts.length > 0
        ? currentVisualFacts
            .map((fact, index) => `${index + 1}. ${fact}`)
            .join("\n")
        : "No additional Visual Facts provided."
}

IMPORTANT:

Visual Facts are the exact factual information
that the CURRENT image must represent.

The CURRENT Visual Facts belong ONLY to this scene.

Do NOT use Visual Facts from previous or next scenes.

Do NOT assume that a mathematically correct alternative
is acceptable.

If Visual Facts contain an exact number, equation,
factorisation, fraction, symbol, quantity, or relationship,
the image must represent that exact information.

Do NOT accept a different example.

Do NOT accept a mathematically equivalent replacement
when the source contains a specific example.

Do NOT invent additional facts.

==========================================
MUST SHOW — REQUIRED VISUAL ELEMENTS
==========================================

The generated image MUST contain ALL of the
following required visual elements:

${
    currentMustShow.length > 0
        ? currentMustShow
            .map(
                (item, index) =>
                    `${index + 1}. ${item}`
            )
            .join("\n")
        : "No required visual elements provided."
}

IMPORTANT:

Every mustShow element is required.

If even one important mustShow element is
missing, return FAIL.

Do NOT consider the image correct merely
because it looks visually similar.

The required elements must be represented
in the CURRENT image.

==========================================
MUST NOT SHOW — FORBIDDEN VISUAL ELEMENTS
==========================================

The generated image MUST NOT contain any
of the following forbidden visual elements:

${
    currentMustNotShow.length > 0
        ? currentMustNotShow
            .map(
                (item, index) =>
                    `${index + 1}. ${item}`
            )
            .join("\n")
        : "No specific forbidden visual elements."
}

IMPORTANT:

If a forbidden mustNotShow element appears
in the image and it conflicts with the current
educational concept, return FAIL.

Do NOT reject normal decorative elements unless
they actually violate a mustNotShow requirement.

==========================================
MUST SHOW / MUST NOT SHOW PRIORITY
==========================================

The CURRENT scene is the source of truth.

mustShow requirements MUST be present.

mustNotShow requirements MUST be absent.

Do not use information from previous or next
scenes to satisfy these requirements.

${previousContext}

${nextContext}

==========================================
MOST IMPORTANT RULE
==========================================

The CURRENT SCENE is the source of truth.

Do NOT validate the image by simply comparing it
with the previous image.

Do NOT assume that the current image must contain
the same number, equation, factor, object, example,
or answer as the previous scene.

Every scene must be validated independently.

Example:

Scene 1 Display Text:
18 = 2 × 3 × 3

Scene 2 Display Text:
12 = 2 × 2 × 3

If Scene 2 image correctly shows:

12 = 2 × 2 × 3

then Scene 2 = PASS.

It must NOT be rejected merely because Scene 1
contained 18 = 2 × 3 × 3.

But if Scene 2 incorrectly shows:

18 = 2 × 3 × 3

then Scene 2 = FAIL.

==========================================
DISPLAY TEXT RULE
==========================================

The image MUST contain the exact CURRENT
Display Text as visible educational text.

Current Display Text:

"${currentDisplayText}"

Check:

1. Is the Display Text visibly present?
2. Is it exactly the same?
3. Is it spelled correctly?
4. Are mathematical symbols preserved?
5. Are numbers preserved?
6. Are equations preserved?
7. Are powers, roots, fractions and symbols
   preserved when present?

Do NOT accept:

"Display Text: ${currentDisplayText}"

Do NOT accept:

"${currentNarration}"

Do NOT accept a rewritten version.

Do NOT accept a shortened version.

Do NOT accept a paraphrased version.

The actual Display Text must appear directly,
without a metadata label.

==========================================
NARRATION RULE
==========================================

Narration is NOT image text.

The image must NOT use narration as a subtitle,
caption or replacement for Display Text.

The narration may be different from Display Text.

That is allowed.

Only the CURRENT Display Text is required
as visible scene text.

==========================================
IMAGE PROMPT RULE
==========================================

The image must correctly represent the
CURRENT Image Prompt.

It must explain ONE tiny learning idea.

Do NOT allow:

- unrelated concepts
- unrelated examples
- wrong equations
- wrong numbers
- wrong factors
- wrong labels
- wrong quantities
- wrong diagram structure
- extra mathematical examples
- extra scientific facts
- future scene information

==========================================
MATHEMATICS RULE
==========================================

For Mathematics, accuracy is extremely important.

If the current scene contains:

equation
number
factor
prime factorisation
fraction
power
root
angle
grid
shape
quantity
calculation

verify the exact current value.

Never accept a mathematically different value
just because it is visually similar.

Example:

Required:
84 = 2 × 2 × 3 × 7

Image:
84 = 2 × 2 × 3 × 7

PASS.

Image:
84 = 2 × 3 × 14

FAIL.

==========================================
VISUAL FACTS MATHEMATICS CHECK
==========================================

For mathematical scenes, Visual Facts have priority
for exact factual verification.

If the current Visual Facts specify:

- a number
- equation
- factor
- prime factorisation
- fraction
- power
- root
- angle
- quantity
- calculation

verify that exact information in the generated image.

A different but mathematically valid example is still FAIL
if it does not match the CURRENT Visual Facts.

Example:

Visual Fact:
84 = 2 × 2 × 3 × 7

Image:
84 = 2 × 2 × 3 × 7
→ PASS

Image:
72 = 2 × 2 × 2 × 3
→ FAIL

Even though the second equation is mathematically correct,
it does not represent the CURRENT scene.

==========================================
SCIENCE RULE
==========================================

For Science:

Verify that the image represents the exact
scientific concept supplied by the CURRENT scene.

Do not accept an image that introduces
unsupported scientific facts or objects.

==========================================
CONTINUITY RULE
==========================================

Visual continuity is allowed.

For example:

Scene 1 may introduce an object.

Scene 2 may show the object changing.

Scene 3 may show the result.

However, continuity must NOT override the
CURRENT scene's actual content.

The current scene must always win.

==========================================
FINAL DECISION
==========================================

Return PASS only when:

✓ Current Display Text is visible
✓ Display Text is exact
✓ No Narration is rendered as text
✓ No metadata labels are visible
✓ Image matches current Image Prompt
✓ Image matches current learning concept
✓ Numbers are correct
✓ Equations are correct
✓ Mathematical structures are correct
✓ Scientific content is correct

✓ Current Visual Facts are correctly represented
✓ Exact numbers from Visual Facts are correct
✓ Exact equations from Visual Facts are correct
✓ Exact factors and mathematical relationships
  from Visual Facts are correct
✓ No Visual Fact from another scene is used
✓ No new factual example is invented

✓ Every required mustShow element is present
✓ No conflicting mustNotShow element is present
✓ mustShow requirements match the CURRENT scene
✓ mustNotShow requirements are respected

✓ No unrelated concepts are present

Otherwise return FAIL.

==========================================
OUTPUT
==========================================

Return ONLY valid JSON.

Use exactly:

{
    "result": "PASS",
    "reason": "Short reason"
}

OR:

{
    "result": "FAIL",
    "reason": "Short reason"
}

Do not return Markdown.
Do not return explanations outside JSON.
`;

        // ==========================================
        // TYPE PROMPT
        // ==========================================

        await input.fill(validationPrompt);

               // ==========================================
        // ATTACH IMAGE
        // ==========================================

        console.log(
            "Attaching generated image..."
        );

        const ATTACH_TIMEOUT = 180000; // 3 minutes
        const PROCESS_TIMEOUT = 180000; // 3 minutes
        const SEND_TIMEOUT = 180000;    // 3 minutes

        // ------------------------------------------
        // HELPER:
        // Wait for file input to actually appear
        // ------------------------------------------

        async function getFileInputWithRetry() {

            console.log(
                "Waiting for Gemini file input..."
            );

            const startTime = Date.now();

            while (
                Date.now() - startTime <
                ATTACH_TIMEOUT
            ) {

                const input =
                    page.locator(
                        'input[type="file"]'
                    ).first();

                const count =
                    await input.count();

                if (count > 0) {

                    console.log(
                        "File input found."
                    );

                    return input;
                }

                await page.waitForTimeout(2000);
            }

            throw new Error(
                "GEMINI_FILE_INPUT_TIMEOUT"
            );
        }


        // ------------------------------------------
        // 1. Check whether file input already exists
        // ------------------------------------------

        let fileInput =
            page.locator(
                'input[type="file"]'
            ).first();

        let fileInputCount =
            await fileInput.count();

        console.log(
            "Initial File Input Count:",
            fileInputCount
        );


        // ------------------------------------------
        // 2. If not available, find Attach button
        // ------------------------------------------

        if (fileInputCount === 0) {

            console.log(
                "File input not available directly."
            );

            console.log(
                "Waiting for Gemini attachment button..."
            );

            console.log("=== GEMINI BUTTON DEBUG ===");

const buttons = page.locator("button");
const count = await buttons.count();

console.log("Total buttons:", count);

for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);

    if (!(await btn.isVisible().catch(() => false))) {
        continue;
    }

    console.log(`BUTTON ${i}`, {
        aria: await btn.getAttribute("aria-label").catch(() => null),
        title: await btn.getAttribute("title").catch(() => null),
        text: await btn.innerText().catch(() => "")
    });
}

console.log("=== END BUTTON DEBUG ===");

           // ------------------------------------------
// FIND GEMINI ATTACHMENT BUTTON DYNAMICALLY
// ------------------------------------------

console.log(
    "Searching for Gemini attachment button..."
);

let attachButton = null;

// Known Gemini selectors
const attachmentSelectors = [
    'button[aria-label="Upload and tools"]',
    'button[aria-label*="Attach" i]',
    'button[aria-label*="Upload" i]',
    'button[aria-label*="Add" i]',
    'button[aria-label*="attachment" i]',
    'button[aria-label*="file" i]',
    'button[aria-label*="photo" i]',
    'button[aria-label*="image" i]',
    'button[title*="Attach" i]',
    'button[title*="Upload" i]',
    'button[title*="Add" i]'
];

const attachStartTime = Date.now();

while (
    !attachButton &&
    Date.now() - attachStartTime < ATTACH_TIMEOUT
) {

    // --------------------------------------
    // 1. Try known selectors
    // --------------------------------------

    for (
        const selector of attachmentSelectors
    ) {

        try {

            const candidate =
                page.locator(selector).first();

            const count =
                await candidate.count();

            if (!count) {
                continue;
            }

            const visible =
                await candidate
                    .isVisible()
                    .catch(() => false);

            if (!visible) {
                continue;
            }

            const enabled =
                await candidate
                    .isEnabled()
                    .catch(() => false);

            if (!enabled) {
                continue;
            }

            attachButton = candidate;

            console.log(
                "Attachment selector matched:",
                selector
            );

            break;

        }
        catch {
            // Try next selector
        }
    }


    // --------------------------------------
    // 2. If no known selector matched,
    //    inspect visible buttons
    // --------------------------------------

    if (!attachButton) {

        const buttons =
            page.locator("button");

        const count =
            await buttons.count();

        for (
            let i = 0;
            i < count;
            i++
        ) {

            try {

                const button =
                    buttons.nth(i);

                if (
                    !(await button
                        .isVisible()
                        .catch(() => false))
                ) {
                    continue;
                }

                if (
                    !(await button
                        .isEnabled()
                        .catch(() => false))
                ) {
                    continue;
                }

                const aria =
                    (
                        await button
                            .getAttribute("aria-label")
                            .catch(() => "")
                    ) || "";

                const title =
                    (
                        await button
                            .getAttribute("title")
                            .catch(() => "")
                    ) || "";

                const text =
                    (
                        await button
                            .innerText()
                            .catch(() => "")
                    ) || "";

                const value =
                    `${aria} ${title} ${text}`
                        .toLowerCase();

                // Attachment-related words
                const isAttachmentButton =
                    value.includes("upload") ||
                    value.includes("attach") ||
                    value.includes("add file") ||
                    value.includes("add files") ||
                    value.includes("attachment") ||
                    value.includes("photo") ||
                    value.includes("image") ||
                    value.includes("file");

                if (!isAttachmentButton) {
                    continue;
                }

                attachButton = button;

                console.log(
                    "Dynamic attachment button found:",
                    {
                        index: i,
                        aria,
                        title,
                        text
                    }
                );

                break;

            }
            catch {
                // Ignore this button
            }
        }
    }


    // --------------------------------------
    // 3. If still not found, wait and retry
    // --------------------------------------

    if (!attachButton) {

        console.log(
            "Attachment button not ready yet. Retrying..."
        );

        await page.waitForTimeout(2000);
    }
}


// ------------------------------------------
// FINAL ATTACHMENT BUTTON CHECK
// ------------------------------------------

if (!attachButton) {

    console.log(
        "Gemini attachment button was not found."
    );

    console.log(
        "Current URL:",
        page.url()
    );

    throw new Error(
        "GEMINI_ATTACHMENT_BUTTON_TIMEOUT"
    );
}

console.log(
    "Attach button found successfully."
);


// --------------------------------------
// Click Attach
// --------------------------------------

await attachButton.click({
    force: true,
    timeout: 30000
});

console.log(
    "Gemini attachment menu opened."
);

            // --------------------------------------
            // Wait for file input
            // --------------------------------------

            fileInput =
                await getFileInputWithRetry();

            console.log(
                "File Input After Attach:",
                await fileInput.count()
            );
        }


        // ==========================================
        // SET IMAGE FILE
        // ==========================================

        console.log(
            "Setting image file..."
        );

        let imageAttached = false;

        for (
            let attempt = 1;
            attempt <= 3;
            attempt++
        ) {

            try {

                console.log(
                    `Image attach attempt ${attempt}/3`
                );

                // Re-locate every attempt
                // because Gemini can replace the input
                fileInput =
                    page.locator(
                        'input[type="file"]'
                    ).first();

                await fileInput.waitFor({
                    state: "attached",
                    timeout: 30000
                });

                await fileInput.setInputFiles(
                    imagePath,
                    {
                        timeout: 60000
                    }
                );

                imageAttached = true;

                console.log(
                    "Image file selected successfully."
                );

                break;

            }
            catch (err) {

                console.log(
                    `Image attach attempt ${attempt} failed:`,
                    err.message
                );

                if (attempt < 3) {

                    await page.waitForTimeout(
                        5000
                    );
                }
            }
        }


        if (!imageAttached) {

            throw new Error(
                "GEMINI_IMAGE_ATTACH_FAILED"
            );
        }


        console.log(
            "Image Attached Successfully."
        );


        // ==========================================
        // WAIT FOR GEMINI IMAGE PROCESSING
        // ==========================================

        console.log(
            "Waiting for Gemini to process image attachment..."
        );

        console.log(
            "Gemini may show loading spinner here..."
        );


        // ==========================================
        // RESPONSE COUNT BEFORE SUBMIT
        // ==========================================

        const oldResponseCount =
            await page
                .locator("model-response")
                .count();

        console.log(
            "Old Response Count:",
            oldResponseCount
        );


        // ==========================================
        // WAIT FOR SEND BUTTON TO APPEAR
        // ==========================================

        console.log(
            "Waiting for Gemini Send button to appear..."
        );

        const sendButton =
            page.locator(
                'button[aria-label="Send message"]'
            ).last();


        await sendButton.waitFor({
            state: "visible",
            timeout: PROCESS_TIMEOUT
        });

        console.log(
            "Send Button Found."
        );


        // ==========================================
        // WAIT FOR SEND BUTTON TO BECOME ENABLED
        // ==========================================

        console.log(
            "Waiting for Gemini image processing to finish..."
        );

        console.log(
            "Send button may remain disabled while image loads."
        );


        const sendStartTime =
            Date.now();

        let sendReady = false;


        while (
            Date.now() - sendStartTime <
            SEND_TIMEOUT
        ) {

            try {

                const currentSendButton =
                    page.locator(
                        'button[aria-label="Send message"]'
                    ).last();


                const visible =
                    await currentSendButton
                        .isVisible()
                        .catch(() => false);


                const disabled =
                    await currentSendButton
                        .isDisabled()
                        .catch(() => true);


                const enabled =
                    await currentSendButton
                        .isEnabled()
                        .catch(() => false);


                console.log(
                    "Send Status:",
                    {
                        visible,
                        disabled,
                        enabled
                    }
                );


                if (
                    visible &&
                    enabled &&
                    !disabled
                ) {

                    sendReady = true;

                    console.log(
                        "Gemini Send button is ENABLED."
                    );

                    break;
                }

            }
            catch (err) {

                console.log(
                    "Send button check failed:",
                    err.message
                );
            }


            // Check every 3 seconds
            await page.waitForTimeout(3000);
        }


        // ==========================================
        // SEND BUTTON NEVER BECAME READY
        // ==========================================

        if (!sendReady) {

            console.log(
                "Send button did not become enabled within timeout."
            );

            console.log(
                "Current page URL:",
                page.url()
            );

            throw new Error(
                "GEMINI_SEND_BUTTON_TIMEOUT"
            );
        }


        // ==========================================
        // ACTUAL SEND
        // ==========================================

        console.log(
            "================================"
        );

        console.log(
            "Clicking Gemini Send button..."
        );

        console.log(
            "================================"
        );


        // Re-locate button one final time
        const finalSendButton =
            page.locator(
                'button[aria-label="Send message"]'
            ).last();


        await finalSendButton.waitFor({
            state: "visible",
            timeout: 30000
        });


        // Make absolutely sure it is enabled
        await page.waitForFunction(
            () => {

                const buttons =
                    Array.from(
                        document.querySelectorAll(
                            'button[aria-label="Send message"]'
                        )
                    );

                const button =
                    buttons[buttons.length - 1];

                if (!button) {
                    return false;
                }

                return (
                    !button.disabled &&
                    !button.hasAttribute(
                        "disabled"
                    )
                );

            },
            null,
            {
                timeout: 30000
            }
        );


        console.log(
            "Final Send Button State:",
            {
                visible:
                    await finalSendButton
                        .isVisible()
                        .catch(() => false),

                enabled:
                    await finalSendButton
                        .isEnabled()
                        .catch(() => false),

                disabled:
                    await finalSendButton
                        .isDisabled()
                        .catch(() => true)
            }
        );


        await finalSendButton.click({
            timeout: 30000
        });


        console.log(
            "Image validation submitted successfully."
        );


        // ==========================================
        // WAIT FOR NEW RESPONSE
        // ==========================================

        await page.waitForFunction(
            oldCount =>
                document.querySelectorAll(
                    "model-response"
                ).length > oldCount,
            oldResponseCount,
            {
                timeout: 300000
            }
        );

        console.log(
            "New validation response detected."
        );

        console.log(
            "Waiting for validation response..."
        );

        await page.waitForTimeout(4000);

        // ==========================================
        // READ RESPONSE
        // ==========================================

        let previous = "";
        let stableCount = 0;

        const startTime = Date.now();

        while (true) {

            if (
                Date.now() - startTime >
                300000
            ) {

                throw new Error(
                    "IMAGE_VALIDATION_TIMEOUT"
                );

            }

            await page.waitForTimeout(2000);

            const responses =
                page.locator(
                    "model-response"
                );

            const responseBlock =
                responses.nth(
                    oldResponseCount
                );

            let current = "";

            const markdown =
                responseBlock
                    .locator(".markdown")
                    .last();

            if (
                await markdown.count()
            ) {

                current =
                    await markdown.innerText();

            }
            else {

                current =
                    await responseBlock.innerText();

            }

            current =
                current.trim();

            if (!current) {
                continue;
            }

            console.log(
                "Validation Response:",
                current
            );

            const hasJson =
                current.includes("{") &&
                current.includes("}");

            if (
                current === previous &&
                hasJson
            ) {

                stableCount++;

            }
            else {

                stableCount = 0;

            }

            if (
                stableCount >= 2
            ) {

                previous = current;

                break;

            }

            previous = current;

        }

        // ==========================================
        // PARSE JSON
        // ==========================================

        const start =
            previous.indexOf("{");

        const end =
            previous.lastIndexOf("}");

        if (
            start === -1 ||
            end === -1
        ) {

            throw new Error(
                "IMAGE_VALIDATION_JSON_NOT_FOUND"
            );

        }

        const jsonText =
            previous
                .substring(
                    start,
                    end + 1
                )
                .trim()
                .replace(
                    /```json/gi,
                    ""
                )
                .replace(
                    /```/g,
                    ""
                );

        let validation;

        try {

            validation =
                JSON.parse(
                    jsonText
                );

        }
        catch (err) {

            console.log(
                "Invalid validator response:"
            );

            console.log(
                previous
            );

            throw new Error(
                "IMAGE_VALIDATION_INVALID_JSON"
            );

        }

        // ==========================================
        // FINAL CHECK
        // ==========================================

        if (
            validation.result !== "PASS" &&
            validation.result !== "FAIL"
        ) {

            throw new Error(
                "IMAGE_VALIDATION_UNKNOWN_RESULT"
            );

        }

        console.log(
            `Scene ${sceneNumber} Image Validation:`,
            validation.result
        );

        console.log(
            "Validation Reason:",
            validation.reason
        );

        // ==========================================
        // FAIL → DELETE IMAGE
        // ==========================================

        if (
            validation.result === "FAIL"
        ) {

            console.log(
                `❌ Scene ${sceneNumber} image rejected.`
            );

            console.log(
                "Reason:",
                validation.reason
            );

            if (
                fs.existsSync(
                    imagePath
                )
            ) {

                await fs.promises.unlink(
                    imagePath
                );

                console.log(
                    "Invalid image deleted."
                );

            }

            return {
                valid: false,
                result: "FAIL",
                reason:
                    validation.reason
            };

        }

        // ==========================================
        // PASS
        // ==========================================

        console.log(
            `✅ Scene ${sceneNumber} image passed validation.`
        );

        return {
            valid: true,
            result: "PASS",
            reason:
                validation.reason
        };

    }
    finally {

        await safeClosePage(
            page
        );

    }

}