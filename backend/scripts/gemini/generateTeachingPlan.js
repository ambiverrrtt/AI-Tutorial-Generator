import TeachingPlanPromptBuilder from "../../services/PromptBuilder/TeachingPlanPromptBuilder.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";

export async function generateTeachingPlan(teachingSteps, accountId) {

    console.log("Generating Teaching Plan...");

    const prompt =
        await TeachingPlanPromptBuilder.build(teachingSteps);
// console.log("=========== PROMPT SENT TO GEMINI ===========");
// console.log(prompt);
// console.log("=============================================");

  const rawResponse =
        await generateNarrationPlaywright(
            prompt,
            accountId
        );
console.log("\n========== RAW TEACHING PLAN RESPONSE ==========\n");
console.log(rawResponse);
console.log("\n===============================================\n");
    const start = rawResponse.indexOf("{");
    const end = rawResponse.lastIndexOf("}");

    if (start === -1 || end === -1) {
        throw new Error("No JSON found.");
    }

    const jsonText =
        rawResponse.substring(start, end + 1);

    const plan = JSON.parse(jsonText);

if (!plan.introduction)
    throw new Error("Teaching Plan: introduction missing");

if (!plan.given)
    throw new Error("Teaching Plan: given missing");

if (!plan.explanation)
    throw new Error("Teaching Plan: explanation missing");

if (!plan.solution)
    throw new Error("Teaching Plan: solution missing");

if (!plan.conclusion)
    throw new Error("Teaching Plan: conclusion missing");

if (!plan.thankYou)
    throw new Error("Teaching Plan: thankYou missing");

console.log("Teaching Plan Generated");

return plan;

}