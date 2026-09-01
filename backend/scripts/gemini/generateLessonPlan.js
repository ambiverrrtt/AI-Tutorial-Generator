import LessonPlannerPromptBuilder from "../../services/PromptBuilder/LessonPlannerPromptBuilder.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";
import { jsonrepair } from "jsonrepair";
function wordCount(text) {
    return String(text || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
}

function validateScenePlan(json) {
    if (!json.scenes || !Array.isArray(json.scenes)) {
        throw new Error("Scenes not found.");
    }

    const bannedWords = [
        "background",
        "recap",
        "scene",
        "introduction",
        "basics",
        "overview"
    ];

    for (const scene of json.scenes) {
        const heading = String(scene.heading || "").toLowerCase();
        const displayText = String(scene.displayText || "").toLowerCase();
        const narration = String(scene.narration || "").toLowerCase();

       for (const word of bannedWords) {

    const regex = new RegExp(`\\b${word}\\b`, "i");

    if (
        regex.test(heading) ||
        regex.test(displayText) ||
        regex.test(narration)
    ) {
        throw new Error(
            `Bad filler word "${word}" in scene ${scene.scene}`
        );
    }

}

 const displayWordCount = wordCount(scene.displayText);
const narrationWordCount = wordCount(scene.narration);

// ------------------------------------------
// DISPLAY TEXT LIMIT
// ------------------------------------------

// Normal Display Text:
// maximum 6 words.
//
// Mathematical expressions:
// do not count mathematical symbols as normal words.
// But still prevent extremely long expressions.
//
// This keeps Science / English / Social Science
// short while allowing valid mathematical equations.

const displayTextValue = String(scene.displayText || "").trim();

const isMathematicalExpression =
    /[\d()+\-×÷=*/<>≤≥→←↑↓]|∑|√|∞|\bvs\b/i.test(
        displayTextValue
    );
    
if (!isMathematicalExpression && displayWordCount > 6) {
    throw new Error(
        `Display Text too long in scene ${scene.scene}: ${scene.displayText}`
    );
}

// Mathematical Display Text can exceed 6 word tokens,
// but must still remain reasonably short./
if (isMathematicalExpression && displayTextValue.length > 80) {
    throw new Error(
        `Mathematical Display Text too long in scene ${scene.scene}: ${scene.displayText}`
    );
}

// ------------------------------------------
// NARRATION LIMIT
// ------------------------------------------

// Normal narration should remain short.
// Worked-example / solution narration may need
// slightly more words to explain one step.
//
// Maximum allowed narration = 15 words.
//
// If more explanation is required, the model
// should create another scene instead.

if (narrationWordCount > 15) {
    throw new Error(
        `Narration too long in scene ${scene.scene}: ${scene.narration}`
    );
}
// ------------------------------------------
// VISUAL FACTS VALIDATION
// ------------------------------------------

if (!Array.isArray(scene.visualFacts)) {

    throw new Error(
        `visualFacts missing or invalid in scene ${scene.scene}`
    );

}

if (scene.visualFacts.length === 0) {

    throw new Error(
        `visualFacts empty in scene ${scene.scene}`
    );

}

// Every visual fact must contain meaningful text
for (const fact of scene.visualFacts) {

    if (
        typeof fact !== "string" ||
        !fact.trim()
    ) {

        throw new Error(
            `Invalid visualFact in scene ${scene.scene}`
        );

    }

}

// ------------------------------------------
// MUST SHOW VALIDATION
// ------------------------------------------

if (!Array.isArray(scene.mustShow)) {

    throw new Error(
        `mustShow missing or invalid in scene ${scene.scene}`
    );

}

if (scene.mustShow.length === 0) {

    throw new Error(
        `mustShow empty in scene ${scene.scene}`
    );

}

for (const item of scene.mustShow) {

    if (
        typeof item !== "string" ||
        !item.trim()
    ) {

        throw new Error(
            `Invalid mustShow item in scene ${scene.scene}`
        );

    }

}

// ------------------------------------------
// MUST NOT SHOW VALIDATION
// ------------------------------------------

if (!Array.isArray(scene.mustNotShow)) {

    throw new Error(
        `mustNotShow missing or invalid in scene ${scene.scene}`
    );

}

for (const item of scene.mustNotShow) {

    if (
        typeof item !== "string" ||
        !item.trim()
    ) {

        throw new Error(
            `Invalid mustNotShow item in scene ${scene.scene}`
        );

    }

}

        if (!scene.displayText || !scene.narration || !scene.imagePrompt) {
            throw new Error(
                `Missing scene fields in scene ${scene.scene}`
            );
        }
    }
}

export async function generateLessonPlan(
    concepts,
    accountId
) {
    console.log("================================");
    console.log("Generating Lesson Plan...");
    console.log("================================");

    const MAX_RETRY = 3;

    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
        try {
            let prompt =
    await LessonPlannerPromptBuilder.build(concepts);

if (attempt > 1) {
    prompt += `

==================================
PREVIOUS OUTPUT WAS REJECTED
==================================

The previous lesson plan used vague or banned words.

Do not use these words in heading, displayText, or narration:

background
recap
context
appears
shown
view
scene
image
diagram
visual
notes
introduction
basics
overview
summary

Do not create filler opening scenes.

Do not say that we already discussed something.

Do not say that something is background.

Start directly with the actual learning idea.

Every displayText must be a real concept the child should learn.

Every scene MUST contain a non-empty visualFacts array.

Do NOT return:

"visualFacts": []

Do NOT leave visualFacts missing.

Every visualFact must be a meaningful, concrete visual
requirement supported by the CURRENT Visual Card.

Do NOT invent visual facts.

Do NOT copy visual facts from another scene.

Return a fresh corrected JSON only.
`;
}

            const raw =
                await generateNarrationPlaywright(
                    prompt,
                    accountId
                );

            console.log("========== RAW LESSON PLAN ==========");
            console.log(raw);
            console.log("=====================================");

            const start = raw.indexOf("{");
            const end = raw.lastIndexOf("}");

            if (start === -1 || end === -1) {
                throw new Error("Lesson Plan JSON not found.");
            }

            const jsonText = raw
                .substring(start, end + 1)
                .trim()
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .replace(/[\u200B-\u200D\uFEFF]/g, "");

           let json;

try {

    json = JSON.parse(jsonText);

} catch (parseError) {

    console.log("❌ Lesson Plan JSON Parse Failed:");
    console.log(parseError.message);

    console.log("🔧 Trying JSON Repair...");

    try {

        const repairedJson = jsonrepair(jsonText);

        json = JSON.parse(repairedJson);

        console.log("✅ Lesson Plan JSON Repaired Successfully");

    } catch (repairError) {

        console.log("❌ JSON Repair Failed:");
        console.log(repairError.message);

        throw repairError;
    }
}

validateScenePlan(json);

            console.log(`Generated ${json.scenes.length} scenes`);

            return json;
        } catch (err) {
            console.log(`Lesson Plan Retry ${attempt}/${MAX_RETRY}`);
            console.error(err.message);

            if (attempt >= MAX_RETRY) {
                throw err;
            }
        }
    }
}