import { splitVisualScenes } from "../scenes/splitVisualScenes.js";
import { generateScene } from "./generateScene.js";

export async function generateScenePlan(
    teachingPlan,
    accountId
) {

    console.log("Generating Scene Plan...");

    // Step 1
    const visualScenes =
        splitVisualScenes(teachingPlan);

    console.log(
        `Visual Steps : ${visualScenes.length}`
    );

    const scenes = [];

    // Step 2
    for (let i = 0; i < visualScenes.length; i++) {

        console.log(
            `Generating Scene ${i + 1}/${visualScenes.length}`
        );

        const visual =
            visualScenes[i];

        const aiScene =
            await generateScene(
                visual,
                accountId
            );

        scenes.push({

            scene: i + 1,

            heading:
                aiScene.heading,

            displayText:
                visual.text,

            narration:
                aiScene.narration,

            imagePrompt:
                aiScene.imagePrompt,

            duration:
                aiScene.duration || 4

        });

    }

    console.log(
        `Generated ${scenes.length} scenes`
    );

    return {
        scenes
    };

}