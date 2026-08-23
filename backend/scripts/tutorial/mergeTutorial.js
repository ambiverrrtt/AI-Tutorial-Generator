import fs from "fs";
import path from "path";
import { exec } from "child_process";

export async function mergeTutorial(narrationJson, language = "en") {

    console.log(
        `Merging Tutorial : ${narrationJson.title}`
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

   const videoFolder = path.join(
    "generated",
    language === "hi"
        ? "video-hi"
        : "videos",
    narrationJson.className,
    narrationJson.subject,
    safeChapterName,
    folderName
);

if (fs.existsSync(videoFolder)) {
    console.log(
        "Files in videoFolder:",
        fs.readdirSync(videoFolder)
    );
}

const outputFile = 
    `tutorial.mp4`

    const listFile = path.join(
        videoFolder,
        "files.txt"
    );

   const introVideo = path.join(
    process.cwd(),
    "assets",
    "videos",
    "intro_fixed.mp4"
);

const outroVideo = path.join(
    process.cwd(),
    "assets",
    "videos",
    "outro_fixed.mp4"
);

    const sceneFiles = [];

    sceneFiles.push(
    `file '${introVideo.replace(/\\/g,"/")}'`
);


    // Validate all scene videos exist

const videoFiles = fs
    .readdirSync(videoFolder)
    .filter(file =>
        file.startsWith("scene") &&
        file.endsWith(".mp4")
    );

if (videoFiles.length !== narrationJson.scenes.length) {

    throw new Error(

        `Scene Videos Missing (${videoFiles.length}/${narrationJson.scenes.length})`

    );

}

    for (const scene of narrationJson.scenes) {

        sceneFiles.push(
            `file 'scene${scene.scene}.mp4'`
        );

    }

    sceneFiles.push(
    `file '${outroVideo.replace(/\\/g,"/")}'`
);

    await fs.promises.writeFile(
        listFile,
        sceneFiles.join("\n")
    );

    await new Promise((resolve, reject) => {
const command =
`ffmpeg -y -f concat -safe 0 -i "files.txt" -c copy "${outputFile}"`;
console.log(command);

exec(
    command,
    {
        cwd: videoFolder
    },
    (error, stdout, stderr) => {

        console.log("stdout",stdout);
        console.log("stderr",stderr);

        if (error) {
            reject(error);
            return;
        }

        resolve();

    }
);

    });

    console.log(
        "Tutorial Created:",
        outputFile
    );

}