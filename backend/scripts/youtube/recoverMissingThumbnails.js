import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateThumbnail } from "../gemini/generateThumbnail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "../../");

const CHAPTERS = [
    "PAIR OF LINEAR EQUATIONS IN TWO VARIABLES",
    "QUADRATIC EQUATIONS"
];

const LANGUAGES = [
    {
        code: "en",
        videoRoot: path.join(
            ROOT_DIR,
            "generated",
            "videos",
            "class-10",
            "Mathematics"
        )
    },
    {
        code: "hi",
        videoRoot: path.join(
            ROOT_DIR,
            "generated",
            "video-hi",
            "class-10",
            "Mathematics"
        )
    }
];


// ==================================================
// GET ALL tutorial.mp4 FILES
// ==================================================

function findTutorialVideos(chapterPath) {

    if (!fs.existsSync(chapterPath)) {
        return [];
    }

    const results = [];

    function scan(currentPath) {

        const entries =
            fs.readdirSync(
                currentPath,
                { withFileTypes: true }
            );

        for (const entry of entries) {

            const fullPath =
                path.join(
                    currentPath,
                    entry.name
                );

            if (entry.isDirectory()) {

                scan(fullPath);

                continue;
            }

            if (
                entry.isFile() &&
                entry.name.toLowerCase() ===
                "tutorial.mp4"
            ) {

                results.push(fullPath);

            }

        }

    }

    scan(chapterPath);

    return results;
}


// ==================================================
// PARSE TUTORIAL FOLDER
// ==================================================

function parseTutorialFolder(folderName) {

    /*
        Examples:

        3.1-EXERCISE 3.1
        4.1-Introduction
        4.2(A)-Example 1
        4.3(B)-Example 2
        4.5-Summary
        Introduction
    */

    const match =
        folderName.match(
            /^(\d+(?:\.\d+)*(?:\([A-Z]\))?)-(.*)$/
        );

    if (!match) {

        return {
            sectionNumber: "",
            title: folderName.trim()
        };

    }

    return {

        sectionNumber:
            match[1].trim(),

        title:
            match[2].trim()

    };

}


// ==================================================
// CHECK THUMBNAIL
// ==================================================

function getThumbnailPath(videoPath) {

    const tutorialFolder =
        path.dirname(videoPath);

    return path.join(
        tutorialFolder,
        "thumbnail.png"
    );

}


// ==================================================
// MAIN
// ==================================================

async function recoverThumbnails() {

    console.log("");
    console.log("==============================================");
    console.log("       THUMBNAIL RECOVERY START");
    console.log("==============================================");
    console.log("");

    let totalVideos = 0;
    let existing = 0;
    let generated = 0;
    let failed = 0;

    for (const language of LANGUAGES) {

        console.log("");
        console.log("----------------------------------------------");
        console.log(
            `LANGUAGE: ${language.code}`
        );
        console.log("----------------------------------------------");

        for (const chapterName of CHAPTERS) {

            const chapterPath =
                path.join(
                    language.videoRoot,
                    chapterName
                );

            console.log("");
            console.log(
                "CHAPTER:",
                chapterName
            );

            const videos =
                findTutorialVideos(
                    chapterPath
                );

            console.log(
                "Videos Found:",
                videos.length
            );

            for (const videoPath of videos) {

                totalVideos++;

                const tutorialFolder =
                    path.basename(
                        path.dirname(videoPath)
                    );

                const thumbnailPath =
                    getThumbnailPath(
                        videoPath
                    );

                // ----------------------------------
                // Already exists
                // ----------------------------------

                if (
                    fs.existsSync(
                        thumbnailPath
                    )
                ) {

                    existing++;

                    console.log(
                        "SKIP:",
                        tutorialFolder,
                        `(${language.code})`
                    );

                    continue;

                }

                // ----------------------------------
                // Parse title
                // ----------------------------------

                const parsed =
                    parseTutorialFolder(
                        tutorialFolder
                    );

                console.log("");
                console.log(
                    "Generating:",
                    tutorialFolder
                );

                console.log(
                    "Language:",
                    language.code
                );

                console.log(
                    "Section:",
                    parsed.sectionNumber ||
                    "(none)"
                );

                console.log(
                    "Title:",
                    parsed.title
                );

                // ----------------------------------
                // Narration JSON
                // ----------------------------------

                const narrationJson = {

                    title:
                        parsed.title,

                    sectionNumber:
                        parsed.sectionNumber,

                    chapterName,

                    className:
                        "class-10",

                    subject:
                        "Mathematics"

                };

                // ----------------------------------
                // Generate
                // ----------------------------------

                try {

                    await generateThumbnail(
                        narrationJson,
                        1
                    );

                    if (
                        fs.existsSync(
                            thumbnailPath
                        )
                    ) {

                        generated++;

                        console.log(
                            "SUCCESS:",
                            thumbnailPath
                        );

                    } else {

                        failed++;

                        console.log(
                            "FAILED: Thumbnail file not created"
                        );

                    }

                } catch (error) {

                    failed++;

                    console.log("");
                    console.log(
                        "THUMBNAIL GENERATION FAILED:"
                    );

                    console.error(
                        error?.message ||
                        error
                    );

                    console.log(
                        "Continuing with next video..."
                    );

                }

            }

        }

    }

    console.log("");
    console.log("==============================================");
    console.log("       THUMBNAIL RECOVERY COMPLETED");
    console.log("==============================================");

    console.log(
        "Total Videos:",
        totalVideos
    );

    console.log(
        "Already Existing:",
        existing
    );

    console.log(
        "Newly Generated:",
        generated
    );

    console.log(
        "Failed:",
        failed
    );

    console.log("==============================================");
    console.log("");

}


recoverThumbnails();