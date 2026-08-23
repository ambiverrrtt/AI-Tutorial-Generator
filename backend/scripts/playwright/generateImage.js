import fs from "fs";
import path from "path";
import { downloadImage } from "./downloadImage.js";
import ImagePromptRules from "../../services/PromptBuilder/ImagePromptRules.js";
import DiagramPromptRules from "../../services/PromptBuilder/DiagramPromptRules.js";
import NormalImagePromptRules from "../../services/PromptBuilder/NormalImagePromptRules.js";
import { validateGeneratedImage } from "../gemini/validateGeneratedImage.js";

async function findSendButton(page) {

    console.log("Finding Gemini Send button...");

    const selectors = [
        'button[aria-label="Send message"]',
        'button[aria-label*="Send" i]',
        'button[title*="Send" i]',
        'button:has(svg)'
    ];

    for (const selector of selectors) {

        const buttons = page.locator(selector);

        const count = await buttons.count();

        console.log(
            `Send selector: ${selector} | Count: ${count}`
        );

        for (let i = count - 1; i >= 0; i--) {

            const button = buttons.nth(i);

            if (await button.isVisible().catch(() => false)) {

                console.log(
                    `Send button found using: ${selector}`
                );

                return button;
            }
        }
    }

    throw new Error(
        "GEMINI_SEND_BUTTON_NOT_FOUND"
    );
}

async function openNewChat(page) {

    console.log("Opening New Chat...");

    // Close image preview if it is open
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);

    const backdrop = page.locator(
        ".image-expansion-dialog-backdrop"
    );

    if (await backdrop.count() > 0) {

        try {

            await backdrop.first().click({
                force: true
            });

            await page.waitForTimeout(1000);

        } catch {}

    }

 let opened = false;

for (let attempt = 1; attempt <= 6; attempt++) {

    try {

        console.log(`New Chat Attempt ${attempt}`);

        // Sidebar open ho ya closed, dono me kaam karega
        let newChatButton = page.locator(
            '[data-test-id="new-chat-button"]'
        ).first();

        // Agar visible nahi hai to sidebar open karo
        if (!(await newChatButton.isVisible().catch(() => false))) {

            console.log("Sidebar collapsed. Opening sidebar...");

            const sidebarButton = page.locator(
                'button[aria-label*="menu"], button[aria-label*="Menu"]'
            ).first();

            if (await sidebarButton.isVisible().catch(() => false)) {

                await sidebarButton.click();

                await page.waitForTimeout(1500);

            }

            newChatButton = page.locator(
                '[data-test-id="new-chat-button"]'
            ).first();

        }

        await newChatButton.waitFor({
            state: "visible",
            timeout: 30000
        });

        await newChatButton.click({
            force: true
        });

        opened = true;

        break;

    } catch {

        await page.keyboard.press("Escape");

        await page.waitForTimeout(1000);

    }

}

if (!opened) {

    throw new Error("Unable to open New Chat.");

}

    await page.waitForTimeout(3000);

    console.log("New Chat Opened");

}

async function restartGeneration(page, finalPrompt) {

    await openNewChat(page);

    const input = page.locator(
        'div[contenteditable="true"]'
    ).first();

    await input.waitFor({
        state: "visible",
        timeout: 60000
    });

    await page.waitForTimeout(2000);

    await input.click();

    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");

    await page.keyboard.insertText(finalPrompt);

    console.log("Prompt Filled Again");

    await page.waitForTimeout(1000);

  const sendButton = await findSendButton(page);

console.log("Waiting for Gemini Send button...");

await sendButton.waitFor({
    state: "visible",
    timeout: 90000
});

console.log("Gemini Send button is visible.");

    let sent = false;

    for (let attempt = 1; attempt <= 6; attempt++) {

        console.log(`Resend Attempt ${attempt}`);

        await sendButton.click({
            force: true
        });

        await page.waitForTimeout(2000);

        if (!(await sendButton.isVisible().catch(() => false))) {

            sent = true;
            break;

        }

        await page.keyboard.press("Enter");

        await page.waitForTimeout(2000);

    }

    if (!sent) {

        throw new Error("Unable to resend prompt.");

    }
   console.log("Prompt Sent Again");

await page.waitForTimeout(3000);


}

