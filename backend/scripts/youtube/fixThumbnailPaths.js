import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "../../");

const UPLOAD_FILE = path.join(
    ROOT_DIR,
    "generated",
    "uploads",
    "uploadJobs.json"
);

const TARGET_CHAPTERS = [
    "PAIR OF LINEAR EQUATIONS IN TWO VARIABLES",
    "QUADRATIC EQUATIONS"
];

const TARGET_LANGUAGES = [
    "en",
    "hi"
];


// ==================================================
// MAIN
// ==================================================

function fixThumbnailPaths() {

    console.log("");
    console.log("==============================================");
    console.log("       FIX THUMBNAIL PATHS");
    console.log("==============================================");
    console.log("");

    if (!fs.existsSync(UPLOAD_FILE)) {

        throw new Error(
            `uploadJobs.json not found: ${UPLOAD_FILE}`
        );

    }

    const jobs =
        JSON.parse(
            fs.readFileSync(
                UPLOAD_FILE,
                "utf8"
            )
        );

    let updated = 0;
    let skipped = 0;

    for (const job of jobs) {

        // Only our two recovered chapters
        if (
            !TARGET_CHAPTERS.includes(
                job.chapterName
            )
        ) {
            continue;
        }

        // Only English + Hindi
        if (
            !TARGET_LANGUAGES.includes(
                job.language
            )
        ) {
            continue;
        }

        // Video path already tells us the tutorial folder
        if (!job.videoPath) {

            console.log(
                "Video path missing:",
                job.jobId
            );

            skipped++;

            continue;
        }

        const videoAbsolutePath =
            path.resolve(
                ROOT_DIR,
                job.videoPath
            );

        const tutorialFolder =
            path.basename(
                path.dirname(
                    videoAbsolutePath
                )
            );

        const thumbnailAbsolutePath =
            path.join(

                ROOT_DIR,

                "generated",

                "images",

                job.className,

                job.subject,

                job.chapterName,

                tutorialFolder,

                "thumbnail.png"

            );

        const thumbnailRelativePath =
            path.relative(
                ROOT_DIR,
                thumbnailAbsolutePath
            );

        if (
            job.thumbnailPath ===
            thumbnailRelativePath
        ) {

            skipped++;

            continue;

        }

        job.thumbnailPath =
            thumbnailRelativePath;

        updated++;

        console.log("");
        console.log(
            "UPDATED:",
            job.tutorialTitle,
            `(${job.language})`
        );

        console.log(
            "Thumbnail:",
            thumbnailRelativePath
        );

    }


    // ==================================================
    // SAVE
    // ==================================================

    fs.writeFileSync(

        UPLOAD_FILE,

        JSON.stringify(
            jobs,
            null,
            2
        ),

        "utf8"

    );


    console.log("");
    console.log("==============================================");
    console.log("       THUMBNAIL PATH UPDATE COMPLETE");
    console.log("==============================================");

    console.log(
        "Paths Updated:",
        updated
    );

    console.log(
        "Already Correct / Skipped:",
        skipped
    );

    console.log(
        "Total Jobs:",
        jobs.length
    );

    console.log("==============================================");
    console.log("");

}


fixThumbnailPaths();