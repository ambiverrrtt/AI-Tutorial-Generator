import ConceptExtractorPromptBuilder from "../../services/PromptBuilder/ConceptExtractorPromptBuilder.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";

export async function generateConcepts(
    tutorial,
    accountId
) {

    console.log("================================");
    console.log("Extracting Concepts...");
    console.log("================================");

    const prompt =
        await ConceptExtractorPromptBuilder.build(
            tutorial
        );

    const raw =
        await generateNarrationPlaywright(
            prompt,
            accountId
        );

    console.log("========== RAW CONCEPTS ==========");
    console.log(raw);
    console.log("==================================");

    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1 || end === -1) {

        throw new Error("Concept JSON not found.");

    }

    const jsonText = raw
        .substring(start, end + 1)
        .trim()
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "");

    const json = JSON.parse(jsonText);

    if (
        !json.concepts ||
        !Array.isArray(json.concepts)
    ) {

        throw new Error(
            "Concepts not found."
        );

    }

    console.log(
        `Extracted ${json.concepts.length} Concepts`
    );
console.log("========== FINAL CONCEPTS ==========");
console.log(JSON.stringify(json.concepts, null, 2));
console.log("====================================");
    return json.concepts;

}