function cleanImageText(text) {
    return String(text || "")
        .replace(/\bsexual reproduction\b/gi, "life cycle")
        .replace(/\breproduction\b/gi, "life process")
        .replace(/\breproduce\b/gi, "make a new living thing")
        .replace(/\bmating\b/gi, "life cycle")
        .replace(/\bprivate body parts\b/gi, "body structure")
        .replace(/\bblood\b/gi, "red liquid")
        .replace(/\binjury\b/gi, "health topic")
        .replace(/\bgraphic\b/gi, "simple")
        .replace(/\s+/g, " ")
        .trim();
}

function buildSafeRetryPrompt(scene, retry, validationReason = "", validationHistory = [],tutorialType = "") {

    const displayText =
    String(scene.displayText || "").trim();

    const learningIdea =
        cleanImageText(
            scene.narration ||
            scene.displayText
        );

    const imageIdea =
        cleanImageText(
            scene.imagePrompt
        );

const visualFacts = Array.isArray(scene.visualFacts)
    ? scene.visualFacts
    : [];

    const mustShow = Array.isArray(scene.mustShow)
    ? scene.mustShow
    : [];

const mustNotShow = Array.isArray(scene.mustNotShow)
    ? scene.mustNotShow
    : [];


console.log("Visual Facts:", visualFacts);
console.log("Must Show:", mustShow);
console.log("Must Not Show:", mustNotShow);

        const rejectionReason = cleanImageText(
    validationReason || "The previous image did not correctly match the current scene."
);

const failureHistory =
    validationHistory.length > 0
        ? validationHistory
            .map(
                (item, index) =>
                    `${index + 1}. ${cleanImageText(item)}`
            )
            .join("\n")
        : "No previous validation failures.";
    const subjectRules =
        ImagePromptRules(
            scene.subject,
            scene.type,
            scene.imagePrompt,
            scene.displayText,
            scene.heading,
            scene.scene
        );

        

    return `

${subjectRules}

==================================
SAFE IMAGE RETRY
==================================

The previous generated image was rejected by the image validator.

Validation reason:
"${rejectionReason}"

You MUST fix this exact problem in the new image.

Do NOT ignore the validation reason.

==================================
PREVIOUS VALIDATION FAILURES
==================================

The following problems were detected in previous
generated versions of THIS SAME scene:

${failureHistory}

You MUST avoid ALL of these previous mistakes.

Do NOT fix one mistake by introducing another
previously rejected mistake.

The new image must satisfy the CURRENT scene
requirements while correcting ALL listed failures.

==================================

Do NOT change the learning concept.

Do NOT replace the current mathematical example
with another example.

Do NOT invent a new question, equation, number, factor,
fraction, shape, or example.

Keep the SAME current scene.

Keep the SAME Display Text.

Keep the SAME educational meaning.

Correct ONLY the problem identified by the validator.

The new image must satisfy both:

1. The original Image Prompt.
2. The validation correction above.

==================================

This is for a school educational lesson.

Create ONE educational image.

Main learning idea:
${learningIdea}

==================================
TEXT RENDERING RULE
==================================

The ONLY educational text allowed inside the image
is the EXACT Display Text provided below.

Exact Display Text:
"${displayText}"

If text is rendered in the image, copy the Display Text
EXACTLY as written.

Do NOT rewrite it.
Do NOT paraphrase it.
Do NOT shorten it.
Do NOT expand it.
Do NOT translate it.

IMPORTANT:

The narration is ONLY for understanding the learning idea.

NEVER render the narration as visible text.

NEVER copy narration into the image.

NEVER create subtitles from narration.

NEVER create captions from narration.

NEVER create dialogue text from narration.

NEVER add explanatory text that is not present
in the Display Text.

Do NOT render the Heading.

Do NOT write these metadata words:

"Heading"
"Display Text"
"Narration"
"Scene Number"
"Image Prompt"

Do NOT create a screenshot or video frame.

Do NOT create a UI screen.

Do NOT reproduce the prompt as visible text.

If the image can explain the concept visually,
do not invent additional text.

Use the Display Text exactly when text is needed.

Narration for understanding ONLY:
"${learningIdea}"

Use the learning idea only to understand what
the illustration should teach.

==================================
VISUAL FACTS — SOURCE OF TRUTH
==================================

The CURRENT scene contains these exact Visual Facts:

${visualFacts.length > 0
    ? visualFacts.map((fact, index) => `${index + 1}. ${fact}`).join("\n")
    : "No additional Visual Facts were provided."
}

These Visual Facts belong ONLY to this scene.

Keep them exactly consistent.

Do NOT invent another number,
equation, factor, question, example,
shape, relationship, or fact.

If an exact equation or mathematical expression
is present, preserve it exactly.

----------------------------------
MUST SHOW — REQUIRED
----------------------------------

The generated image MUST contain all of the
following visual elements:

${mustShow.map((item, index) =>
    `${index + 1}. ${item}`
).join("\n")}

----------------------------------
MUST NOT SHOW — FORBIDDEN
----------------------------------

The generated image MUST NOT contain any of
the following visual elements:

${mustNotShow.length > 0
    ? mustNotShow.map((item, index) =>
        `${index + 1}. ${item}`
    ).join("\n")
    : "No specific forbidden visual elements for this scene."
}

==================================
CURRENT SCENE CONTEXT
==================================

CURRENT SCENE TYPE:
${scene.type || "unknown"}

==================================
SUMMARY SCENE RULE
==================================

If this scene belongs to a SUMMARY or REVISION tutorial:

Do NOT visualize the word "SUMMARY".

Visualize the actual learning concept contained
in the current scene.

Do NOT create a generic summary illustration.

Do NOT use another summary point.

Do NOT combine facts from different scenes.

Use ONLY the current scene's Display Text,
Narration, Visual Facts, and Image Prompt.

==================================

Draw this educational scene:
${imageIdea}

The image must preserve the same
educational meaning.

Do NOT change the concept.

Do NOT add new facts.

Do NOT add unrelated objects.

Use the subject-specific rules above.

==================================
RETRY REQUIREMENTS
==================================

- 16:9 landscape
- one clear concept
- child-friendly
- educational
- maximum 3 main objects
- very little text
- no paragraph text
- no unnecessary labels
- no collage
- no infographic
- no unrelated objects
- no scary content
- no graphic content
- no watermark
- no logo

If any part is difficult,
simplify the visual while keeping
the same learning idea.

Retry ${retry}.

`;
}

