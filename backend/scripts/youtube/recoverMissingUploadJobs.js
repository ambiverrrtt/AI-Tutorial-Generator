import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { saveUploadJob } from "../uploads/uploadManager.js";

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
        ),

        thumbnailRoot: path.join(
            ROOT_DIR,
            "generated",
            "images",
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
        ),

        thumbnailRoot: path.join(
            ROOT_DIR,
            "generated",
            "images",
            "class-10",
            "Mathematics"
        )
    }
];

const CLASS_NAME = "class-10";
const SUBJECT = "Mathematics";


// ==================================================
// GET TUTORIAL TITLE
// ==================================================

function getTutorialTitle(folderName) {

    const separatorIndex =
        folderName.indexOf("-");

    if (separatorIndex === -1) {
        return folderName.trim();
    }

    return folderName
        .substring(separatorIndex + 1)
        .trim();
}


// ==================================================
// FIND ALL tutorial.mp4 FILES
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
// FIND THUMBNAIL
// ==================================================

function findThumbnail(videoPath) {

    const tutorialFolder =
        path.dirname(videoPath);

    const thumbnailPath =
        path.join(
            tutorialFolder,
            "thumbnail.png"
        );

    if (fs.existsSync(thumbnailPath)) {
        return thumbnailPath;
    }

    return "";
}


// ==================================================
// CREATE JOB ID
// ==================================================

function createJobId({
    className,
    subject,
    chapterName,
    tutorialTitle,
    language
}) {

    return [
        className,
        subject,
        chapterName,
        tutorialTitle,
        language
    ].join("_");
}


// ==================================================
// MAIN
// ==================================================

async function recoverJobs() {

    console.log("");
    console.log("==============================================");
    console.log("       RECOVER MISSING UPLOAD JOBS");
    console.log("==============================================");
    console.log("");

    let totalFound = 0;
    let added = 0;
    let skipped = 0;
    let thumbnailMissing = 0;

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
                "Chapter:",
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

            totalFound += videos.length;

            for (const videoPath of videos) {

                const tutorialFolder =
                    path.basename(
                        path.dirname(videoPath)
                    );

                const tutorialTitle =
                    getTutorialTitle(
                        tutorialFolder
                    );

                const jobId =
                    createJobId({

                        className:
                            CLASS_NAME,

                        subject:
                            SUBJECT,

                        chapterName,

                        tutorialTitle,

                        language:
                            language.code

                    });

                const thumbnailPath =
                    findThumbnail(
                        videoPath
                    );

                if (!thumbnailPath) {

                    console.log(
                        "THUMBNAIL NOT FOUND:",
                        tutorialTitle
                    );

                    thumbnailMissing++;

                }

                const job = {

                    jobId,

                    className:
                        CLASS_NAME,

                    subject:
                        SUBJECT,

                    chapterName,

                    tutorialTitle,

                    language:
                        language.code,

                    videoPath:
                        path.relative(
                            ROOT_DIR,
                            videoPath
                        ),

                    thumbnailPath:
                        thumbnailPath
                            ? path.relative(
                                ROOT_DIR,
                                thumbnailPath
                            )
                            : "",

                    status:
                        "pending",

                    retryCount:
                        0,

                    createdAt:
                        new Date().toISOString()

                };

                try {

                    await saveUploadJob(job);

                    added++;

                    console.log(
                        "ADDED:",
                        tutorialTitle,
                        `(${language.code})`
                    );

                } catch (error) {

                    console.error(
                        "FAILED:",
                        tutorialTitle
                    );

                    console.error(
                        error.message
                    );

                }

            }

        }

    }

    console.log("");
    console.log("==============================================");
    console.log("       RECOVERY COMPLETED");
    console.log("==============================================");

    console.log(
        "Total Videos Found:",
        totalFound
    );

    console.log(
        "Jobs Added:",
        added
    );

    console.log(
        "Skipped:",
        skipped
    );

    console.log(
        "Missing Thumbnails:",
        thumbnailMissing
    );

    console.log("==============================================");
    console.log("");

}


recoverJobs()
    .catch(error => {

        console.error("");
        console.error(
            "RECOVERY FAILED"
        );

        console.error(
            error.message
        );

        console.error("");

        process.exit(1);

    });