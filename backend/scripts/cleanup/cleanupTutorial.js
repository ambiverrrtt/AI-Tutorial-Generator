import fs from "fs";
import path from "path";
import { loadUploadJobs } from "../uploads/uploadManager.js";

export async function cleanupTutorial({
    className,
    subject,
    chapterName,
    tutorialTitle,
    folderName
}) {

    console.log("\n========================================");
    console.log("CHECKING TUTORIAL CLEANUP");
    console.log("Tutorial:", tutorialTitle);
    console.log("Folder:", folderName);
    console.log("========================================");

    const jobs = loadUploadJobs();

    // ---------------------------------
    // Create exact job IDs
    // ---------------------------------

    const englishJobId =
        `${className}_${subject}_${chapterName}_${tutorialTitle}_en`;

    const hindiJobId =
        `${className}_${subject}_${chapterName}_${tutorialTitle}_hi`;

    // ---------------------------------
    // Check ONLY whether job exists
    // Status is intentionally ignored
    // ---------------------------------

    const englishJob = jobs.find(
        job => job.jobId === englishJobId
    );

    const hindiJob = jobs.find(
        job => job.jobId === hindiJobId
    );

    console.log(
        "English Upload Job:",
        englishJob ? "FOUND" : "NOT FOUND"
    );

    console.log(
        "Hindi Upload Job:",
        hindiJob ? "FOUND" : "NOT FOUND"
    );

    // ---------------------------------
    // Safety check
    // ---------------------------------

    if (!englishJob || !hindiJob) {

        console.log(
            "Cleanup SKIPPED."
        );

        console.log(
            "Both English and Hindi upload jobs are required."
        );

        return false;
    }

    console.log(
        "Both upload jobs found."
    );

    console.log(
        "Job status is ignored."
    );

    // =================================
    // IMAGE FOLDER
    // =================================

    const imageFolder = path.join(
        "generated",
        "images",
        className,
        subject,
        chapterName,
        folderName
    );

    if (fs.existsSync(imageFolder)) {

        const files =
            await fs.promises.readdir(imageFolder);

        for (const file of files) {

            // KEEP THUMBNAIL
            if (
                file.toLowerCase() ===
                "thumbnail.png"
            ) {
                console.log(
                    "Keeping thumbnail.png"
                );

                continue;
            }

            const filePath =
                path.join(imageFolder, file);

            await fs.promises.rm(
                filePath,
                {
                    recursive: true,
                    force: true
                }
            );

            console.log(
                "Deleted Image:",
                file
            );
        }
    }

    // =================================
    // ENGLISH AUDIO
    // =================================

    const englishAudioFolder = path.join(
        "generated",
        "audio",
        className,
        subject,
        chapterName,
        folderName
    );

    await deleteFolder(
        englishAudioFolder,
        "English Audio"
    );

    // =================================
    // HINDI AUDIO
    // =================================

    const hindiAudioFolder = path.join(
        "generated",
        "audio-hi",
        className,
        subject,
        chapterName,
        folderName
    );

    await deleteFolder(
        hindiAudioFolder,
        "Hindi Audio"
    );

    // =================================
    // ENGLISH SCENE VIDEOS
    // =================================

    const englishVideoFolder = path.join(
        "generated",
        "videos",
        className,
        subject,
        chapterName,
        folderName
    );

    await deleteSceneFiles(
        englishVideoFolder,
        "English"
    );

    // =================================
    // HINDI SCENE VIDEOS
    // =================================

    const hindiVideoFolder = path.join(
        "generated",
        "video-hi",
        className,
        subject,
        chapterName,
        folderName
    );

    await deleteSceneFiles(
        hindiVideoFolder,
        "Hindi"
    );

    console.log("\n========================================");
    console.log("TUTORIAL CLEANUP COMPLETED");
    console.log("========================================\n");

    return true;
}


// =================================
// Delete complete folder
// =================================

async function deleteFolder(folder, name) {

    if (!fs.existsSync(folder)) {

        console.log(
            `${name} folder not found.`
        );

        return;
    }

    await fs.promises.rm(
        folder,
        {
            recursive: true,
            force: true
        }
    );

    console.log(
        `Deleted ${name} folder`
    );
}


// =================================
// Delete scene files
// KEEP tutorial.mp4
// =================================

async function deleteSceneFiles(folder, language) {

    if (!fs.existsSync(folder)) {

        console.log(
            `${language} video folder not found.`
        );

        return;
    }

    const files =
        await fs.promises.readdir(folder);

    for (const file of files) {

        // KEEP FINAL VIDEO
        if (
            file.toLowerCase() ===
            "tutorial.mp4"
        ) {

            console.log(
                `Keeping ${language} tutorial.mp4`
            );

            continue;
        }

        const filePath =
            path.join(folder, file);

        await fs.promises.rm(
            filePath,
            {
                recursive: true,
                force: true
            }
        );

        console.log(
            `Deleted ${language} file:`,
            file
        );
    }
}