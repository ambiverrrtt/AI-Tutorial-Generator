import TeachingStepPromptBuilder from "../../services/PromptBuilder/TeachingStepPromptBuilder.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";
import { splitConcepts } from "../helpers/splitConcepts.js";
import { jsonrepair } from "jsonrepair";

function repairTextFieldQuotes(json) {
    let result = "";
    let i = 0;

    while (i < json.length) {

        if (json.startsWith('"text"', i)) {

            result += '"text"';
            i += 6;

            while (
                i < json.length &&
                /\s/.test(json[i])
            ) {
                result += json[i];
                i++;
            }

            if (json[i] === ":") {
                result += ":";
                i++;
            }

            while (
                i < json.length &&
                /\s/.test(json[i])
            ) {
                result += json[i];
                i++;
            }

            if (json[i] === '"') {
                result += '"';
                i++;
            }

            while (i < json.length) {

                const char = json[i];

                // Already escaped quote
                if (
                    char === "\\" &&
                    json[i + 1] === '"'
                ) {
                    result += '\\"';
                    i += 2;
                    continue;
                }

                // Closing quote OR unescaped quote
                if (char === '"') {

                    let j = i + 1;

                    while (
                        j < json.length &&
                        /\s/.test(json[j])
                    ) {
                        j++;
                    }

                    // Actual end of JSON string
                    if (
                        json[j] === "," ||
                        json[j] === "}" ||
                        json[j] === "]"
                    ) {
                        result += '"';
                        i++;
                        break;
                    }

                    // Quote inside text
                    result += '\\"';
                    i++;
                    continue;
                }

                // Remove actual line breaks inside text
                if (
                    char === "\n" ||
                    char === "\r"
                ) {
                    result += " ";
                    i++;
                    continue;
                }

                result += char;
                i++;
            }

            continue;
        }

        result += json[i];
        i++;
    }

    return result;
}

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

   const MAX_RETRY = 3;

let parsed = null;
let lastError = null;

for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {

    console.log("============================================");
    console.log(`Teaching Steps Generation Attempt ${attempt}/${MAX_RETRY}`);
    console.log("============================================");

    try {

        let retryPrompt = prompt;

        // Retry par Gemini ko JSON format ki strict instruction do
        if (attempt > 1) {

            retryPrompt = `${prompt}

IMPORTANT — PREVIOUS RESPONSE HAD INVALID JSON.

Return ONLY valid JSON.

Rules:
1. Return ONLY the JSON object.
2. Do NOT use markdown or code fences.
3. Every value of "text" MUST be a valid JSON string.
4. If text contains quotation marks, escape them as \\".
5. Do NOT put raw line breaks inside JSON string values.
6. Do NOT add comments.
7. Do NOT add any explanation before or after JSON.

Expected format:
{
  "tutorialId": 1,
  "steps": [
    {
      "step": 1,
      "type": "statement",
      "text": "Example text"
    }
  ]
}

Generate the complete Teaching Steps JSON again.
`;
        }

        const rawResponse =
            await generateNarrationPlaywright(
                retryPrompt,
                accountId
            );

        console.log("========== RAW TEACHING STEPS ==========");
        console.log(rawResponse);
        console.log("=========================================");


        // ============================================
        // EXTRACT JSON
        // ============================================

        const start = rawResponse.indexOf("{");
        const end = rawResponse.lastIndexOf("}");

        if (start === -1 || end === -1) {
            throw new Error(
                "No JSON found in Gemini response."
            );
        }

        const jsonText =
            rawResponse
                .substring(start, end + 1)
                .trim();


        // ============================================
        // CLEAN JSON
        // ============================================

        const cleanedJson = jsonText
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .replace(/\r/g, "")
            .replace(/\u2028/g, "")
            .replace(/\u2029/g, "");


let finalJson = repairTextFieldQuotes(cleanedJson);

        // ============================================
        // PARSE JSON
        // ============================================

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


            // ========================================
            // JSON REPAIR
            // ========================================

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

                throw repairError;
            }
        }


        // ============================================
        // VALIDATE PARSED JSON
        // ============================================

        if (
            !parsed ||
            !parsed.steps ||
            !Array.isArray(parsed.steps)
        ) {

            throw new Error(
                "Teaching Steps not found."
            );
        }


        // ============================================
        // VALIDATE EACH STEP
        // ============================================

        for (
            let i = 0;
            i < parsed.steps.length;
            i++
        ) {

            const step =
                parsed.steps[i];

            if (
                !step ||
                typeof step !== "object"
            ) {

                throw new Error(
                    `Invalid teaching step at index ${i}.`
                );
            }

            if (
                step.step === undefined ||
                step.type === undefined ||
                typeof step.text !== "string"
            ) {

                throw new Error(
                    `Invalid teaching step structure at index ${i}.`
                );
            }
        }


        // ============================================
        // SUCCESS
        // ============================================

        console.log(
            `✅ Teaching Steps Attempt ${attempt} Successful`
        );

        break;


    } catch (error) {

        lastError = error;

        console.log(
            "============================================"
        );

        console.log(
            `❌ Teaching Steps Attempt ${attempt} Failed`
        );

        console.log(
            "Error:",
            error.message
        );

        console.log(
            "============================================"
        );


        if (attempt < MAX_RETRY) {

            console.log(
                `🔄 Retrying Teaching Steps... Attempt ${attempt + 1}/${MAX_RETRY}`
            );

            continue;
        }

        console.log(
            "❌ All Teaching Steps retries exhausted."
        );

        throw lastError;
    }
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