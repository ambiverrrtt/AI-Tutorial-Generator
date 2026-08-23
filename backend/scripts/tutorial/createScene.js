import fs from "fs";
import path from "path";
import { renderScene } from "./renderScene.js";

export async function createScenes(narrationJson, language = "en") {

    console.log(
        `Creating Scenes : ${narrationJson.title}`
    );

   const cleanTitle = narrationJson.title
 .replace(/^\d+(\.\d+)*(\([A-Z]\))?\s*/, "");

const safeTitle = cleanTitle
    .replace(/⁰/g, "0")
    .replace(/¹/g, "1")
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .replace(/⁴/g, "4")
    .replace(/⁵/g, "5")
    .replace(/⁶/g, "6")
    .replace(/⁷/g, "7")
    .replace(/⁸/g, "8")
    .replace(/⁹/g, "9")
    .replace(/ⁿ/g, "n")
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi");
    
const folderName = (
    narrationJson.sectionNumber
        ? `${narrationJson.sectionNumber}-${safeTitle}`
        : safeTitle
)
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();

const safeChapterName = String(narrationJson.chapterName || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const outputFolder = path.join(
    "generated",
    language === "hi"
        ? "video-hi"
        : "videos",
    narrationJson.className,
    narrationJson.subject,
safeChapterName,
    folderName
);

    await fs.promises.mkdir(
        outputFolder,
        {
            recursive: true
        }
    );

    for (const scene of narrationJson.scenes) {

        const fileName =
            String(scene.scene).padStart(2, "0");

      const imagePath = path.resolve(
    "generated",
    "images",
    narrationJson.className,
    narrationJson.subject,
    safeChapterName,
    folderName,
    `${fileName}.png`
);

console.log("Image Path:", imagePath);
console.log("Image Exists:", fs.existsSync(imagePath));

       const audioPath = path.join(
    "generated",
    language === "hi"
        ? "audio-hi"
        : "audio",
    narrationJson.className,
    narrationJson.subject,
    safeChapterName,
    folderName,
    `${fileName}.wav`
);

        const outputPath = path.join(
            outputFolder,
            `scene${scene.scene}.mp4`
        );

        // Skip if scene video already exists

if (fs.existsSync(outputPath)) {

    console.log(`scene${scene.scene}.mp4 Already Exists`);

    continue;

}

        console.log(
            `Creating Scene ${scene.scene}`
        );

        await renderScene(
            imagePath,
            audioPath,
            outputPath
        );

    }

    console.log(
        "All Scene Videos Created."
    );

    console.log("RETURNING FROM createScenes");

return;

}