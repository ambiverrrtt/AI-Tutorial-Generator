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

    const json = JSON.parse(
        raw
            .substring(start, end + 1)
            .trim()
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
    );

return json.mainIdeas
    .map(item => item.idea)
    .filter(Boolean);
}