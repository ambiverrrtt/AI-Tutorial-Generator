import fs from "fs";
import path from "path";
import { createScene } from "./createScene.js";

export async function createTutorial(jsonPath) {

    // Read narration JSON
    const data = JSON.parse(
        await fs.promises.readFile(
            jsonPath,
            "utf8"
        )
    );

    const title = data.title;

    console.log("Tutorial:", title);

    // Images folder
    const imageFolder = path.resolve(
    "../playwright/generated/images",
    title
);

    // Output folder
    const outputFolder = path.resolve(
    "../playwright/generated/scenes",
    title
);

    await fs.promises.mkdir(
        outputFolder,
        { recursive: true }
    );

    for (const scene of data.scenes) {

        const imageName =
            String(scene.scene).padStart(2, "0") + ".png";

        const imagePath = path.join(
            imageFolder,
            imageName
        );

        console.log("Image Folder:", imageFolder);
console.log("Image Name:", imageName);
console.log("Image Path:", imagePath);

        const outputPath = path.join(
            outputFolder,
            `scene-${scene.scene}.png`
        );

        console.log(
            "Creating Scene",
            scene.scene
        );

        console.log(
    "Exists:",
    fs.existsSync(imagePath)
);


        await createScene(
            imagePath,
            scene.narration,
            outputPath
        );

        console.log(
            "Saved:",
            outputPath
        );
    }

    console.log("Tutorial scenes created successfully.");
}