export async function generateImage(
    page,
    scene,
    outputFolder,
    fileName,
    narrationJson,
    accountId = 1
) {

    // Prompt Box
    const input = page.locator(
        'div[contenteditable="true"]'
    ).first();

    await input.waitFor({
        state: "visible"
    });

    // Clear previous prompt
    await input.click();

    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");

  let typeInstructions = "";

if (
    scene.type === "diagram" ||
    scene.type === "table"
) {

     typeInstructions =
        DiagramPromptRules(
            scene.subject,
            scene.type
        );

} else {

    typeInstructions =
        NormalImagePromptRules;

}
   const subjectRules = ImagePromptRules(
    scene.subject,
    scene.type,
    scene.imagePrompt,
    scene.displayText,
    scene.heading,
    scene.scene
);
// ==================================
// VISUAL FACTS
// ==================================

const visualFacts = Array.isArray(scene.visualFacts)
    ? scene.visualFacts
    : [];

console.log("Visual Facts:", visualFacts);
console.log("=================================");
console.log("IMAGE SUBJECT CHECK");
console.log("Subject:", scene.subject);
console.log("Scene Type:", scene.type);
console.log("=================================");

const promptStartTime = Date.now();

let finalPrompt = `

${subjectRules}

IMPORTANT TEXT RULE:
==================================

The ONLY educational text that may appear visibly
inside the generated image is the EXACT Display Text
provided for this scene.

EXACT DISPLAY TEXT:
"${scene.displayText}"

If text is visible in the image:

Use ONLY the exact Display Text above.

Copy it character-for-character.

Do NOT rewrite it.
Do NOT paraphrase it.
Do NOT shorten it.
Do NOT expand it.
Do NOT translate it.

==================================
NARRATION RULE
==================================

The narration is ONLY an internal guide explaining
what the scene should teach.

NEVER render the narration as visible text.

NEVER copy the narration into the image.

NEVER create subtitles from the narration.

NEVER create captions from the narration.

NEVER create dialogue containing the narration.

The image and narration should communicate the SAME
learning idea, but the narration itself must NOT
appear as written text.

==================================
METADATA TEXT RULE
==================================

NEVER render these words inside the image:

"Heading"
"Display Text"
"Narration"
"Scene Number"
"Image Prompt"

Do NOT create metadata labels.

Do NOT create a lesson UI.

Do NOT create a screenshot.

Do NOT create a video frame.

Do NOT create a presentation slide.

Do NOT create text boxes containing metadata.

Internal Heading:
${scene.heading}

Internal Scene Number:
${scene.scene}

==================================
TEXT ACCURACY
==================================

If Display Text is used in the image,
it must remain EXACTLY the same.

Do not add any other educational sentence.

Do not create extra labels.

Do not invent text.

Do not convert narration into text.

${typeInstructions}

==================================
VISUAL FACTS — SOURCE OF TRUTH
==================================

The following Visual Facts are extracted from the
CURRENT scene.

Use them to understand exactly what must be represented
in the image.

VISUAL FACTS:
${visualFacts.length > 0
    ? visualFacts.map((fact, index) => `${index + 1}. ${fact}`).join("\n")
    : "No additional Visual Facts were provided."
}

IMPORTANT:

Visual Facts belong ONLY to the current scene.

Do NOT invent additional facts.

Do NOT replace these facts with different examples.

Do NOT change numbers, equations, symbols, names,
relationships, or other exact information.

If Visual Facts contain an exact mathematical equation,
preserve that exact equation.

If Visual Facts contain specific numbers, use only those
numbers unless the current Image Prompt explicitly
requires a visual representation that does not need
numbers.

The Visual Facts must remain consistent with:

1. Current Display Text
2. Current Narration
3. Current Image Prompt

If there is a conflict, the CURRENT scene's source
content must be preserved and the image must not invent
new information.

==================================
EDUCATIONAL IMAGE INSTRUCTION
==================================

${scene.imagePrompt}

Create ONE full 16:9 educational image.
The illustration itself must fill the complete canvas.
No white margins.
No blank borders.
No unused white space.

The image must show ONLY the current learning idea.

If this scene is one step of a calculation,
problem, question, example, exercise, activity,
construction, or solution:

show ONLY THIS CURRENT STEP.

Do not show previous steps.
Do not show future steps.
Do not show the complete solution in one image.

The image must match the current narration exactly.

Do not create a collage.
Do not create an infographic.
Do not create multiple panels.

Use maximum 3 important visual objects.

TEXT REQUIREMENT:

If visible text is needed,
use ONLY the EXACT Display Text.

The Display Text may appear naturally
as part of the educational illustration.

Never render narration.

Never render heading.

Never render metadata labels.

Never add text that is not present
in the Display Text.
`;

console.log("=================================");
console.log("IMAGE SUBJECT CHECK");
console.log("Subject:", scene.subject);
console.log("Scene Type:", scene.type);
console.log("Prompt Length:", finalPrompt.length);
console.log("=================================");

console.log(
    "Using Subject Rules:",
    scene.subject === "Science"
        ? "SCIENCE"
        : scene.subject === "Mathematics" ||
          scene.subject === "Math" ||
          scene.subject === "Maths"
            ? "MATHEMATICS"
            : "COMMON"
);

console.log(
    "Using Diagram Rules:",
    scene.type === "diagram"
        ? "YES"
        : "NO"
);

// console.log("=================================");
// console.log("========== FINAL GEMINI PROMPT ==========");
// console.log(finalPrompt);
// console.log("========== END GEMINI PROMPT ==========");
// console.log("=================================");

await input.click();

await page.keyboard.press("Control+A");

await page.keyboard.press("Backspace");

await page.keyboard.insertText(finalPrompt);

const promptFilledTime = Date.now();

console.log(
    `Prompt Fill Time: ${((promptFilledTime - promptStartTime) / 1000).toFixed(2)} seconds`
);

const currentText = await input.textContent();

console.log("Prompt Filled");

await page.waitForTimeout(1000);

const sendButton = await findSendButton(page);

console.log("Waiting for Gemini Send button during retry...");

await sendButton.waitFor({
    state: "visible",
    timeout: 90000
});

console.log("Gemini retry Send button is visible.");

// Try up to 3 times to send the prompt
let sent = false;

for (let attempt = 1; attempt <= 6; attempt++) {

    console.log(`Send Attempt ${attempt}`);

    await sendButton.click({
        force: true
    });

    await page.waitForTimeout(2000);

    // If arrow is gone, prompt was submitted
    if (!(await sendButton.isVisible().catch(() => false))) {

        sent = true;
        break;

    }

    console.log("Prompt not submitted. Trying Enter...");

    await page.keyboard.press("Enter");

    await page.waitForTimeout(2000);

    if (!(await sendButton.isVisible().catch(() => false))) {

        sent = true;
        break;

    }

}

if (!sent) {

    throw new Error("Unable to submit prompt.");

}
console.log("Prompt Sent");

const imageGenerationStartTime = Date.now();

console.log(
    "IMAGE GENERATION TIMER STARTED:",
    new Date(imageGenerationStartTime).toISOString()
);

let imagePath;

// ==========================================
// VALIDATION FAILURE HISTORY
// ==========================================

let validationHistory = [];

for (let retry = 1; retry <= 6; retry++) {

    console.log(`Image Generation Attempt ${retry}`);

    try {

        imagePath = await downloadImage(
            page,
            outputFolder,
            fileName,
            imageGenerationStartTime
        );

console.log(
    `Validating Generated Image: Scene ${scene.scene}`
);

const validation = await validateGeneratedImage(
     imagePath,
    scene,
    narrationJson,
    accountId
);

console.log(
    `Image Validation Result:`,
    validation
);

if (!validation.valid) {

    console.log(
        `❌ Scene ${scene.scene} Image Validation FAILED`
    );

    console.log(
        "Validation Reason:",
        validation.reason
    );

    // ----------------------------------
// Save validation failure
// ----------------------------------

if (validation.reason) {
    validationHistory.push(
        validation.reason
    );
}

console.log(
    "Validation Failure History:",
    validationHistory
);

    // ----------------------------------
    // Delete invalid image
    // ----------------------------------

    if (imagePath && fs.existsSync(imagePath)) {

        await fs.promises.unlink(imagePath);

        console.log(
            `🗑️ Invalid image deleted: ${fileName}`
        );

    }

    // ----------------------------------
    // Retry this SAME scene
    // ----------------------------------

    if (retry < 6) {

        console.log(
            `🔄 Retrying Scene ${scene.scene}...`
        );

       finalPrompt = buildSafeRetryPrompt(
    scene,
    retry + 1,
    validation.reason,
    validationHistory
);

        console.log(
            "========== VALIDATION RETRY =========="
        );

        console.log(
            "Scene:",
            scene.scene
        );

        console.log(
            "Reason:",
            validation.reason
        );

        console.log(
            "Retry:",
            retry + 1,
            "/ 6"
        );

        console.log(
            "======================================"
        );

        await restartGeneration(
            page,
            finalPrompt
        );

        continue;
    }

    // ----------------------------------
    // All retries exhausted
    // ----------------------------------

    throw new Error(
        `IMAGE_VALIDATION_FAILED_AFTER_6_ATTEMPTS: Scene ${scene.scene}`
    );
}

console.log(
    `✅ Scene ${scene.scene} Image Validation PASSED`
);

return imagePath;

    }

    catch (err) {

    console.log("Image Generation Failed");

    console.log(err.message);

    // Duplicate image detected
   if (err.message === "DUPLICATE_IMAGE") {

    console.log("Duplicate Image Detected");

    finalPrompt += `

IMPORTANT RETRY INSTRUCTION:

Keep the SAME educational concept.
Keep the SAME imagePrompt.
Keep the SAME display text.

DO NOT change the topic.

Create a completely different composition.

Randomly choose a different:
- camera angle
- viewing distance
- perspective
- background
- desk arrangement
- lighting
- illustration style
- child appearance
- teacher appearance
- object positions
- color palette

The new image must look like it was drawn by a different illustrator.

Never recreate the previous composition.

Retry Version: ${retry}
`;

    await restartGeneration(
        page,
        finalPrompt
    );

    continue;
}

    const errorMessage =
    err.message.toLowerCase();

    console.log("Checking Gemini response...");

const isPlaywrightError =
    errorMessage.includes("locator") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("download") ||
    errorMessage.includes("click");

const isGeminiError =
    errorMessage.includes("gemini_error_visible") ||
    errorMessage.includes("gemini_image_generation_failed");

if (isGeminiError) {

    console.log("Gemini Image Generation Error Detected");
    console.log("Starting Retry...");

   finalPrompt = buildSafeRetryPrompt(
    scene,
    retry,
    "",
    validationHistory
);

    console.log("========== SAFE RETRY PROMPT ==========");
    console.log(finalPrompt);
    console.log("=======================================");

    await restartGeneration(
        page,
        finalPrompt
    );

    console.log(
        `Retry Prompt Sent Successfully - Attempt ${retry + 1}`
    );

    continue;
}

else if (isPlaywrightError) {

    console.log("Playwright Error Detected");

    // Close any open dialog / image preview
    try {

        await page.keyboard.press("Escape");
        await page.waitForTimeout(1000);

        const backdrop = page.locator(
            ".image-expansion-dialog-backdrop"
        );

        if (await backdrop.count()) {

            await backdrop.first().click({
                force: true
            }).catch(() => {});

            await page.waitForTimeout(1000);
        }

    } catch {}

    await restartGeneration(
        page,
        finalPrompt
    );

    continue;

}

else {

    throw err;

}

}

}

throw new Error(
    "Image generation failed after 3 attempts."
);

}