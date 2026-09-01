

import fs from "fs";
import path from "path";
import { getBrowser } from "../playwright/browser.js";
import { safeClosePage } from "../playwright/safeClosePage.js";
import { jsonrepair } from "jsonrepair";
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


// ==========================================
// DEEP SUBJECT-AWARE VISUAL INSPECTION
// ==========================================

DEEP VISUAL INSPECTION IS REQUIRED.

Do NOT perform a superficial visual similarity check.

Before returning PASS or FAIL, inspect the generated image
carefully and independently.

Use the CURRENT subject, CURRENT scene, CURRENT Display Text,
CURRENT Image Prompt, CURRENT Visual Facts, CURRENT mustShow,
and CURRENT mustNotShow together.

The subject context must guide the validation.

Do not blindly trust:
- visible labels
- displayed numbers
- written answers
- captions
- arrows
- visual appearance
- apparent similarity to the prompt

A value written in the image is NOT proof that the visual
structure is correct.

==========================================
SUBJECT-AWARE REASONING
==========================================

Use your own subject knowledge to verify whether the image
is actually correct for the current educational concept.

For Mathematics:
- independently verify geometry
- independently verify calculations
- independently verify equations
- independently verify number relationships
- independently verify angles
- independently verify shapes
- independently verify measurements
- independently verify directions
- independently verify diagram structure
- verify that visual markings actually represent the
  mathematical value written in the image

For Science:
- independently verify scientific relationships
- verify direction of processes
- verify cause-and-effect relationships
- verify required scientific structures
- verify labels and their corresponding structures
- verify that objects are scientifically plausible
- reject scientifically misleading diagrams

For Physics:
- verify direction of forces
- verify ray direction
- verify motion direction
- verify circuit connections
- verify measurements
- verify physical relationships

For Chemistry:
- verify chemical symbols
- verify formulas
- verify atom/molecule relationships
- verify reaction structure
- verify that labels correspond to the correct particles
  or structures

For other subjects:
- use the subject context and educational meaning to
  independently check whether the visual representation
  actually teaches the supplied concept.

==========================================
MICRO-DETAIL INSPECTION
==========================================

Inspect even small details that can change the meaning
of the educational diagram.

Check:

- every number
- every symbol
- every label
- every arrow
- every line
- every ray
- every endpoint
- every vertex
- every intersection
- every measurement
- every scale
- every tick mark when relevant
- every direction
- every relative position
- every required object
- every required relationship
- every important proportion
- every mathematical alignment
- every scientific relationship

Do not ignore a small error merely because the overall
image looks correct.

If a small visual error changes the educational meaning,
return FAIL.

==========================================
GEOMETRIC TRUTH RULE
==========================================

For mathematical diagrams, NEVER assume that a displayed
number proves that the geometry is correct.

Whenever the scene contains geometry, inspect the actual
visual geometry.

For angles:

1. Identify the exact vertex.
2. Identify both rays forming the angle.
3. Determine the direction of each ray.
4. Determine the actual geometric angle between the rays.
5. Compare the actual geometric angle with the required
   angle from the CURRENT scene.
6. Verify that the angle arc corresponds to those same
   two rays.
7. Verify that the displayed angle value matches the
   actual geometry.
8. Verify that any measuring instrument, such as a
   protractor, is correctly positioned.
9. Verify that the protractor center is aligned with
   the vertex.
10. Verify that the starting ray is aligned with the
    correct 0-degree baseline.
11. Verify that the second ray points to the correct
    degree mark.
12. Verify that the correct protractor scale is being used.

CRITICAL:

If the image says 42° but the actual rays form 45°,
return FAIL.

If the image says 116° but the actual rays form 120°,
return FAIL.

If the displayed value is correct but the ray is not
aligned with the corresponding degree mark, return FAIL.

If the protractor is visually present but its center is
not aligned with the angle vertex, return FAIL.

If the correct number is written but the geometry is wrong,
return FAIL.

TEXTUAL CORRECTNESS ALONE IS NEVER SUFFICIENT.

==========================================
FINAL STRICT PRINCIPLE
==========================================

PASS means:

"The image is visually and educationally correct,
not merely that it contains the expected words or numbers."

If there is any meaningful mismatch between the intended
concept and the actual visual representation, return FAIL.

When uncertain about a mathematically, scientifically,
or educationally important detail, inspect it again before
returning PASS.

Be strict.

Be detail-oriented.

Use subject knowledge.

Check the smallest meaningful visual detail.

