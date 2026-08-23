import TeachingStepPromptBuilder from "../../services/PromptBuilder/TeachingStepPromptBuilder.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";
import { splitConcepts } from "../helpers/splitConcepts.js";
import { jsonrepair } from "jsonrepair";
function splitTeachingSteps(steps = []) {

    const result = [];
    let stepNumber = 1;

    // const splitPattern =
    //     /\s*,\s*|\s*;\s*|\bwhich\b|\bthat\b|\bbecause\b|\btherefore\b|\bhence\b|\bthus\b|\bis called\b|\bis known as\b|\bif\b|\bwhen\b|\bthen\b/gi;
const splitPattern =
    /\s*;\s*|\n{2,}|(?<=\.)\s+(?=[A-Z])/g;

    for (const step of steps) {
                   
        if (!step?.text) continue;

        const parts = step.text
            .split(splitPattern)
            .map(part => part.trim())
            .filter(Boolean);

        if (parts.length <= 1) {

            result.push({
                step: stepNumber++,
                type: step.type || "statement",
                text: step.text.trim()
            });

            continue;
        }

        for (const part of parts) {

            result.push({
                step: stepNumber++,
                type: step.type || "statement",
                text: part
            });

        }

    }

    return result;

}

export async function extractTeachingSteps(tutorial,accountId) {

   console.log("========== TUTORIAL CONTENT ==========");
console.log(tutorial.content);
console.log("======================================");
    const prompt =
        await TeachingStepPromptBuilder.build(tutorial);

    const rawResponse =
        await generateNarrationPlaywright(prompt, accountId);

   const start = rawResponse.indexOf("{");
const end = rawResponse.lastIndexOf("}");

if (start === -1 || end === -1) {
    throw new Error("No JSON found in Gemini response.");
}

const jsonText = rawResponse
    .substring(start, end + 1)
    .trim();

const cleanedJson = jsonText
    .replace(/\\\r?\n\s*/g, "\\")
    .replace(/\\rac/g, "\\frac")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    // Collapse 3 or more backslashes to 2
    .replace(/\\{3,}/g, "\\\\")

    // Escape invalid JSON backslashes
 .replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, "\\\\");

    let finalJson = cleanedJson;

// Fix multiline text values produced by Gemini
finalJson = finalJson.replace(
    /"text"\s*:\s*"([\s\S]*?)"/g,
    (match, text) => {
        const fixed = text
            .replace(/\r?\n+/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();

        return `"text":"${fixed}"`;
    }
); 
let parsed;

try {

    console.log("FIRST 200 CHARS");
    console.log(jsonText.substring(0, 200));

    console.log("LAST 200 CHARS");
    console.log(jsonText.substring(jsonText.length - 200));

    console.log("======= CLEANED JSON =======");
    console.log(finalJson);
    console.log("============================");

    console.log(
        finalJson.match(/\\{2,}[A-Za-z]+/g)
    );

    // ---------------------------------
    // First: Normal JSON Parse
    // ---------------------------------

    try {

        parsed = JSON.parse(finalJson);

        console.log(
            "✅ Teaching Steps JSON parsed successfully."
        );

    } catch (parseError) {

        console.log(
            "❌ Teaching Steps JSON Parse Failed:"
        );

        console.log(parseError.message);

        // ---------------------------------
        // Second: JSON Repair
        // ---------------------------------

        console.log(
            "🔧 Trying JSON Repair..."
        );

        try {

            const repairedJson =
                jsonrepair(finalJson);

            parsed =
                JSON.parse(repairedJson);

            console.log(
                "✅ Teaching Steps JSON repaired successfully."
            );

        } catch (repairError) {

            console.log(
                "❌ Teaching Steps JSON Repair Failed:"
            );

            console.log(
                repairError.message
            );

            console.log(
                "=========== INVALID JSON ==========="
            );

            console.log(jsonText);

            console.log(
                "===================================="
            );

            throw repairError;
        }
    }

} catch (error) {

    console.error(
        "Final Teaching Steps JSON Error:",
        error.message
    );

    throw error;
}

    if (!parsed.steps || !Array.isArray(parsed.steps)) {

        throw new Error("Teaching Steps not found.");

    }

   parsed.steps =
    splitConcepts(
        splitTeachingSteps(parsed.steps)
    );

    console.log(`Teaching Steps : ${parsed.steps.length}`);

    console.log("========== FINAL TEACHING STEPS ==========");
console.log(JSON.stringify(parsed.steps, null, 2));
console.log("==========================================");

    return parsed;

}