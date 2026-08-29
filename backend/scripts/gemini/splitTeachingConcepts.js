import ConceptSplitPromptBuilder from "../../services/PromptBuilder/ConceptSplitPromptBuilder.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";


// ==================================================
// REPAIR COMMON GEMINI JSON PROBLEMS
// ==================================================


function repairUnescapedQuotes(text) {

    let result = "";

    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        // -----------------------------------------
        // Handle escaped characters
        // -----------------------------------------

        if (escaped) {

            result += char;
            escaped = false;

            continue;
        }

        if (char === "\\") {

            result += char;
            escaped = true;

            continue;
        }

        // -----------------------------------------
        // Outside JSON string
        // -----------------------------------------

        if (!inString) {

            result += char;

            if (char === '"') {
                inString = true;
            }

            continue;
        }

        // -----------------------------------------
        // Inside JSON string
        // -----------------------------------------

        if (char === '"') {

            // Look ahead to determine whether this quote
            // is actually ending the JSON string.

            let j = i + 1;

            while (
                j < text.length &&
                /\s/.test(text[j])
            ) {
                j++;
            }

            const next = text[j];

            /*
             * A quote normally ends a JSON string when
             * the next meaningful character is:
             *
             * ,  }  ]  :
             */

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

                // This is most likely an unescaped quote
                // INSIDE the text value.

                result += '\\"';
            }

            continue;
        }

        result += char;
    }

    return result;
}

