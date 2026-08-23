import VisualCardPromptBuilder from "../../services/PromptBuilder/VisualCardPromptBuilder.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";

export async function generateVisualCards(
    tutorial,
    accountId
) {

    console.log("================================");
    console.log("Generating Visual Cards...");
    console.log("================================");

    const prompt =
        await VisualCardPromptBuilder.build(
            tutorial
        );

    const raw =
        await generateNarrationPlaywright(
            prompt,
            accountId
        );

    console.log("========== RAW VISUAL CARDS ==========");
    console.log(raw);
    console.log("======================================");

    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1 || end === -1) {
        throw new Error("Visual Cards JSON not found.");
    }

    const jsonText = raw
        .substring(start, end + 1)
        .trim()
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "");

    const json = JSON.parse(jsonText);

    if (
        !json.cards ||
        !Array.isArray(json.cards)
    ) {
        throw new Error("Visual Cards not found.");
    }

    console.log(
        `Generated ${json.cards.length} Visual Cards`
    );

    console.log("========== FINAL VISUAL CARDS ==========");
    console.log(
        JSON.stringify(json.cards, null, 2)
    );
    console.log("========================================");

    return json.cards;

}