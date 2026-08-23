import { downloadImage } from "./downloadImage.js";

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

for (let attempt = 1; attempt <= 3; attempt++) {

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

    const sendButton = page.locator(
        'button[aria-label="Send message"]'
    );

    await sendButton.waitFor({
        state: "visible"
    });

    let sent = false;

    for (let attempt = 1; attempt <= 3; attempt++) {

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
function cleanThumbnailText(text) {
    return String(text || "")
        .replace(/\bsexual reproduction\b/gi, "life cycle")
        .replace(/\breproduction\b/gi, "life process")
        .replace(/\breproduce\b/gi, "life process")
        .replace(/\bmating\b/gi, "life cycle")
        .replace(/\bprivate body parts\b/gi, "body structure")
        .replace(/\bblood\b/gi, "health topic")
        .replace(/\binjury\b/gi, "health topic")
        .replace(/\bgraphic\b/gi, "simple")
        .replace(/\s+/g, " ")
        .trim();
}

function buildSafeThumbnailRetryPrompt(scene, retry) {
    const className = cleanThumbnailText(scene.className || "");
    const subject = cleanThumbnailText(scene.subject || "Science");
    const title = cleanThumbnailText(scene.title || "Science Lesson");
    const chapterName = cleanThumbnailText(scene.chapterName || "");

    return `Create one simple school education thumbnail.

Class: ${className}
Subject: ${subject}
Chapter: ${chapterName}
Topic: ${title}

Text on thumbnail:
${title}

Style:
bright classroom thumbnail, friendly teacher, simple blackboard, clean layout, colorful, 16:9 landscape.

Rules:
show a safe school classroom.
show one teacher and a simple learning board.
use very little text.
do not create a medical or realistic body image.
do not create a historical portrait.
do not create a crowded scene.
make it suitable for school students.

If the exact topic is difficult, create a general classroom thumbnail for this subject and topic.

Retry ${retry}.`;
}
export async function generateThumbnailImage(
    page,
    scene,
    outputFolder,
    fileName
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

if (scene.type === "diagram") {

    typeInstructions = `

THIS IS A MATHEMATICAL TEXTBOOK DIAGRAM.

This is NOT an illustration.

Draw exactly what is described.

Rules:

- Follow the imagePrompt exactly.
- Do not redesign the diagram.
- Do not beautify the diagram.
- Keep exact mathematical structure.
- Keep exact rows and columns.
- Keep exact number of dots.
- Keep exact L-shaped partitions.
- White background.
- Thin black lines.
- Black dots.
- Use colors ONLY for highlighting groups if mentioned.
- No cartoon characters.
- No smiling children.
- No classroom.
- No decorative objects.
- The result should look like a clean NCERT textbook figure.

`;

}
else {

    typeInstructions = `

Create a colorful educational illustration suitable for children.

`;

}

  let finalPrompt = `

CREATE ONE SINGLE PROFESSIONAL YOUTUBE EDUCATIONAL THUMBNAIL.

This is a SINGLE IMAGE, SINGLE SCENE, SINGLE CAMERA VIEW.
Do NOT create a collage.
Do NOT create multiple panels.
Do NOT create inset images.
Do NOT create small duplicate images inside the main image.

==================================================
EXACT TEXT TO RENDER
==================================================

There are ONLY THREE allowed text elements in the entire image:

1. TOP LEFT:
CLASS ${scene.className.replace("class-", "")}

2. TOP RIGHT:
${scene.subject.toUpperCase()}

3. CENTER:
${scene.title}

NO OTHER TEXT IS ALLOWED.

The tutorial title "${scene.title}" MUST appear EXACTLY ONCE.

The title "${scene.title}" must appear ONLY in the center.

NEVER repeat the tutorial title.

NEVER put the tutorial title at the top.

NEVER put the tutorial title on the blackboard.

NEVER put the tutorial title on posters.

NEVER put the tutorial title on books.

NEVER put the tutorial title on signs.

NEVER put the tutorial title anywhere in the background.

Do not create a subtitle.

Do not create a second heading.

Do not create a duplicate title.

Do not use quotation marks around the title.

Do not repeat individual words from the title.

==================================================
TEXT PLACEMENT
==================================================

TOP LEFT:
"CLASS ${scene.className.replace("class-", "")}"

TOP RIGHT:
"${scene.subject.toUpperCase()}"

CENTER:
"${scene.title}"

The center title is the MAIN and LARGEST text.

The center title must be clearly readable.

The center title must appear ONE TIME ONLY.

Keep sufficient empty space around the center title.

==================================================
SINGLE SCENE
==================================================

Create ONE modern bright school classroom.

Use ONE camera angle.

Use ONE continuous background.

Use ONE composition.

Do NOT split the image into sections.

Do NOT create multiple scenes.

Do NOT create multiple photographs.

Do NOT create a collage.

Do NOT create picture-in-picture images.

Do NOT create frames containing smaller versions of the same classroom.

Do NOT create thumbnails inside the thumbnail.

==================================================
TEACHER
==================================================

Show EXACTLY ONE teacher.

One teacher only.

The teacher must be a single complete person.

Do not duplicate the teacher.

Do not create multiple copies of the teacher.

Do not create a second teacher.

Do not create a small teacher image anywhere.

The teacher must be clearly visible from head to at least waist.

Do NOT crop the teacher's head.

Do NOT cut off the teacher's face.

Keep the teacher centered behind the title.

Friendly professional school teacher.

Natural human proportions.

Natural hands.

Natural face.

==================================================
STUDENTS
==================================================

Show a normal classroom with a small number of students.

Students should be sitting naturally at desks.

Do not duplicate students.

Do not create repeated faces.

Do not create cloned people.

Do not create tiny people or miniature people.

==================================================
BACKGROUND
==================================================

Modern clean school classroom.

Simple blackboard.

Clean classroom walls.

A few simple educational decorations.

IMPORTANT:

The blackboard must contain NO readable text.

The posters must contain NO readable text.

The books must contain NO readable text.

The signs must contain NO readable text.

Do NOT generate random words.

Do NOT generate random letters.

Do NOT generate equations.

Do NOT generate fake labels.

Do NOT generate random numbers.

The only readable text anywhere in the image must be:

CLASS ${scene.className.replace("class-", "")}

${scene.subject.toUpperCase()}

${scene.title}

==================================================
COMPOSITION
==================================================

16:9 landscape YouTube thumbnail.

Professional educational YouTube design.

Teacher centered.

Students in the background.

Center title clearly separated from the background.

Top-left class label.

Top-right subject label.

Clean visual hierarchy.

Large readable typography.

No overlapping text.

No duplicated elements.

No visual clutter.

No cropped faces.

No cropped teacher.

No distorted people.

No multiple scenes.

No collage.

No inset images.

No miniature images.

==================================================
VISUAL STYLE
==================================================

Bright professional educational thumbnail.

Modern classroom.

Clean composition.

High quality.

Sharp image.

Professional lighting.

Realistic but polished educational illustration.

Consistent blue and orange educational color theme.

16:9 landscape.

==================================================
STRICT FINAL CHECK
==================================================

Before producing the final image, internally verify all of the following:

- Is there exactly ONE teacher?
- Is the teacher fully visible from head to waist?
- Is there exactly ONE classroom scene?
- Is there exactly ONE camera view?
- Is there NO collage?
- Are there NO inset images?
- Are there NO miniature duplicate images?
- Is the title "${scene.title}" visible EXACTLY ONCE?
- Is the title ONLY in the center?
- Is there NO title on the blackboard?
- Is there NO title in the background?
- Is there NO duplicate title?
- Is there NO random readable text anywhere?
- Are the only readable text elements CLASS, SUBJECT and TITLE?
- Is the composition clean and suitable for YouTube?

If ANY duplicate text, extra text, collage, inset image, duplicate person, or cropped teacher appears, regenerate the image with the problem removed.

FINAL OUTPUT MUST BE ONE SINGLE CLEAN 16:9 THUMBNAIL.

`;

await input.click();

await page.keyboard.press("Control+A");

await page.keyboard.press("Backspace");

await page.keyboard.insertText(finalPrompt);
// await page.screenshot({
//     path: "afterPrompt.png",
//     fullPage: true
// });

const currentText = await input.textContent();

// console.log("INPUT TEXT:");
// console.log(currentText);

console.log("Prompt Filled");

await page.waitForTimeout(1000);

const sendButton = page.locator(
    'button[aria-label="Send message"]'
);

await sendButton.waitFor({
    state: "visible"
});

// Try up to 3 times to send the prompt
let sent = false;

for (let attempt = 1; attempt <= 3; attempt++) {

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

let imagePath;

for (let retry = 1; retry <= 3; retry++) {

    console.log(`Image Generation Attempt ${retry}`);

    try {

        imagePath = await downloadImage(
            page,
            outputFolder,
            fileName
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

Keep EXACTLY the same thumbnail template.

Do NOT change:

- teacher
- classroom
- background
- camera angle
- perspective
- composition
- lighting
- colors
- font
- layout
- text position

Only regenerate the image if generation failed.

Keep Class, Subject and Topic exactly the same.

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

const isPlaywrightError =

    errorMessage.includes("locator") ||

    errorMessage.includes("timeout") ||

    errorMessage.includes("download") ||

    errorMessage.includes("click");

    console.log("Checking Gemini response...");

    const isFastGeminiError =
    errorMessage.includes("gemini_error_visible");

const pageText = (
    await page.locator("body").innerText()
).toLowerCase();

    const hasGeminiError =
    pageText.includes("sorry, something went wrong") ||
    pageText.includes("something went wrong") ||
    pageText.includes("please try your request again") ||
    pageText.includes("try your request again") ||
    pageText.includes("i seem to be encountering an error") ||
    pageText.includes("encountering an error") ||
    pageText.includes("can i try something else") ||
    pageText.includes("i'm having a hard time fulfilling your request") ||
    pageText.includes("hard time fulfilling your request") ||
    pageText.includes("can i help you with something else") ||
    pageText.includes("may go against my guidelines") ||
    pageText.includes("request may go against my guidelines") ||
    pageText.includes("guidelines") ||
    pageText.includes("can't create") ||
    pageText.includes("couldn't") ||
    pageText.includes("unable") ||
    pageText.includes("failed to generate") ||
    pageText.includes("generation failed") ||
    pageText.includes("try generating again") ||
    pageText.includes("network error") ||
    pageText.includes("image failed") ||
    pageText.includes("an error occurred");

  if (hasGeminiError || isFastGeminiError) {

    console.log("Gemini Error Detected");

    finalPrompt = buildSafeThumbnailRetryPrompt(scene, retry);

    console.log("========== SAFE THUMBNAIL RETRY PROMPT ==========");
    console.log(finalPrompt);
    console.log("=================================================");

    await restartGeneration(
        page,
        finalPrompt
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