function repairJsonText(text) {

    if (!text || typeof text !== "string") {
        return text;
    }

    let repaired = text
        // Remove invisible characters
        .replace(/[\u200B-\u200D\uFEFF]/g, "")

        // Remove control characters except normal whitespace
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ");

    repaired = repairUnescapedQuotes(repaired);

    // Repair invalid backslashes
    repaired = repaired.replace(
        /\\(?!["\\/bfnrtu])/g,
        "\\\\"
    );

    return repaired.trim();
}

// ==================================================
// EXTRACT VALID JSON OBJECT
// ==================================================

function extractValidConceptJSON(raw) {

    if (!raw || typeof raw !== "string") {
        return null;
    }


    // --------------------------------------------------
    // Clean raw response
    // --------------------------------------------------

    const cleaned =
    repairJsonText(raw)
        .trim();

    // ==================================================
    // METHOD 1
    // Try fenced JSON
    // ==================================================

    const fencedMatches =
        cleaned.match(
            /```json\s*([\s\S]*?)```/gi
        );


    if (fencedMatches) {

        for (const block of fencedMatches) {

            const jsonText =
                block
                    .replace(/^```json\s*/i, "")
                    .replace(/```\s*$/i, "")
                    .trim();

            // First try original JSON
            try {

                const parsed =
                    JSON.parse(jsonText);

                if (
                    parsed &&
                    Array.isArray(parsed.steps)
                ) {

                    return parsed;

                }

            } catch (error) {

                // Try repaired version below

            }


            // Try repaired JSON
            try {

                const repaired =
                    repairJsonText(jsonText);

                const parsed =
                    JSON.parse(repaired);

                if (
                    parsed &&
                    Array.isArray(parsed.steps)
                ) {

                    console.log(
                        "Gemini JSON repaired successfully."
                    );

                    return parsed;

                }

            } catch (error) {

                // Continue searching

            }

        }

    }


    // ==================================================
    // METHOD 2
    // Find JSON objects
    // ==================================================

    const candidates = [];


    for (
        let start = 0;
        start < cleaned.length;
        start++
    ) {

        if (cleaned[start] !== "{") {
            continue;
        }


        let depth = 0;

        let inString = false;

        let escaped = false;


        for (
            let i = start;
            i < cleaned.length;
            i++
        ) {

            const char =
                cleaned[i];


            // ------------------------------------------
            // Inside JSON string
            // ------------------------------------------

            if (inString) {

                if (escaped) {

                    escaped = false;

                    continue;

                }


                if (char === "\\") {

                    escaped = true;

                    continue;

                }


                if (char === '"') {

                    inString = false;

                }

                continue;

            }


            // ------------------------------------------
            // Start JSON string
            // ------------------------------------------

            if (char === '"') {

                inString = true;

                continue;

            }


            // ------------------------------------------
            // JSON object depth
            // ------------------------------------------

            if (char === "{") {

                depth++;

            }

            else if (char === "}") {

                depth--;

            }


            // ------------------------------------------
            // Complete JSON object
            // ------------------------------------------

            if (depth === 0) {

                const candidate =
                    cleaned
                        .substring(
                            start,
                            i + 1
                        )
                        .trim();


                candidates.push(
                    candidate
                );

                break;

            }

        }

    }


    // ==================================================
    // METHOD 3
    // Try candidates
    // ==================================================

    for (const candidate of candidates) {

        // ----------------------------------------------
        // First: normal JSON
        // ----------------------------------------------

        try {

            const parsed =
                JSON.parse(candidate);


            if (
                parsed &&
                Array.isArray(parsed.steps)
            ) {

                return parsed;

            }

        } catch (error) {

            // Try repair below

        }


        // ----------------------------------------------
        // Second: repaired JSON
        // ----------------------------------------------

        try {

            const repaired =
                repairJsonText(candidate);


            const parsed =
                JSON.parse(repaired);


            if (
                parsed &&
                Array.isArray(parsed.steps)
            ) {

                console.log(
                    "Gemini JSON repaired successfully."
                );

                return parsed;

            }

        } catch (error) {

            // Continue searching

        }

    }


    // ==================================================
// METHOD 4
// Try complete cleaned response
// ==================================================

try {

    const parsed =
        JSON.parse(cleaned);

    if (
        parsed &&
        Array.isArray(parsed.steps)
    ) {

        console.log(
            "Gemini complete response parsed successfully."
        );

        return parsed;

    }

} catch (error) {

    console.log(
        "Direct JSON parse failed:",
        error.message
    );

}

try {

    const repaired = repairJsonText(cleaned);

    console.log(
        "========== REPAIRED CONCEPT JSON =========="
    );

    console.log(repaired);

    console.log(
        "============================================"
    );

    const parsed = JSON.parse(repaired);

    if (
        parsed &&
        Array.isArray(parsed.steps)
    ) {

        console.log(
            "Gemini complete response repaired successfully."
        );

        return parsed;
    }

} catch (error) {

    console.log(
        "Repaired JSON parse failed:",
        error.message
    );

}

    return null;

}


// ==================================================
// MAIN
// ==================================================

export async function splitTeachingConcepts(
    teachingSteps,
    accountId
) {

    console.log("================================");
    console.log("Splitting Teaching Concepts...");
    console.log("================================");


    // ==================================================
    // BUILD PROMPT
    // ==================================================

    const prompt =
        await ConceptSplitPromptBuilder.build(
            teachingSteps
        );


    // ==================================================
// GEMINI RESPONSE WITH RETRY
// ==================================================

const MAX_RETRIES = 3;

let json = null;
let raw = "";

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

    console.log("================================");
    console.log(
        `Concept Generation Attempt ${attempt}/${MAX_RETRIES}`
    );
    console.log("================================");

    try {

        raw = await generateNarrationPlaywright(
            prompt,
            accountId
        );

        console.log(
            "========== RAW CONCEPTS =========="
        );

        console.log(raw);

        console.log(
            "=================================="
        );

        // ==================================================
        // EXTRACT VALID JSON
        // ==================================================

        json = extractValidConceptJSON(raw);

        // ==================================================
        // CHECK JSON
        // ==================================================

        if (json) {

            console.log(
                `✅ Concept JSON valid on attempt ${attempt}`
            );

            break;
        }

        console.log(
            `❌ Concept JSON invalid on attempt ${attempt}`
        );

    } catch (error) {

        console.log(
            `❌ Concept generation attempt ${attempt} failed:`
        );

        console.log(error.message);

    }

    // ==================================================
    // RETRY
    // ==================================================

    if (attempt < MAX_RETRIES) {

        console.log(
            "🔄 Retrying SAME concept generation..."
        );

        await new Promise(resolve =>
            setTimeout(resolve, 3000)
        );

    }

}

// ==================================================
// ALL RETRIES FAILED
// ==================================================

if (!json) {

    console.error(
        "================================="
    );

    console.error(
        "❌ CONCEPT GENERATION FAILED"
    );

    console.error(
        `All ${MAX_RETRIES} attempts failed.`
    );

    console.error(
        "================================="
    );

    throw new Error(
        "Invalid Concept JSON returned by Gemini after all retries."
    );
}


    if (
        !json.steps ||
        !Array.isArray(json.steps)
    ) {

        throw new Error(
            "Concept Steps missing."
        );

    }


    // ==================================================
    // VALIDATE EACH STEP
    // ==================================================

    for (
        let i = 0;
        i < json.steps.length;
        i++
    ) {

        const step =
            json.steps[i];


        if (
            !step ||
            typeof step !== "object"
        ) {

            throw new Error(
                `Invalid concept step at index ${i}.`
            );

        }


        if (
            step.step === undefined ||
            step.type === undefined ||
            typeof step.text !== "string"
        ) {

            throw new Error(
                `Invalid concept step structure at index ${i}.`
            );

        }

    }


    // ==================================================
    // FINAL CONCEPTS
    // ==================================================

    console.log(
        `Concept Steps : ${json.steps.length}`
    );


    console.log(
        "========== FINAL CONCEPTS =========="
    );


    console.log(
        JSON.stringify(
            json.steps,
            null,
            2
        )
    );


    console.log(
        "===================================="
    );


    return json;

}