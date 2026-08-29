import MainIdeaPromptBuilder from "../../services/PromptBuilder/MainIdeaPromptBuilder.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";

export async function generateMainIdea(
    concepts,
    accountId
) {

    console.log("================================");
    console.log("Generating Main Idea...");
    console.log("================================");

    const prompt =
        await MainIdeaPromptBuilder.build(
            concepts
        );

    const raw =
        await generateNarrationPlaywright(
            prompt,
            accountId
        );

    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1 || end === -1) {
        throw new Error("Main Idea JSON not found.");
    }

    let cleanedJson = raw
    .substring(start, end + 1)
    .trim()
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");

// Fix raw line breaks inside JSON string values
cleanedJson = cleanedJson.replace(
    /"idea"\s*:\s*"([\s\S]*?)"/g,
    (match, value) => {
        const fixedValue = value
            .replace(/\r?\n+/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();

        return `"idea": "${fixedValue}"`;
    }
);

let json;

try {

    json = JSON.parse(cleanedJson);

    console.log("✅ Main Idea JSON parsed successfully.");

} catch (error) {

    console.log("❌ Main Idea JSON Parse Failed:");
    console.log(error.message);

    console.log("========== CLEANED JSON ==========");
    console.log(cleanedJson);
    console.log("==================================");

    throw error;
}

return json.mainIdeas
    .map(item => item.idea)
    .filter(Boolean);
}