Do not give PASS simply because the image looks good.

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
✓ Actual geometry matches the required geometry
✓ Actual angle matches the required angle
✓ Rays are aligned correctly
✓ Vertex is correctly positioned
✓ Protractor center is aligned with the vertex
✓ Correct 0-degree baseline is used
✓ Correct protractor scale is used
✓ Ray reaches the required degree mark
✓ Written mathematical values agree with the actual diagram
✓ Scientific content is correct
✓ Scientific relationships are visually correct
✓ Directions and processes are correct
✓ Labels point to the correct structures
✓ No scientifically misleading visual detail

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

IMPORTANT:

Return ONLY valid JSON.

The "reason" value MUST be a valid JSON string.

If you mention any quotation marks inside "reason",
escape them with backslash.

Example:

{
  "result": "PASS",
  "reason": "The image correctly displays the required text \"An electric lamp contains a filament that glows\"."
}

Do NOT return unescaped quotation marks inside JSON string values.
`;
// ==========================================
// GEMINI ATTACHMENT HELPER
// ==========================================

async function findAttachmentButton() {

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

    const startTime = Date.now();

    while (
        Date.now() - startTime < ATTACH_TIMEOUT
    ) {

        // First try known selectors
        for (const selector of attachmentSelectors) {

            try {

                const candidate =
                    page.locator(selector).last();

                if (
                    await candidate.count() &&
                    await candidate.isVisible().catch(() => false) &&
                    await candidate.isEnabled().catch(() => false)
                ) {

                    console.log(
                        "Attachment button found:",
                        selector
                    );

                    return candidate;
                }

            } catch {
                // Try next selector
            }
        }

        // Fallback: inspect visible buttons
        const buttons = page.locator("button");
        const count = await buttons.count();

        for (let i = 0; i < count; i++) {

            try {

                const button = buttons.nth(i);

                if (
                    !(await button.isVisible().catch(() => false)) ||
                    !(await button.isEnabled().catch(() => false))
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

                if (
                    value.includes("upload") ||
                    value.includes("attach") ||
                    value.includes("attachment") ||
                    value.includes("photo") ||
                    value.includes("image") ||
                    value.includes("file")
                ) {

                    console.log(
                        "Dynamic attachment button found:",
                        {
                            index: i,
                            aria,
                            title,
                            text
                        }
                    );

                    return button;
                }

            } catch {
                // Ignore and continue
            }
        }

        await page.waitForTimeout(2000);
    }

    throw new Error(
        "GEMINI_ATTACHMENT_BUTTON_TIMEOUT"
    );
}
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
// VALIDATION RETRY CONFIGURATION
// ==========================================

const MAX_VALIDATION_RETRIES = 3;
let validationRetryCount = 0;

        // ==========================================
        // READ RESPONSE
        // ==========================================

        let previous = "";
let stableCount = 0;

let startTime = Date.now();

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

const responseCount =
    await responses.count();

if (responseCount === 0) {
    continue;
}

const responseBlock =
    responses.last();

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

            // ==========================================
// GEMINI VALIDATION ERROR DETECTION + RETRY
// ==========================================
const validationErrorPhrases = [
    "something went wrong",
    "sorry, something went wrong",
    "something went wrong while",
    "please try your request again",
    "please try again",
    "try again",
    "i encountered an error",
    "i seem to be encountering an error",
    "i ran into an error",
    "i ran into an issue",
    "i encountered an issue",
    "there was an error",
    "there seems to be an error",
    "can i try something else",
    "could you try again",
    "i'm having a hard time fulfilling",
    "im having a hard time fulfilling",
    "unable to generate",
    "unable to process",
    "unable to complete",
    "couldn't generate",
    "couldn't process",
    "couldn't complete",
    "can't generate",
    "can't process",
    "cannot generate",
    "cannot process"
];

const normalizedValidationResponse =
    current
        .trim()
        .toLowerCase();

const validationErrorDetected =
    validationErrorPhrases.some(
        phrase =>
            normalizedValidationResponse.includes(phrase)
    );

if (validationErrorDetected) {

    console.log("=================================");
    console.log("GEMINI VALIDATION ERROR DETECTED");
    console.log("=================================");
    console.log(current);
    console.log("=================================");

    if (
        validationRetryCount >=
        MAX_VALIDATION_RETRIES
    ) {

        console.log(
            "Maximum validation retries reached."
        );

        throw new Error(
            "GEMINI_VALIDATION_FAILED_AFTER_RETRIES"
        );
    }

    validationRetryCount++;

    console.log(
        `Retrying SAME IMAGE VALIDATION... Attempt ${validationRetryCount}/${MAX_VALIDATION_RETRIES}`
    );

// Wait before retry
await page.waitForTimeout(5000);

// Clear current Gemini input
await input.click();

await page.keyboard.down("Control");
await page.keyboard.press("KeyA");
await page.keyboard.up("Control");

await page.keyboard.press("Backspace");

// Re-enter SAME validation prompt
await input.fill(validationPrompt);

console.log(
    "Same validation prompt entered again."
);

// Re-attach SAME IMAGE
console.log(
    "Re-attaching same image for validation retry..."
);

// ==========================================
// FIND FILE INPUT FOR RETRY
// ==========================================

let retryFileInput =
    page.locator(
        'input[type="file"]'
    ).first();

let retryFileInputCount =
    await retryFileInput.count();

if (retryFileInputCount === 0) {

    console.log(
        "File input not available."
    );

    console.log(
        "Opening Gemini attachment menu for retry..."
    );

    const retryAttachButton =
        await findAttachmentButton();

    await retryAttachButton.click({
        force: true,
        timeout: 30000
    });

    console.log(
        "Retry attachment menu opened."
    );

    retryFileInput =
        await getFileInputWithRetry();

} else {

    console.log(
        "Existing file input found for retry."
    );
}

// ==========================================
// ATTACH SAME IMAGE WITH RETRY
// ==========================================

let retryImageAttached = false;

for (
    let attempt = 1;
    attempt <= 3;
    attempt++
) {

    try {

        console.log(
            `Retry image attach attempt ${attempt}/3`
        );

        retryFileInput =
            page.locator(
                'input[type="file"]'
            ).first();

        await retryFileInput.waitFor({
            state: "attached",
            timeout: 30000
        });

        await retryFileInput.setInputFiles(
            imagePath,
            {
                timeout: 60000
            }
        );

        retryImageAttached = true;

        console.log(
            "Same image re-attached successfully."
        );

        break;

    } catch (err) {

        console.log(
            `Retry image attach attempt ${attempt} failed:`,
            err.message
        );

        if (attempt < 3) {

            await page.waitForTimeout(5000);

            // Try to find file input again
            retryFileInput =
                page.locator(
                    'input[type="file"]'
                ).first();

        }
    }
}

if (!retryImageAttached) {

    throw new Error(
        "GEMINI_VALIDATION_RETRY_IMAGE_ATTACH_FAILED"
    );
}

console.log(
    "Same image re-attached successfully."
);

// Wait for Send button
const retrySendButton =
    page.locator(
        'button[aria-label="Send message"]'
    ).last();

await retrySendButton.waitFor({
    state: "visible",
    timeout: 60000
});

// Wait until enabled
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

        return (
            button &&
            !button.disabled &&
            !button.hasAttribute("disabled")
        );
    },
    null,
    {
        timeout: 60000
    }
);

console.log(
    "Retry Send button is enabled."
);

// Current response count
const retryOldResponseCount =
    await page
        .locator("model-response")
        .count();

console.log(
    "Retry Old Response Count:",
    retryOldResponseCount
);

// Send SAME validation again
await retrySendButton.click({
    timeout: 30000
});

console.log(
    `Validation retry ${validationRetryCount} submitted successfully.`
);

// Wait for NEW response
await page.waitForFunction(
    oldCount =>
        document.querySelectorAll(
            "model-response"
        ).length > oldCount,
    retryOldResponseCount,
    {
        timeout: 300000
    }
);

console.log(
    "New retry validation response detected."
);

// Reset response reading state
previous = "";
stableCount = 0;
startTime = Date.now();

continue;

}

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
    validation = JSON.parse(jsonText);

    console.log(
        "✅ Validator JSON parsed successfully."
    );

} catch (err) {

    console.log(
        "❌ Invalid validator JSON:"
    );

    console.log(previous);

    console.log(
        "JSON Parse Error:",
        err.message
    );

    // ==========================================
    // TRY JSON REPAIR
    // ==========================================

    try {

        const repairedJson =
            jsonrepair(jsonText);

        validation =
            JSON.parse(repairedJson);

        console.log(
            "✅ Validator JSON repaired successfully."
        );

    } catch (repairError) {

        console.log(
            "❌ Validator JSON repair failed:"
        );

        console.log(
            repairError.message
        );

        // ==========================================
        // FALLBACK: EXTRACT RESULT + REASON
        // ==========================================

        const resultMatch =
            jsonText.match(
                /"result"\s*:\s*"(PASS|FAIL)"/i
            );

        const reasonMatch =
            jsonText.match(
                /"reason"\s*:\s*"([\s\S]*)"\s*}\s*$/
            );

        if (resultMatch) {

            const result =
                resultMatch[1].toUpperCase();

            let reason =
                reasonMatch
                    ? reasonMatch[1]
                    : "Validation completed.";

            validation = {
                result,
                reason
            };

            console.log(
                "✅ Validator response recovered using fallback."
            );

        } else {

            throw new Error(
                "IMAGE_VALIDATION_INVALID_JSON"
            );
        }
    }
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