import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { jsonrepair } from "jsonrepair";
import { saveJson } from "./utils/saveJson.js";
import { generateNarration } from "./gemini/generateNarration.js";
import { generateNarrationV2 } from "./gemini/generateNarrationV2.js";
import { translateNarration } from "./gemini/translateNarration.js";
import { generateImages } from "./gemini/generateImages.js";
import { generateAudio } from "./tts/generateAudio.js";
import { createScenes } from "./tutorial/createScene.js";
import { mergeTutorial } from "./tutorial/mergeTutorial.js";
import { callGemini } from "./gemini/geminiRetry.js";
import { generateTopicsPlaywright } from "./playwright/generateTopics.js";
import { clearProgress ,saveProgress,loadProgress,markDone,isDone} from "./progressManager.js";
import { completeJob } from "./jobs/jobManager.js";
import { uploadVideo } from "./youtube/uploadVideo.js";
import { generateThumbnail } from "./gemini/generateThumbnail.js";
import { getOrCreatePlaylist } from "./youtube/playlistManager.js";
import { saveUploadJob } from "./uploads/uploadManager.js";
import { extractTeachingSteps } from "./gemini/extractTeachingSteps.js";
import { generateTeachingPlan } from "./gemini/generateTeachingPlan.js";
import { generateScenePlan } from "./gemini/generateScenePlan.js";
import { cleanupTutorial } from "./cleanup/cleanupTutorial.js";
const MAX_TOPIC_RETRY = 3;
dotenv.config();
function sanitizeJsonStringContent(text) {

    let result = "";
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        // ----------------------------------
        // Existing escape sequence
        // ----------------------------------

        if (escaped) {

            // Valid JSON escapes
            if (
                char === '"' ||
                char === "\\" ||
                char === "/" ||
                char === "b" ||
                char === "f" ||
                char === "n" ||
                char === "r" ||
                char === "t"
            ) {
                result += char;
            } else {

                // Invalid escape like \times, \x etc.
                // Keep the actual character, escape backslash
                result += "\\" + char;
            }

            escaped = false;
            continue;
        }

        // ----------------------------------
        // Backslash
        // ----------------------------------

        if (char === "\\") {

            if (inString) {
                escaped = true;
                result += char;
            } else {
                result += char;
            }

            continue;
        }

        // ----------------------------------
        // Quote
        // ----------------------------------

        if (char === '"') {

            if (!inString) {

                // Opening quote
                inString = true;
                result += '"';

            } else {

                // Check what comes after quote
                let j = i + 1;

                while (
                    j < text.length &&
                    /\s/.test(text[j])
                ) {
                    j++;
                }

                const next = text[j];

                // These normally mean string is ending
                if (
                    next === "," ||
                    next === "}" ||
                    next === "]" ||
                    next === ":" ||
                    next === undefined
                ) {

                    result += '"';
                    inString = false;

                } else {

                    // Quote is inside content
                    result += '\\"';
                }
            }

            continue;
        }

        // ----------------------------------
        // Raw newline inside JSON string
        // ----------------------------------

        if (inString && char === "\n") {

            result += "\\n";
            continue;
        }

        // ----------------------------------
        // Raw carriage return
        // ----------------------------------

        if (inString && char === "\r") {

            result += "\\r";
            continue;
        }

        // ----------------------------------
        // Raw tab
        // ----------------------------------

        if (inString && char === "\t") {

            result += "\\t";
            continue;
        }

        // ----------------------------------
        // Other control characters
        // ----------------------------------

        if (
            inString &&
            char.charCodeAt(0) < 32
        ) {

            result += " ";
            continue;
        }

        result += char;
    }

    return result;
}
function repairUnescapedQuotes(text) {

    let result = "";
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        // Existing escaped character
        if (escaped) {
            result += char;
            escaped = false;
            continue;
        }

        // Backslash
        if (char === "\\") {

            result += char;
            escaped = true;

            continue;
        }

        // Quote
        if (char === '"') {

            if (!inString) {

                // Starting JSON string
                result += char;
                inString = true;

                continue;
            }

            // We are already inside a string.
            // Check what comes after this quote.

            let j = i + 1;

            while (
                j < text.length &&
                /\s/.test(text[j])
            ) {
                j++;
            }

            const next = text[j];

            // Actual closing quote
            if (
                next === "," ||
                next === "}" ||
                next === "]" ||
                next === ":" ||
                next === undefined
            ) {

                result += char;
                inString = false;

            } else {

                // Quote inside content
                result += '\\"';
            }

            continue;
        }

        result += char;
    }

    return result;
}
function cleanGeminiJson(text) {

    if (!text || typeof text !== "string") {
        throw new Error("Gemini response is not a string.");
    }

    let cleaned = text
        .replace(/^\uFEFF/, "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/^JSON\s*/i, "")
        .trim();

    // Smart quotes ko normal quote mat banao blindly
    // Kyunki ye content ke andar invalid quote create kar sakta hai.
    
    cleaned = sanitizeJsonStringContent(cleaned);

    return cleaned.trim();
}
export async function processChapter(
    classFolder,
    subjectFolder,
    pdfPath,
    accountId = 1,
    jobId,
    youtubeAccountId
) {

    console.log("Processing:", pdfPath);
    let result;

// const chapterFileName = path.basename(pdfPath, ".pdf");

const topicsFolder = path.join(
    "generated",
    "topics",
    classFolder,
    subjectFolder
);

 let existingJson = null;

if (fs.existsSync(topicsFolder)) {

    const jsonFiles = fs
        .readdirSync(topicsFolder)
        .filter(file => file.endsWith(".json"));

    for (const file of jsonFiles) {

        const jsonPath = path.join(topicsFolder, file);

        const jsonData = JSON.parse(
            fs.readFileSync(jsonPath, "utf8")
        );

        if (jsonData.pdfPath === pdfPath) {

            existingJson = file;
            break;

        }

    }

}

if (existingJson) {

    console.log("Topics JSON Already Exists");

    result = JSON.parse(
        fs.readFileSync(
            path.join(topicsFolder, existingJson),
            "utf8"
        )
    );

} else {

    const prompt = `You are an expert NCERT curriculum designer and educational content architect.

Analyze the provided NCERT chapter PDF.

Your task is to prepare the tutorial structure for an AI-powered learning platform.
Instructions:

1. Read the complete PDF from beginning to end.

2. Detect the official chapter title exactly as written.

3. Extract EVERY heading and EVERY subheading exactly as printed.

4. Never skip any heading.

5. Never merge two independent textbook topics.

IMPORTANT

Some bold labels are NOT independent topics.

The following are considered part of the current topic:

Proof
Solution
Explanation
Observation
Construction
Discussion
Reason
Justification
Working
Method
Hint
Answer
Remark
Note attached to a theorem
Proof by contradiction

Case

Case I

Case II

Alternative Method

Alternative Solution

Verification

Check

Inference

Corollary

Algorithm

Important

Remember

Result

Conclusion

Never create a separate tutorial for the above labels.

They belong to the current theorem, example, activity or exercise.

Only create a new tutorial when a new textbook heading starts.

For example:

Theorem 1.2
Proof

must become ONE tutorial.

Example 3
Solution

must become ONE tutorial.

Activity
Observation

must become ONE tutorial.

Exercise 1.2
Question
Solution

must remain inside the Exercise tutorial.

6. Never rename any heading.

7. Never create your own headings.

8. Preserve the original textbook order.

9. The textbook is the only source of truth.

10. Do not ignore any educational content.

Include:

• Every numbered heading

• Every independent textbook heading

• Every theorem

• Every example

• Every solved example

• Every activity

• Every exercise

• Every Figure It Out

• Every Think About It

Do NOT treat the following as independent headings:

Proof

Solution

Observation

Explanation

Construction

Discussion

Reason

Answer

Hint

Remark

Case

Case I

Case II

Alternative Method

Alternative Solution

Verification

Check

Inference

Corollary

Algorithm

Important

Remember

Result

Conclusion

Ignore only:
- Index
- Copyright page
- Blank pages

11. For every topic return:

- id
- sectionNumber
- title
- type
- startHeading
- endHeading
- content

Output Format:

{
  "chapterName": "",

  "tutorials": [

    {

      "id": 1,

      "sectionNumber": "",

      "title": "",

      "type": "section",

      "startHeading": "",

      "endHeading": "",

       "content": "",

    }

  ]
}

type can be one of:

section
subsection
theorem
example
exercise
activity
figure_it_out
think_about_it
table
diagram
note
summary

The "content" field must contain the complete textbook text belonging only to that topic.

Do not include the heading itself inside content.

Content must start immediately after the heading.

Content must stop immediately before the next heading.

Do not include the next topic.

Do not omit any sentence.

Copy the text exactly from the textbook.

Do not summarize.

Do not rewrite.

Never use your own judgement to decide topic boundaries.

A topic starts exactly where its heading starts.

A topic ends immediately before the next independent textbook heading begins.

IMPORTANT

"Proof", "Solution", "Observation", "Explanation", "Construction", "Answer", "Reason", "Hint" and similar labels do NOT end the current topic.

They are continuations of the current topic.

Only a new theorem, example, exercise, activity or major textbook heading ends the current topic.

Do not treat bold text, italic text, blue text, larger font or colored labels as a new heading.

Only semantic textbook topics begin a new tutorial.

Never include any sentence from the next heading.
  
Every educational element in the textbook must appear exactly once.

Nothing may be skipped.

Do not merge independent textbook topics.

Only merge Proof, Solution, Observation, Explanation and similar labels into their parent topic.

Nothing may be duplicated.

Every Figure It Out must be returned as a separate tutorial.

Every Think About It must be returned as a separate tutorial.

Every table must be returned.

Every diagram must be returned.

Every note must be returned.

The Summary section is mandatory.

Return Summary as the final tutorial.

If a heading has no content before the next heading,
do NOT create a separate tutorial for it.

If an empty heading is immediately followed by an activity, table, diagram, note, example, or explanation,
merge that following content into the empty heading.

Do not return a tutorial with empty content.

A heading-only tutorial is invalid.

Only create a tutorial if at least one sentence belongs to that heading.

Never create duplicate tutorials for the same heading.

Before returning the JSON verify:

✓ Every heading is included.

✓ Every subsection is included.

✓ Every Figure It Out is included.

✓ Every Think About It is included.

✓ Every table is included.

✓ Every diagram is included.

✓ Every note is included.

✓ Every summary is included.

FINAL VALIDATION

Before returning JSON verify:

✓ Every theorem includes its proof.

✓ Every example includes its solution.

✓ Every activity includes its discussion.

✓ Every exercise includes its questions.

✓ Never create an empty tutorial.

✓ Never create a tutorial whose content is empty.

✓ Never split a theorem from its proof.

✓ Never split an example from its solution.

✓ Never split an activity from its observation.

If any tutorial has empty content, merge it into the following tutorial before returning JSON.

If a theorem is immediately followed by Proof,

merge both into one tutorial.

If an example is immediately followed by Solution,

merge both into one tutorial.

If an activity is immediately followed by Observation,

merge both into one tutorial.

Do not split them.

No theorem has empty content.

No example has empty content.

No activity has empty content.

No exercise has empty content.

No Figure It Out has empty content.

No Think About It has empty content.

If any of these have empty content, merge them with their associated Proof, Solution, Observation or Discussion before returning JSON.

If anything is missing, regenerate before returning.

CRITICAL JSON RULES:

Return ONLY a valid JSON object.

The response MUST be parseable directly using JSON.parse().

For every string value:
- Escape every double quote inside the string as \"
- Escape every backslash as \\
- Escape newline characters as \n
- Never put an unescaped " inside a string value.
- Do not use raw line breaks inside JSON strings.

Example of CORRECT JSON:

{
  "content": "Anshu asks: \"Can I write every natural number as a sum of consecutive numbers?\""
}

Example of INCORRECT JSON:

{
  "content": "Anshu asks: "Can I write every natural number as a sum of consecutive numbers?""
}

Before submitting the response, validate the entire JSON mentally so that JSON.parse() can parse it without any repair.
`
;

   let result = null;

for (let attempt = 1; attempt <= MAX_TOPIC_RETRY; attempt++) {

    console.log(
        `\n========== TOPIC GENERATION ATTEMPT ${attempt}/${MAX_TOPIC_RETRY} ==========\n`
    );

    try {

      let retryPrompt = prompt;

if (attempt > 1) {
    retryPrompt = `${prompt}

IMPORTANT:
Your previous response was invalid JSON.

Return ONLY one valid JSON object.

Rules:
- Do not use Markdown.
- Do not use code fences.
- Do not write any explanation outside the JSON.
- Every property name must use double quotes.
- Every string value must be valid JSON.
- Never put a literal line break inside a JSON string.
- Use \\n for line breaks inside string values.
- Escape double quotes inside string values correctly.
- Do not use invalid backslash escapes.
- Do not add trailing commas.
- Make sure every { has a matching }.
- Make sure every [ has a matching ].
- Validate the complete JSON before returning it.
`;

}

const response = await generateTopicsPlaywright(
    retryPrompt,
    pdfPath,
    accountId
);

const cleaned = cleanGeminiJson(response);

if (typeof cleaned !== "string") {
    throw new Error(
        `cleanGeminiJson() returned ${typeof cleaned} instead of a string.`
    );
}

        console.log("Cleaned Length:", cleaned.length);

        // ==============================
        // JSON PARSE
        // ==============================

        try {

            result = JSON.parse(cleaned);

            console.log("✅ JSON Parse Success");

        } catch (jsonError) {

            console.log("❌ JSON Parse Failed:");
            console.log(jsonError.message);
console.log("========== AROUND POSITION 425 ==========");
console.log(cleaned.substring(300, 700));
console.log("==========================================");
            console.log("Trying JSON Repair...");

            try {

                const repaired = jsonrepair(cleaned);

                result = JSON.parse(repaired);

                console.log(
                    "✅ JSON Parse Success After Repair"
                );

            } catch (repairError) {

                console.log(
                    "❌ JSON Repair Failed:"
                );

                console.log(repairError.message);

                // Error position dikhao
                const match =
                    repairError.message.match(
                        /position (\d+)/
                    );

                if (match) {

                    const pos = Number(match[1]);

                    console.log(
                        "\n========== ERROR POSITION =========="
                    );

                    console.log(
                        "Position:",
                        pos
                    );

                    console.log(
                        "\n========== BEFORE ERROR =========="
                    );

                    console.log(
                        cleaned.substring(
                            Math.max(0, pos - 500),
                            pos
                        )
                    );

                    console.log(
                        "\n========== AFTER ERROR =========="
                    );

                    console.log(
                        cleaned.substring(
                            pos,
                            pos + 500
                        )
                    );

                    console.log(
                        "===================================="
                    );
                }

                throw repairError;
            }
        }

        // ==============================
        // STRUCTURE VALIDATION
        // ==============================

        if (
            !result ||
            !Array.isArray(result.tutorials)
        ) {

            throw new Error(
                "Invalid tutorial data. Expected result.tutorials to be an array."
            );

        }

        console.log(
            `✅ Topic generation successful on attempt ${attempt}`
        );

        // SUCCESS
        break;

    } catch (err) {

        console.log(
            `\n❌ Topic generation attempt ${attempt} failed.`
        );

        console.log(err.message);

        // Last attempt
        if (attempt === MAX_TOPIC_RETRY) {

            console.log(
                `❌ Topic generation failed after ${MAX_TOPIC_RETRY} attempts.`
            );

            throw new Error(
                `Gemini Error after ${MAX_TOPIC_RETRY} attempts: ${err.message}`
            );
        }

        console.log(
            `⚠️ Retrying topic generation... Attempt ${attempt + 1}/${MAX_TOPIC_RETRY}`
        );
    }
}

   

const mergedTutorials = [];

for (let i = 0; i < result.tutorials.length; i++) {

    const current = result.tutorials[i];
    const next = result.tutorials[i + 1];

    const currentContent = String(current.content || "").trim();

    if (!currentContent && next) {

        const nextContent = String(next.content || "").trim();

        current.endHeading = next.endHeading || current.endHeading;

        current.content = [
            next.startHeading || next.title,
            nextContent
        ]
            .filter(Boolean)
            .join("\n");

        current.title = current.title || next.title;
        current.type = current.type || next.type;

        mergedTutorials.push(current);

        i++;

        continue;
    }

    if (!currentContent && !next) {
        continue;
    }

    mergedTutorials.push(current);
}

result.tutorials = mergedTutorials;

    if (!result.chapterName) {
    throw new Error("Chapter name missing.");
}

if (!Array.isArray(result.tutorials)) {
    throw new Error("Tutorial list missing.");
}

console.log("===== TUTORIAL VALIDATION DEBUG =====");
console.log("result exists:", !!result);
console.log("tutorials exists:", !!result?.tutorials);
console.log("tutorials is array:", Array.isArray(result?.tutorials));
console.log("tutorial count:", result?.tutorials?.length);

for (const tutorial of result.tutorials) {

    console.log("Current Tutorial:", tutorial);
    console.log("Tutorial Content:", tutorial?.content);
    console.log("Content Length:", tutorial?.content?.length);

    if (!tutorial.title)
        throw new Error(`Missing title in tutorial id: ${tutorial.id}`);

    if (!tutorial.type)
        tutorial.type = "section";

   const validTypes = [
    "section",
    "subsection",
    "theorem",
    "example",
    "exercise",
    "activity",
    "figure_it_out",
    "think_about_it",
    "table",
    "diagram",
    "note",
    "summary"
];

if (!validTypes.includes(tutorial.type)) {
    throw new Error(`Invalid tutorial type: ${tutorial.type}`);
}

}


let currentSection = "";
let childIndex = 0;

for (const tutorial of result.tutorials) {

    if (
        tutorial.sectionNumber &&
        tutorial.sectionNumber.trim() !== ""
    ) {

        currentSection = tutorial.sectionNumber.trim();
        childIndex = 0;

    } else if (currentSection) {

        tutorial.sectionNumber =
            `${currentSection}(${String.fromCharCode(65 + childIndex)})`;

        childIndex++;

    }

}

const seen = new Set();

result.tutorials = result.tutorials.filter(tutorial => {

const key = `${tutorial.startHeading}|${tutorial.type}`;

    if (seen.has(key)) {
        return false;
    }

    seen.add(key);
    return true;
});

if (result.tutorials.length === 0) {
    throw new Error("No tutorials found.");
}

console.log(`Detected ${result.tutorials.length} tutorials.`);
    
console.log(
    `Loaded ${result.tutorials.length} tutorials`
);
console.log("BEFORE CLASSNAME:");
console.log("result:", result);
console.log("classFolder:", classFolder);
console.log("result type:", typeof result);

result.className = classFolder;
result.subjectName = subjectFolder;
result.pdfPath = pdfPath;
const safeChapterName = (result.chapterName || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .trim();
    
    saveJson(
        `generated/topics/${classFolder}/${subjectFolder}/${safeChapterName}.json`,
        result
    );
}

const progress = loadProgress(
    classFolder,
    subjectFolder,
    result.chapterName
);
if (progress.completed) {

    console.log("\n================================");
    console.log("Chapter Already Completed.");
    console.log("Skipping Tutorial Generation.");
    console.log("================================\n");

    return;

}

    for (
    // let i = progress.currentTutorial;
    let i=0;
    i < result.tutorials.length;
    i++
) {

    const tutorial = result.tutorials[i];
    // ---------------------------------
    // File & Folder Names
    // ---------------------------------

    const cleanTitle = tutorial.title
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
    
const jsonFileName = (
    tutorial.sectionNumber
        ? `${tutorial.sectionNumber}-${safeTitle}`
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

const folderName = jsonFileName;

console.log("jsonFileName =", jsonFileName);
console.log("folderName =", folderName);


    const tutorialKey = folderName;
    // ---------------------------------
    // Tutorial Metadata
    // ---------------------------------

    tutorial.className = result.className;
    tutorial.subject = result.subjectName;
    tutorial.board = "NCERT";
    tutorial.chapterName = result.chapterName;
    tutorial.pdfPath = result.pdfPath;
    tutorial.outputFolder = folderName;
    tutorial.type = tutorial.type || "section";

    console.log(tutorial);
    console.log(`Using Account ${accountId}`);

    console.log(`\nProcessing Tutorial: ${tutorial.title}`);

    const tutorialCompleted =
    isDone(progress, tutorialKey, "narration") &&
    isDone(progress, tutorialKey, "images") &&
    isDone(progress, tutorialKey, "thumbnail") &&
    isDone(progress, tutorialKey, "audio") &&
    isDone(progress, tutorialKey, "scene") &&
    isDone(progress, tutorialKey, "merge") &&
    isDone(progress, tutorialKey, "upload-en") &&
    isDone(progress, tutorialKey, "hindi-narration") &&
    isDone(progress, tutorialKey, "hindi-audio") &&
    isDone(progress, tutorialKey, "hindi-scene") &&
    isDone(progress, tutorialKey, "hindi-merge") &&
    isDone(progress, tutorialKey, "upload-hi");

if (tutorialCompleted) {

    console.log(`Tutorial Already Completed (Progress). Skipping...`);

    progress.currentTutorial = i + 1;

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i+1,
        "completed"
    );

    continue;

}

    // ---------------------------------
    // Narration
    // ---------------------------------

const safeChapterName = result.chapterName
    .replace(/[\\/:*?"<>|]/g, "")
    .trim();

       const narrationPath = path.join(
    "generated",
    "narrations",
    tutorial.className,
    tutorial.subject,
    safeChapterName,
    `${jsonFileName}.json`
);
console.log("Narration Path:", narrationPath);
console.log("Exists:", fs.existsSync(narrationPath));
        let narration=null;

     if (

    isDone(progress, tutorialKey, "narration") ||

    fs.existsSync(narrationPath)

) {

    console.log("Narration Already Completed (Progress)");
    
    if (fs.existsSync(narrationPath)) {

    narration = JSON.parse(
        fs.readFileSync(narrationPath, "utf8")
    );

    narration.className = tutorial.className;
    narration.subject = tutorial.subject;
    narration.chapterName = result.chapterName;

    markDone(
    progress,
    tutorialKey,
    "narration"
);

saveProgress(
    classFolder,
    subjectFolder,
    result.chapterName,
    progress,
    i,
    "narration"
);

}
      }
else {

console.log("Generating Narration...");

narration = await generateNarration(
    pdfPath,
    tutorial,
    accountId
);

narration = {
    tutorialId: tutorial.id,
    sectionNumber: tutorial.sectionNumber,
    title: tutorial.title,
    className: tutorial.className,
    subject: tutorial.subject,
    chapterName: result.chapterName,
    type: tutorial.type,
    scenes: narration.scenes
};

    markDone(
        progress,
        tutorialKey,
        "narration"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "narration"
    );

}
    
if (!narration && fs.existsSync(narrationPath)) {

    narration = JSON.parse(
        fs.readFileSync(narrationPath,"utf8")
    );

    narration.className=tutorial.className;
    narration.subject=tutorial.subject;
    narration.chapterName = result.chapterName;

}

if (!narration) {
    throw new Error(`Narration JSON not available for tutorial: ${narrationPath}`);

}

// ---------------------------------
// Images
// ---------------------------------


const imageFolder = path.join(
    "generated",
    "images",
    tutorial.className,
    tutorial.subject,
    safeChapterName,
    folderName
);

console.log("Image folder path:",imageFolder);

let imageCount = 0;

if (fs.existsSync(imageFolder)) {

    imageCount = fs
        .readdirSync(imageFolder)
        .filter(file =>
    file.endsWith(".png") &&
    file !== "thumbnail.png"
)
        .length;

}

if (

    isDone(progress, tutorialKey, "images") ||

    (
        fs.existsSync(imageFolder) &&
        imageCount === narration.scenes.length
    )

) {

    console.log("Images Already Completed");

    markDone(
        progress,
        tutorialKey,
        "images"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "images"
    );

}
else {

    console.log(
        `Generating Images (${imageCount}/${narration.scenes.length})`
    );

    await generateImages(
        narration,
        accountId
    );

    markDone(
        progress,
        tutorialKey,
        "images"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "images"
    );

}

// ---------------------------------
// Thumbnail
// ---------------------------------

const thumbnailPath = path.join(
    imageFolder,
    "thumbnail.png"
);

if (
    isDone(progress, tutorialKey, "thumbnail") ||
    fs.existsSync(thumbnailPath)
) {

    console.log("Thumbnail Already Completed");

    markDone(
        progress,
        tutorialKey,
        "thumbnail"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "thumbnail"
    );

} else {

    console.log("Generating Thumbnail...");

    await generateThumbnail(
        narration,
        accountId
    );

    markDone(
        progress,
        tutorialKey,
        "thumbnail"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "thumbnail"
    );
}

// ---------------------------------
// Audio
// ---------------------------------

const audioFolder = path.join(
    "generated",
    "audio",
    tutorial.className,
    tutorial.subject,
    safeChapterName,
    folderName
);

let audioCount = 0;

if (fs.existsSync(audioFolder)) {

    audioCount = fs
        .readdirSync(audioFolder)
        .filter(file => file.endsWith(".wav"))
        .length;

}

if (

    isDone(progress, tutorialKey, "audio") ||

    (
        fs.existsSync(audioFolder) &&
        audioCount === narration.scenes.length
    )

) {

    console.log("Audio Already Completed");

    if (!narration && fs.existsSync(narrationPath)) {

        narration = JSON.parse(
            fs.readFileSync(narrationPath, "utf8")
        );

        narration.className = tutorial.className;
        narration.subject = tutorial.subject;
        narration.chapterName = result.chapterName;

    }

    markDone(
        progress,
        tutorialKey,
        "audio"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "audio"
    );

} else {

    console.log(
        `Generating Audio (${audioCount}/${narration.scenes.length})`
    );

    if (!narration && fs.existsSync(narrationPath)) {

        narration = JSON.parse(
            fs.readFileSync(narrationPath, "utf8")
        );

        narration.className = tutorial.className;
        narration.subject = tutorial.subject;
        narration.chapterName = result.chapterName;

    }

    await generateAudio(narration);

    markDone(
        progress,
        tutorialKey,
        "audio"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "audio"
    );

}

// ---------------------------------
// Scene Videos
// ---------------------------------

const videoFolder = path.join(
    "generated",
    "videos",
    tutorial.className,
    tutorial.subject,
    safeChapterName,
    folderName
);

let sceneCount = 0;

if (fs.existsSync(videoFolder)) {

    sceneCount = fs
        .readdirSync(videoFolder)
        .filter(file =>
            file.startsWith("scene") &&
            file.endsWith(".mp4")
        )
        .length;

}

if (

    isDone(progress, tutorialKey, "scene") ||

    (
        fs.existsSync(videoFolder) &&
        sceneCount === narration.scenes.length
    )

) {

    console.log("Scene Videos Already Completed");

    if (!narration && fs.existsSync(narrationPath)) {

        narration = JSON.parse(
            fs.readFileSync(narrationPath, "utf8")
        );

        narration.className = tutorial.className;
        narration.subject = tutorial.subject;
        narration.chapterName = result.chapterName;

    }

    markDone(
        progress,
        tutorialKey,
        "scene"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        safeChapterName,
        progress,
        i,
        "scene"
    );

} else {

    console.log(
        `Creating Scene Videos (${sceneCount}/${narration.scenes.length})`
    );

    if (!narration && fs.existsSync(narrationPath)) {

        narration = JSON.parse(
            fs.readFileSync(narrationPath, "utf8")
        );

        narration.className = tutorial.className;
        narration.subject = tutorial.subject;
        narration.chapterName = result.chapterName;

    }

    await createScenes(narration);

    markDone(
        progress,
        tutorialKey,
        "scene"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "scene"
    );

}

const tutorialVideo = path.join(
    "generated",
    "videos",
     tutorial.className,
    tutorial.subject,
    safeChapterName,
    folderName,
    "tutorial.mp4"
);

console.log("\n========== MERGE CHECK ==========");
console.log("Tutorial:", tutorial.title);
console.log("Tutorial Video Path:", tutorialVideo);
console.log("Tutorial Exists:", fs.existsSync(tutorialVideo));

console.log("Folder Exists:",
    fs.existsSync(path.dirname(tutorialVideo))
);

if (fs.existsSync(path.dirname(tutorialVideo))) {

    console.log(
        "Files In Folder:",
        fs.readdirSync(path.dirname(tutorialVideo))
    );

}

console.log("===============================\n");

if (

    isDone(progress, tutorialKey, "merge") ||

    fs.existsSync(tutorialVideo)

) {

 console.log("Merge Already Completed (Progress)");

    markDone(
        progress,
        tutorialKey,
        "merge"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "merge"
    );
    
} else {

    console.log("Calling mergeTutorial...");

    if (!narration && fs.existsSync(narrationPath)) {

    narration = JSON.parse(
        fs.readFileSync(narrationPath, "utf8")
    );

    narration.className = tutorial.className;
    narration.subject = tutorial.subject;
    narration.chapterName = result.chapterName;

}

    await mergeTutorial(narration);
        console.log("English Merge Finished");


    markDone(
        progress,
        tutorialKey,
        "merge"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "merge"
    );

}

console.log("\n===== BEFORE ENGLISH UPLOAD =====");

console.log("Tutorial Video:", tutorialVideo);

console.log(
    "Video Exists:",
    fs.existsSync(tutorialVideo)
);

console.log(
    "Folder Exists:",
    fs.existsSync(path.dirname(tutorialVideo))
);

if (fs.existsSync(path.dirname(tutorialVideo))) {

    console.log(
        "Files:",
        fs.readdirSync(path.dirname(tutorialVideo))
    );

}

console.log("===============================\n");console.log("\n===== BEFORE ENGLISH UPLOAD =====");

console.log("Tutorial Video:", tutorialVideo);

console.log(
    "Video Exists:",
    fs.existsSync(tutorialVideo)
);

console.log(
    "Folder Exists:",
    fs.existsSync(path.dirname(tutorialVideo))
);

if (fs.existsSync(path.dirname(tutorialVideo))) {

    console.log(
        "Files:",
        fs.readdirSync(path.dirname(tutorialVideo))
    );

}

console.log("===============================\n");

// ---------------------------------
// English Upload Queue
// ---------------------------------

if (isDone(progress, tutorialKey, "upload-en")) {

    console.log("English Upload Queue Already Completed");

}else if (!fs.existsSync(tutorialVideo)) {

    console.log("English tutorial video not found. Upload job skipped.");

}  else {
    console.log("Adding English Video To Upload Queue...");

   await saveUploadJob({
        jobId: `${tutorial.className}_${tutorial.subject}_${result.chapterName}_${tutorial.title}_en`,

        className: tutorial.className,
        subject: tutorial.subject,
        chapterName: result.chapterName,

        tutorialTitle: tutorial.title,
youtubeAccountId: youtubeAccountId,
        language: "en",

        videoPath: tutorialVideo,

        thumbnailPath: path.join(
            imageFolder,
            "thumbnail.png"
        ),

        status: "pending",

        retryCount: 0,

        createdAt: new Date().toISOString()
    });

    markDone(
        progress,
        tutorialKey,
        "upload-en"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "upload-en"
    );

}

// ---------------------------------
// Hindi Narration
// ---------------------------------

const hindiNarrationPath = path.join(
    "generated",
    "narrations-hi",
    tutorial.className,
    tutorial.subject,
    safeChapterName,
    `${jsonFileName}.json`
);

let hindiNarration=null;

if (

    isDone(progress, tutorialKey, "hindi-narration") ||

    fs.existsSync(hindiNarrationPath)

) {

    console.log("Hindi Narration Already Completed (Progress)");

    if (fs.existsSync(hindiNarrationPath)) {

    hindiNarration = JSON.parse(
        fs.readFileSync(
            hindiNarrationPath,
            "utf8"
        )
    );

    
    hindiNarration.className = tutorial.className;
hindiNarration.subject = tutorial.subject;
hindiNarration.chapterName = result.chapterName;

    markDone(
    progress,
    tutorialKey,
    "hindi-narration"
);

saveProgress(
    classFolder,
    subjectFolder,
    result.chapterName,
    progress,
    i,
    "hindi-narration"
);

}
}
 else {
    
    console.log("Generating Hindi Narration...");

    hindiNarration = await translateNarration(
    narration,
    accountId
);
    hindiNarration.className = tutorial.className;
    hindiNarration.subject = tutorial.subject;
hindiNarration.chapterName = result.chapterName;

    console.log("Saving Hindi Narration from processChapter.js");

    saveJson(
    `generated/narrations-hi/${tutorial.className}/${tutorial.subject}/${safeChapterName}/${jsonFileName}.json`,
    hindiNarration
);

    markDone(
        progress,
        tutorialKey,
        "hindi-narration"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "hindi-narration"
    );

}

if (!hindiNarration && fs.existsSync(hindiNarrationPath)) {

    hindiNarration = JSON.parse(
        fs.readFileSync(hindiNarrationPath, "utf8")
    );

    hindiNarration.className = tutorial.className;
    hindiNarration.subject = tutorial.subject;
    hindiNarration.chapterName = result.chapterName;


}

if (!hindiNarration) {
    throw new Error(`Hindi Narration JSON not available for tutorial: ${hindiNarrationPath}`);
}

// Hindi Audio

const hindiAudioFolder = path.join(
    "generated",
    "audio-hi",
    tutorial.className,
    tutorial.subject,
    safeChapterName,
    folderName
);

// Hindi Scene Videos

const hindiVideoFolder = path.join(
    "generated",
    "video-hi",
    tutorial.className,
    tutorial.subject,
    safeChapterName,
    folderName
);

// Hindi Merged Tutorial Video

const hindiTutorialVideo = path.join(
    "generated",
    "video-hi",
    tutorial.className,
    tutorial.subject,
safeChapterName,
    folderName,
    "tutorial.mp4"
);

let hindiAudioCount = 0;

if (fs.existsSync(hindiAudioFolder)) {

    hindiAudioCount = fs
        .readdirSync(hindiAudioFolder)
   .filter(file =>
    /^\d+\.wav$/.test(file)
)
        .length;

}

if (

    isDone(progress, tutorialKey, "hindi-audio") ||

    (
        fs.existsSync(hindiAudioFolder) &&
        hindiAudioCount === hindiNarration.scenes.length
    )

){

    console.log("Hindi Audio Already Completed (Progress)");
markDone(
    progress,
    tutorialKey,
    "hindi-audio"
);

saveProgress(
    classFolder,
    subjectFolder,
    result.chapterName,
    progress,
    i,
    "hindi-audio"
);


} else {

    console.log(
        `Generating Hindi Audio (${hindiAudioCount}/${hindiNarration.scenes.length})`
    );

    if (!hindiNarration && fs.existsSync(hindiNarrationPath)) {

    hindiNarration = JSON.parse(
        fs.readFileSync(hindiNarrationPath, "utf8")
    );

    hindiNarration.className = tutorial.className;
    hindiNarration.subject = tutorial.subject;
    hindiNarration.chapterName = result.chapterName;


}

    await generateAudio(
        hindiNarration,
        "hi"
    );

    markDone(
        progress,
        tutorialKey,
        "hindi-audio"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "hindi-audio"
    );

}

let hindiSceneCount = 0;

if (fs.existsSync(hindiVideoFolder)) {

    hindiSceneCount = fs
        .readdirSync(hindiVideoFolder)
        .filter(file =>
            file.startsWith("scene") &&
            file.endsWith(".mp4")
        )
        .length;

}

if (

    isDone(progress, tutorialKey, "hindi-scene") ||

    (
        fs.existsSync(hindiVideoFolder) &&
        hindiSceneCount === hindiNarration.scenes.length
    )

) {

    console.log("Hindi Scene Videos Already Completed (Progress)");

    markDone(
    progress,
    tutorialKey,
    "hindi-scene"
);

saveProgress(
    classFolder,
    subjectFolder,
    result.chapterName,
    progress,
    i,
    "hindi-scene"
);

} else {

    console.log(
        `Creating Hindi Scene Videos (${hindiSceneCount}/${hindiNarration.scenes.length})`
    );
if (!hindiNarration && fs.existsSync(hindiNarrationPath)) {

    hindiNarration = JSON.parse(
        fs.readFileSync(hindiNarrationPath, "utf8")
    );

    hindiNarration.className = tutorial.className;
    hindiNarration.subject = tutorial.subject;
    hindiNarration.chapterName = result.chapterName;


}
    await createScenes(
        hindiNarration,
        "hi"
    );

    markDone(
        progress,
        tutorialKey,
        "hindi-scene"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "hindi-scene"
    );

}

if (

    isDone(progress, tutorialKey, "hindi-merge") ||

    fs.existsSync(hindiTutorialVideo)

) {

    console.log("Hindi Merge Already Completed (Progress)");

    markDone(
    progress,
    tutorialKey,
    "hindi-merge"
);

saveProgress(
    classFolder,
    subjectFolder,
    result.chapterName,
    progress,
    i,
    "hindi-merge"
);

} else {

    console.log("Calling Hindi mergeTutorial...");
    if (!hindiNarration && fs.existsSync(hindiNarrationPath)) {

    hindiNarration = JSON.parse(
        fs.readFileSync(hindiNarrationPath, "utf8")
    );

    hindiNarration.className = tutorial.className;
    hindiNarration.subject = tutorial.subject;
hindiNarration.chapterName = result.chapterName;

}

    await mergeTutorial(
        hindiNarration,
        "hi"
    );

    console.log("Hindi Merge Finished");

    markDone(
        progress,
        tutorialKey,
        "hindi-merge"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "hindi-merge"
    );

}

// ---------------------------------
// Hindi Upload Queue
// ---------------------------------

if (isDone(progress, tutorialKey, "upload-hi")) {

    console.log("Hindi Upload Queue Already Completed");

} else if (!fs.existsSync(hindiTutorialVideo)) {

    console.log("Hindi tutorial video not found. Upload job skipped.");

} else {

    console.log("Adding Hindi Video To Upload Queue...");

   await saveUploadJob({
        jobId: `${tutorial.className}_${tutorial.subject}_${result.chapterName}_${tutorial.title}_hi`,

        className: tutorial.className,
        subject: tutorial.subject,
        chapterName: result.chapterName,

        tutorialTitle: tutorial.title,
youtubeAccountId: youtubeAccountId,
        language: "hi",

        videoPath: hindiTutorialVideo,

        thumbnailPath: path.join(
            imageFolder,
            "thumbnail.png"
        ),

        status: "pending",

        retryCount: 0,

        createdAt: new Date().toISOString()
    });

    markDone(
        progress,
        tutorialKey,
        "upload-hi"
    );

    saveProgress(
        classFolder,
        subjectFolder,
        result.chapterName,
        progress,
        i,
        "upload-hi"
    );

        // ========================================
// Cleanup Completed Tutorial Files
// ========================================

await cleanupTutorial({

    className: tutorial.className,

    subject: tutorial.subject,

    chapterName: result.chapterName,

    tutorialTitle: tutorial.title,

    folderName

});


}

    }



console.log("\n========================================");
console.log("🎉 Chapter processing completed successfully.");
console.log("📚 System is now idle.");
console.log("📄 Please upload the next chapter PDF from the UI to start a new job.");
console.log("========================================\n");

completeJob(jobId);

clearProgress(
    classFolder,
    subjectFolder,
    result.chapterName
);

}