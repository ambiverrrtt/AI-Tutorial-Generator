import ScenePromptBuilder from "../../services/PromptBuilder/ScenePromptBuilder.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";

function validateScene(scene) {

    if (!scene) return false;

    const required = [
        "heading",
        "narration",
        "imagePrompt"
    ];

    for (const key of required) {

        if (
            scene[key] === undefined ||
            scene[key] === null ||
            scene[key].toString().trim() === ""
        ) {

            console.log(`Scene missing field: ${key}`);
            return false;

        }

    }

    return true;

}

export async function generateScene(scene, accountId) {

    const prompt =
        await ScenePromptBuilder.build(scene);

    const MAX_RETRY = 3;
    let retry = 0;

    while (retry < MAX_RETRY) {

        try {

            const raw =
                await generateNarrationPlaywright(
                    prompt,
                    accountId
                );

            console.log("========== RAW SCENE ==========");
            console.log(raw);
            console.log("===============================");

            const start = raw.indexOf("{");
            const end = raw.lastIndexOf("}");

            if (start === -1 || end === -1) {
                throw new Error("Scene JSON not found.");
            }

            let jsonText =
                raw.substring(start, end + 1)
                    .trim();

            jsonText = jsonText
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .replace(/\\(?!["\\/bfnrtu])/g, "\\\\");

            const aiScene =
                JSON.parse(jsonText);

            if (!validateScene(aiScene)) {
                throw new Error("Scene validation failed.");
            }

            return aiScene;

        }
        catch (err) {

            retry++;

            console.log(
                `Scene Retry ${retry}/${MAX_RETRY}`
            );

            console.error(err);

            if (retry >= MAX_RETRY) {
                throw err;
            }

        }

    }

}