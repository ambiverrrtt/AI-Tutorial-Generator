import fs from "fs/promises";
import path from "path";
import { generateImage } from "./generateImage.js";

export async function generateChapter(jsonFilePath) {

    // JSON Read
    const file = await fs.readFile(jsonFilePath, "utf8");

    const data = JSON.parse(file);

    const folderName = data.tutorialTitle
        .replace(/[<>:"/\\|?*]/g, "")
        .trim();

    console.log("Tutorial:", folderName);

    for (const image of data.images) {

        console.log("----------------------------------");
        console.log("Scene:", image.scene);

        const fileName =
            String(image.scene).padStart(2, "0") + ".png";

        const imagePath = await generateImage(
            image.prompt,
            folderName,
            fileName
        );

        console.log("Saved:", imagePath);
    }

    console.log("----------------------------------");
    console.log("All Images Generated Successfully");
}