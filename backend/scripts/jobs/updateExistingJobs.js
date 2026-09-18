import fs from "fs";
import path from "path";

const JOB_FOLDER = path.join(
    "generated",
    "jobs"
);

const TOPICS_FOLDER = path.join(
    "generated",
    "topics"
);


// ========================================
// Normalize Path
// ========================================

function normalizePath(filePath) {

    return String(filePath || "")
        .replace(/\\/g, "/")
        .toLowerCase()
        .trim();

}


// ========================================
// Get PDF File Name
// ========================================

function getPdfFileName(filePath) {

    return path
        .basename(
            normalizePath(filePath)
        );

}


// ========================================
// Find All Topic JSON Files
// ========================================

function findTopicFiles(folder) {

    const files = [];

    if (!fs.existsSync(folder)) {
        return files;
    }

    const entries =
        fs.readdirSync(
            folder,
            { withFileTypes: true }
        );

    for (const entry of entries) {

        const fullPath =
            path.join(
                folder,
                entry.name
            );

        if (entry.isDirectory()) {

            files.push(
                ...findTopicFiles(fullPath)
            );

        } else if (
            entry.isFile() &&
            entry.name.endsWith(".json")
        ) {

            files.push(fullPath);

        }

    }

    return files;

}


// ========================================
// Main
// ========================================

function updateExistingJobs() {

    console.log(
        "\n========================================"
    );

    console.log(
        "Updating Existing Jobs..."
    );

    console.log(
        "========================================\n"
    );


    if (!fs.existsSync(JOB_FOLDER)) {

        console.log(
            "Jobs folder not found."
        );

        return;

    }


    // ----------------------------------------
    // Load Topic JSON files
    // ----------------------------------------

    const topicFiles =
        findTopicFiles(
            TOPICS_FOLDER
        );

    console.log(
        `Found ${topicFiles.length} topic JSON files.`
    );


    // ----------------------------------------
    // Create PDF → Topic Map
    // ----------------------------------------

    const topicMap =
        new Map();


    for (const topicFile of topicFiles) {

        try {

            const data =
                JSON.parse(
                    fs.readFileSync(
                        topicFile,
                        "utf8"
                    )
                );


            if (!data.pdfPath) {

                continue;

            }


            const pdfPath =
                normalizePath(
                    data.pdfPath
                );


            const pdfFileName =
                getPdfFileName(
                    data.pdfPath
                );


            const relativeTopicFile =
                path
                    .relative(
                        process.cwd(),
                        topicFile
                    )
                    .replace(/\\/g, "/");


            const topicInfo = {

                chapterName:
                    data.chapterName,

                className:
                    data.className,

                subjectName:
                    data.subjectName,

                pdfPath:
                    data.pdfPath,

                topicFile:
                    relativeTopicFile

            };


            // Exact PDF path
            topicMap.set(
                pdfPath,
                topicInfo
            );


            // PDF filename fallback
            topicMap.set(
                `filename:${pdfFileName}`,
                topicInfo
            );


        } catch (error) {

            console.log(
                `Failed to read topic file: ${topicFile}`
            );

            console.log(
                error.message
            );

        }

    }


    // ----------------------------------------
    // Load Jobs
    // ----------------------------------------

    const jobFiles =
        fs.readdirSync(
            JOB_FOLDER
        )
        .filter(
            file =>
                file.endsWith(".json")
        );


    console.log(
        `Found ${jobFiles.length} job files.\n`
    );


    let updated = 0;
    let skipped = 0;
    let notFound = 0;


    // ----------------------------------------
    // Update Jobs
    // ----------------------------------------

    for (const jobFile of jobFiles) {

        const jobPath =
            path.join(
                JOB_FOLDER,
                jobFile
            );


        try {

            const job =
                JSON.parse(
                    fs.readFileSync(
                        jobPath,
                        "utf8"
                    )
                );


            if (!job.pdfPath) {

                console.log(
                    `Skipping ${jobFile}: pdfPath missing`
                );

                skipped++;

                continue;

            }


            const normalizedPdfPath =
                normalizePath(
                    job.pdfPath
                );


            const pdfFileName =
                getPdfFileName(
                    job.pdfPath
                );


            // First try exact path
            let topicInfo =
                topicMap.get(
                    normalizedPdfPath
                );


            // If exact path doesn't match,
            // try PDF filename
            if (!topicInfo) {

                topicInfo =
                    topicMap.get(
                        `filename:${pdfFileName}`
                    );

            }


            if (!topicInfo) {

                console.log(
                    `❌ Topic not found for job: ${job.jobId}`
                );

                console.log(
                    `   PDF: ${job.pdfPath}`
                );

                notFound++;

                continue;

            }


            // ----------------------------------------
            // Update Job
            // ----------------------------------------

            job.chapterName =
                topicInfo.chapterName;

            job.topicFile =
                topicInfo.topicFile;


            // Keep existing class/subject
            // but fill them if missing
            if (!job.className) {

                job.className =
                    topicInfo.className;

            }


            if (!job.subject) {

                job.subject =
                    topicInfo.subjectName;

            }


            fs.writeFileSync(
                jobPath,
                JSON.stringify(
                    job,
                    null,
                    2
                ),
                "utf8"
            );


            console.log(
                `✅ Updated: ${job.jobId}`
            );

            console.log(
                `   Chapter: ${job.chapterName}`
            );

            console.log(
                `   Topic File: ${job.topicFile}`
            );


            updated++;


        } catch (error) {

            console.log(
                `❌ Failed to update job: ${jobFile}`
            );

            console.log(
                error.message
            );

        }

    }


    // ----------------------------------------
    // Summary
    // ----------------------------------------

    console.log(
        "\n========================================"
    );

    console.log(
        "Migration Completed"
    );

    console.log(
        "========================================"
    );

    console.log(
        `Updated   : ${updated}`
    );

    console.log(
        `Skipped   : ${skipped}`
    );

    console.log(
        `Not Found : ${notFound}`
    );

    console.log(
        "========================================\n"
    );

}


updateExistingJobs();