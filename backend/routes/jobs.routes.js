import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_FOLDER = path.resolve(
    __dirname,
    "../generated/jobs"
);

// ==========================================
// GET ALL JOBS
// ==========================================

router.get("/", async (req, res) => {

    try {

        if (!fs.existsSync(JOBS_FOLDER)) {
            return res.json([]);
        }

        const files =
            await fs.promises.readdir(JOBS_FOLDER);

        const jsonFiles =
            files.filter(
                file => file.endsWith(".json")
            );

        const jobs = [];

        for (const file of jsonFiles) {

            try {

                const filePath =
                    path.join(
                        JOBS_FOLDER,
                        file
                    );

                const data =
                    await fs.promises.readFile(
                        filePath,
                        "utf8"
                    );

                const job =
                    JSON.parse(data);

                jobs.push(job);

            } catch (error) {

                console.error(
                    `Failed to read job file ${file}:`,
                    error.message
                );

            }
        }

        res.json(jobs);

    } catch (error) {

        console.error(
            "Failed to load jobs:",
            error.message
        );

        res.status(500).json({
            message: "Failed to load jobs"
        });
    }
});

// ========================================
// GET Topics For Job
// ========================================

router.get("/:jobId/topics", async (req, res) => {

    try {

        const { jobId } = req.params;

        // ----------------------------------------
        // Find Job
        // ----------------------------------------

        const jobFile =
            path.join(
                "generated",
                "jobs",
                `${jobId}.json`
            );

        if (!fs.existsSync(jobFile)) {

            return res.status(404).json({
                success: false,
                message: "Job not found."
            });

        }


        const job =
            JSON.parse(
                await fs.promises.readFile(
                    jobFile,
                    "utf8"
                )
            );


        // ----------------------------------------
        // Check Topic File
        // ----------------------------------------

        if (!job.topicFile) {

            return res.status(404).json({
                success: false,
                message: "Topic file not available for this job."
            });

        }


        const topicFile =
            path.resolve(
                job.topicFile
            );


        if (!fs.existsSync(topicFile)) {

            return res.status(404).json({
                success: false,
                message: "Topic file not found."
            });

        }


        // ----------------------------------------
        // Read Topic JSON
        // ----------------------------------------

        const topicData =
            JSON.parse(
                await fs.promises.readFile(
                    topicFile,
                    "utf8"
                )
            );


        // ----------------------------------------
        // Response
        // ----------------------------------------

        res.json({

            success: true,

            job: {
                jobId: job.jobId,
                className: job.className,
                subject: job.subject,
                chapterName: job.chapterName
            },

            topics:
                topicData.tutorials || []

        });

    } catch (error) {

        console.error(
            "Failed to load topics:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load topics."

        });

    }

});

// ========================================
// GET Progress For Topic
// ========================================

router.get("/:jobId/topics/:topicIndex/progress", async (req, res) => {

    try {

        const { jobId, topicIndex } = req.params;

        // -----------------------------
        // Load Job
        // -----------------------------

        const jobFile = path.join(
            "generated",
            "jobs",
            `${jobId}.json`
        );

        if (!fs.existsSync(jobFile)) {

            return res.status(404).json({
                success: false,
                message: "Job not found."
            });
        }

        const job = JSON.parse(
            await fs.promises.readFile(
                jobFile,
                "utf8"
            )
        );


        // -----------------------------
        // Check Job Information
        // -----------------------------

        if (!job.className || !job.subject || !job.chapterName) {

            return res.status(400).json({
                success: false,
                message: "Job does not contain class, subject or chapter information."
            });
        }


        // -----------------------------
        // Progress File
        // -----------------------------

        const progressFile = path.join(
            "generated",
            "progress",
            job.className,
            job.subject,
            `${job.chapterName}.json`
        );


        if (!fs.existsSync(progressFile)) {

            return res.status(404).json({
                success: false,
                message: "Progress file not found."
            });
        }


        // -----------------------------
        // Load Progress
        // -----------------------------

        const progress = JSON.parse(
            await fs.promises.readFile(
                progressFile,
                "utf8"
            )
        );


        // -----------------------------
        // Load Topic
        // -----------------------------

        if (!job.topicFile) {

            return res.status(404).json({
                success: false,
                message: "Topic file not available."
            });
        }


        const topicFile = path.resolve(
            job.topicFile
        );


        if (!fs.existsSync(topicFile)) {

            return res.status(404).json({
                success: false,
                message: "Topic file not found."
            });
        }


        const topicData = JSON.parse(
            await fs.promises.readFile(
                topicFile,
                "utf8"
            )
        );


        const topic = topicData.tutorials?.[Number(topicIndex)];


        if (!topic) {

            return res.status(404).json({
                success: false,
                message: "Topic not found."
            });
        }


        // -----------------------------
        // Find Matching Progress Entry
        // -----------------------------

        const tutorialProgress =
            progress.tutorials || {};


        const normalize = (value) => {

            return String(value || "")
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");

        };

const topicTitle = normalize(topic.title);

let progressEntry = null;

for (const [key, value] of Object.entries(tutorialProgress)) {

    const progressTitle = normalize(key);

    // --------------------------------
    // 1. Exact match
    // --------------------------------

    if (progressTitle === topicTitle) {

        progressEntry = value;
        break;
    }


    // --------------------------------
    // 2. One title contains the other
    // --------------------------------

    if (
        progressTitle.includes(topicTitle) ||
        topicTitle.includes(progressTitle)
    ) {

        progressEntry = value;
        break;
    }

}
console.log("Topic Title:", topic.title);
console.log("Progress Keys:", Object.keys(tutorialProgress));
console.log("Matched Progress:", progressEntry);


        // -----------------------------
        // Response
        // -----------------------------

        res.json({

            success: true,

            topic: {
                id: topic.id,
                title: topic.title
            },

            progress: progressEntry || {}

        });


    } catch (error) {

        console.error(
            "Failed to load topic progress:",
            error.message
        );

        res.status(500).json({

            success: false,

            message: "Failed to load topic progress."

        });

    }

});

// ========================================
// GET Narration For Topic
// ========================================

router.get(
    "/:jobId/topics/:topicIndex/narration",
    async (req, res) => {

        try {

            const { jobId, topicIndex } = req.params;


            // --------------------------------
            // Load Job
            // --------------------------------

            const jobFile = path.join(
                "generated",
                "jobs",
                `${jobId}.json`
            );


            if (!fs.existsSync(jobFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Job not found."
                });

            }


            const job = JSON.parse(
                await fs.promises.readFile(
                    jobFile,
                    "utf8"
                )
            );


            // --------------------------------
            // Load Topic File
            // --------------------------------

            if (!job.topicFile) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not available."
                });

            }


            const topicFile = path.resolve(
                job.topicFile
            );


            if (!fs.existsSync(topicFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not found."
                });

            }


            const topicData = JSON.parse(
                await fs.promises.readFile(
                    topicFile,
                    "utf8"
                )
            );


            const topic =
                topicData.tutorials?.[
                    Number(topicIndex)
                ];


            if (!topic) {

                return res.status(404).json({
                    success: false,
                    message: "Topic not found."
                });

            }


            // --------------------------------
            // Narration Folder
            // --------------------------------

            const narrationFolder =
                path.join(
                    "generated",
                    "narrations",
                    job.className,
                    job.subject,
                    job.chapterName
                );


            if (!fs.existsSync(narrationFolder)) {

                return res.status(404).json({
                    success: false,
                    message: "Narration folder not found."
                });

            }


            // --------------------------------
            // Find Narration JSON
            // --------------------------------

            const files =
                await fs.promises.readdir(
                    narrationFolder
                );


            const jsonFiles =
                files.filter(
                    (file) =>
                        file.toLowerCase().endsWith(".json")
                );


            let narrationData = null;


            for (const file of jsonFiles) {

                const filePath =
                    path.join(
                        narrationFolder,
                        file
                    );


                try {

                    const data =
                        JSON.parse(
                            await fs.promises.readFile(
                                filePath,
                                "utf8"
                            )
                        );


                    if (
                        data.title &&
                        topic.title &&
                        data.title.trim().toLowerCase() ===
                        topic.title.trim().toLowerCase()
                    ) {

                        narrationData = data;

                        break;
                    }

                } catch (error) {

                    console.log(
                        "Skipping invalid narration JSON:",
                        file
                    );

                }

            }


            if (!narrationData) {

                return res.status(404).json({
                    success: false,
                    message: "Narration file not found for this topic."
                });

            }


            // --------------------------------
            // Return Narration
            // --------------------------------

            res.json({

                success: true,

                topic: {
                    title: narrationData.title,
                    tutorialId: narrationData.tutorialId,
                    sectionNumber:
                        narrationData.sectionNumber
                },

                scenes:
                    narrationData.scenes || []

            });


        } catch (error) {

            console.error(
                "Failed to load narration:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load narration."

            });

        }

    }
);

// ========================================
// GET Images For Topic
// ========================================

router.get(
    "/:jobId/topics/:topicIndex/images",
    async (req, res) => {

        try {

            const { jobId, topicIndex } = req.params;


            // --------------------------------
            // Load Job
            // --------------------------------

            const jobFile = path.join(
                "generated",
                "jobs",
                `${jobId}.json`
            );


            if (!fs.existsSync(jobFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Job not found."
                });

            }


            const job = JSON.parse(
                await fs.promises.readFile(
                    jobFile,
                    "utf8"
                )
            );


            // --------------------------------
            // Load Topic File
            // --------------------------------

            if (!job.topicFile) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not available."
                });

            }


            const topicFile = path.resolve(
                job.topicFile
            );


            if (!fs.existsSync(topicFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not found."
                });

            }


            const topicData = JSON.parse(
                await fs.promises.readFile(
                    topicFile,
                    "utf8"
                )
            );


            const topic =
                topicData.tutorials?.[
                    Number(topicIndex)
                ];


            if (!topic) {

                return res.status(404).json({
                    success: false,
                    message: "Topic not found."
                });

            }


            // --------------------------------
            // Images Chapter Folder
            // --------------------------------

            const chapterImagesFolder =
                path.join(
                    "generated",
                    "images",
                    job.className,
                    job.subject,
                    job.chapterName
                );


            if (
                !fs.existsSync(
                    chapterImagesFolder
                )
            ) {

                return res.json({
                    success: true,
                    topic: topic.title,
                    images: []
                });

            }


            // --------------------------------
            // Normalize
            // --------------------------------

            const normalize = (value) => {

                return String(value || "")
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "");

            };


            const topicTitle =
                normalize(topic.title);


            // --------------------------------
            // Find Topic Folder
            // --------------------------------

            const chapterItems =
                await fs.promises.readdir(
                    chapterImagesFolder,
                    {
                        withFileTypes: true
                    }
                );


            let topicFolder = null;


            for (
                const item of chapterItems
            ) {

                if (!item.isDirectory()) {
                    continue;
                }


                const folderName =
                    normalize(item.name);


                if (
                    folderName === topicTitle ||
                    folderName.includes(topicTitle) ||
                    topicTitle.includes(folderName)
                ) {

                    topicFolder =
                        path.join(
                            chapterImagesFolder,
                            item.name
                        );

                    break;
                }

            }


            if (!topicFolder) {

                return res.json({
                    success: true,
                    topic: topic.title,
                    images: []
                });

            }


            // --------------------------------
            // Find Images Recursively
            // --------------------------------

            const imageExtensions = [
                ".png",
                ".jpg",
                ".jpeg",
                ".webp"
            ];


            const imageFiles = [];


            async function scanFolder(folder) {

                const items =
                    await fs.promises.readdir(
                        folder,
                        {
                            withFileTypes: true
                        }
                    );


                for (
                    const item of items
                ) {

                    const fullPath =
                        path.join(
                            folder,
                            item.name
                        );


                    if (item.isDirectory()) {

                        await scanFolder(
                            fullPath
                        );

                        continue;
                    }


                    const extension =
                        path.extname(
                            item.name
                        ).toLowerCase();


                    if (
                        imageExtensions.includes(
                            extension
                        )
                    ) {

                        imageFiles.push(
                            fullPath
                        );

                    }

                }

            }


            await scanFolder(
                topicFolder
            );


            // --------------------------------
            // Convert To Browser URLs
            // --------------------------------

            const images =
                imageFiles.map(
                    (filePath) => {

                        const relativePath =
                            path.relative(
                                "generated",
                                filePath
                            );

                        return {
                            name:
                                path.basename(
                                    filePath
                                ),

                            path:
                                relativePath
                                    .replace(
                                        /\\/g,
                                        "/"
                                    ),

                            url:
                                `/generated/${relativePath
                                    .replace(
                                        /\\/g,
                                        "/"
                                    )}`
                        };

                    }
                );


            // --------------------------------
            // Response
            // --------------------------------

            res.json({

                success: true,

                topic: topic.title,

                count: images.length,

                images

            });


        } catch (error) {

            console.error(
                "Failed to load topic images:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load topic images."

            });

        }

    }
);

// ========================================
// GET English Video For Topic
// ========================================

router.get(
    "/:jobId/topics/:topicIndex/video",
    async (req, res) => {

        try {

            const { jobId, topicIndex } = req.params;


            // --------------------------------
            // Load Job
            // --------------------------------

            const jobFile = path.join(
                "generated",
                "jobs",
                `${jobId}.json`
            );


            if (!fs.existsSync(jobFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Job not found."
                });

            }


            const job = JSON.parse(
                await fs.promises.readFile(
                    jobFile,
                    "utf8"
                )
            );


            // --------------------------------
            // Load Topic File
            // --------------------------------

            if (!job.topicFile) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not available."
                });

            }


            const topicFile = path.resolve(
                job.topicFile
            );


            if (!fs.existsSync(topicFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not found."
                });

            }


            const topicData = JSON.parse(
                await fs.promises.readFile(
                    topicFile,
                    "utf8"
                )
            );


            const topic =
                topicData.tutorials?.[
                    Number(topicIndex)
                ];


            if (!topic) {

                return res.status(404).json({
                    success: false,
                    message: "Topic not found."
                });

            }


            // --------------------------------
            // Normalize
            // --------------------------------

            const normalize = (value) => {

                return String(value || "")
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "");

            };


            const topicTitle =
                normalize(topic.title);


            // --------------------------------
            // Videos Chapter Folder
            // --------------------------------

            const chapterVideosFolder =
                path.join(
                    "generated",
                    "videos",
                    job.className,
                    job.subject,
                    job.chapterName
                );


            if (
                !fs.existsSync(
                    chapterVideosFolder
                )
            ) {

                return res.status(404).json({
                    success: false,
                    message: "Video folder not found."
                });

            }


            // --------------------------------
            // Find Topic Folder
            // --------------------------------

            const items =
                await fs.promises.readdir(
                    chapterVideosFolder,
                    {
                        withFileTypes: true
                    }
                );


            let topicFolder = null;


            for (const item of items) {

                if (!item.isDirectory()) {
                    continue;
                }


                const folderName =
                    normalize(item.name);


                if (
                    folderName === topicTitle ||
                    folderName.includes(topicTitle) ||
                    topicTitle.includes(folderName)
                ) {

                    topicFolder =
                        path.join(
                            chapterVideosFolder,
                            item.name
                        );

                    break;
                }

            }


            if (!topicFolder) {

                return res.status(404).json({
                    success: false,
                    message: "Video folder not found for this topic."
                });

            }


            // --------------------------------
            // Find tutorial.mp4
            // --------------------------------

            const videoPath =
                path.join(
                    topicFolder,
                    "tutorial.mp4"
                );


            if (!fs.existsSync(videoPath)) {

                return res.status(404).json({
                    success: false,
                    message: "English video not generated yet."
                });

            }


            // --------------------------------
            // Browser URL
            // --------------------------------

            const relativePath =
                path.relative(
                    "generated",
                    videoPath
                );


            const videoUrl =
                `/generated/${relativePath.replace(
                    /\\/g,
                    "/"
                )}`;


            // --------------------------------
            // Response
            // --------------------------------

            res.json({

                success: true,

                topic: topic.title,

                video: {
                    name: "tutorial.mp4",
                    url: videoUrl
                }

            });


        } catch (error) {

            console.error(
                "Failed to load English video:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load English video."

            });

        }

    }
);

// ========================================
// GET Hindi Narration For Topic
// ========================================

router.get(
    "/:jobId/topics/:topicIndex/hindi-narration",
    async (req, res) => {

        try {

            const { jobId, topicIndex } = req.params;


            // --------------------------------
            // Load Job
            // --------------------------------

            const jobFile = path.join(
                "generated",
                "jobs",
                `${jobId}.json`
            );


            if (!fs.existsSync(jobFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Job not found."
                });

            }


            const job = JSON.parse(
                await fs.promises.readFile(
                    jobFile,
                    "utf8"
                )
            );


            // --------------------------------
            // Load Topic File
            // --------------------------------

            if (!job.topicFile) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not available."
                });

            }


            const topicFile = path.resolve(
                job.topicFile
            );


            if (!fs.existsSync(topicFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not found."
                });

            }


            const topicData = JSON.parse(
                await fs.promises.readFile(
                    topicFile,
                    "utf8"
                )
            );


            const topic =
                topicData.tutorials?.[
                    Number(topicIndex)
                ];


            if (!topic) {

                return res.status(404).json({
                    success: false,
                    message: "Topic not found."
                });

            }


            // --------------------------------
            // Hindi Narration Folder
            // --------------------------------

            const narrationFolder =
                path.join(
                    "generated",
                    "narrations-hi",
                    job.className,
                    job.subject,
                    job.chapterName
                );


            if (!fs.existsSync(narrationFolder)) {

                return res.status(404).json({
                    success: false,
                    message: "Hindi narration folder not found."
                });

            }


            // --------------------------------
            // Find Narration JSON
            // --------------------------------

            const files =
                await fs.promises.readdir(
                    narrationFolder
                );


            const jsonFiles =
                files.filter(
                    (file) =>
                        file.toLowerCase().endsWith(".json")
                );


            let narrationData = null;


            for (const file of jsonFiles) {

                const filePath =
                    path.join(
                        narrationFolder,
                        file
                    );


                try {

                    const data =
                        JSON.parse(
                            await fs.promises.readFile(
                                filePath,
                                "utf8"
                            )
                        );


                    if (
                        data.title &&
                        topic.title &&
                        data.title.trim().toLowerCase() ===
                        topic.title.trim().toLowerCase()
                    ) {

                        narrationData = data;

                        break;
                    }

                } catch (error) {

                    console.log(
                        "Skipping invalid Hindi narration JSON:",
                        file
                    );

                }

            }


            if (!narrationData) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Hindi narration file not found for this topic."
                });

            }


            // --------------------------------
            // Return Hindi Narration
            // --------------------------------

            res.json({

                success: true,

                topic: {
                    title: narrationData.title,
                    tutorialId: narrationData.tutorialId,
                    sectionNumber:
                        narrationData.sectionNumber
                },

                scenes:
                    narrationData.scenes || []

            });


        } catch (error) {

            console.error(
                "Failed to load Hindi narration:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load Hindi narration."

            });

        }

    }
);


// ========================================
// GET Hindi Video For Topic
// ========================================

router.get(
    "/:jobId/topics/:topicIndex/hindi-video",
    async (req, res) => {

        try {

            const { jobId, topicIndex } = req.params;


            // --------------------------------
            // Load Job
            // --------------------------------

            const jobFile = path.join(
                "generated",
                "jobs",
                `${jobId}.json`
            );


            if (!fs.existsSync(jobFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Job not found."
                });

            }


            const job = JSON.parse(
                await fs.promises.readFile(
                    jobFile,
                    "utf8"
                )
            );


            // --------------------------------
            // Load Topic
            // --------------------------------

            if (!job.topicFile) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not available."
                });

            }


            const topicFile = path.resolve(
                job.topicFile
            );


            if (!fs.existsSync(topicFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not found."
                });

            }


            const topicData = JSON.parse(
                await fs.promises.readFile(
                    topicFile,
                    "utf8"
                )
            );


            const topic =
                topicData.tutorials?.[
                    Number(topicIndex)
                ];


            if (!topic) {

                return res.status(404).json({
                    success: false,
                    message: "Topic not found."
                });

            }


            // --------------------------------
            // Hindi Video Folder
            // --------------------------------

            const chapterVideosFolder =
                path.join(
                    "generated",
                    "video-hi",
                    job.className,
                    job.subject,
                    job.chapterName
                );


            if (!fs.existsSync(
                chapterVideosFolder
            )) {

                return res.status(404).json({
                    success: false,
                    message: "Hindi video folder not found."
                });

            }


            // --------------------------------
            // Normalize
            // --------------------------------

            const normalize = (value) => {

                return String(value || "")
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "");

            };


            const topicTitle =
                normalize(topic.title);


            // --------------------------------
            // Find Topic Folder
            // --------------------------------

            const items =
                await fs.promises.readdir(
                    chapterVideosFolder,
                    {
                        withFileTypes: true
                    }
                );


            let topicFolder = null;


            for (const item of items) {

                if (!item.isDirectory()) {
                    continue;
                }


                const folderName =
                    normalize(item.name);


                if (
                    folderName === topicTitle ||
                    folderName.includes(topicTitle) ||
                    topicTitle.includes(folderName)
                ) {

                    topicFolder =
                        path.join(
                            chapterVideosFolder,
                            item.name
                        );

                    break;
                }

            }


            if (!topicFolder) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Hindi video folder not found for this topic."
                });

            }


            // --------------------------------
            // Find tutorial.mp4
            // --------------------------------

            const videoPath =
                path.join(
                    topicFolder,
                    "tutorial.mp4"
                );


            if (!fs.existsSync(videoPath)) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Hindi video not generated yet."
                });

            }


            // --------------------------------
            // Browser URL
            // --------------------------------

            const relativePath =
                path.relative(
                    "generated",
                    videoPath
                );


            const videoUrl =
                `/generated/${relativePath.replace(
                    /\\/g,
                    "/"
                )}`;


            // --------------------------------
            // Response
            // --------------------------------

            res.json({

                success: true,

                topic: topic.title,

                video: {
                    name: "tutorial.mp4",
                    url: videoUrl
                }

            });


        } catch (error) {

            console.error(
                "Failed to load Hindi video:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load Hindi video."

            });

        }

    }
);

// ========================================
// GET Reviewed Narration For Topic
// ========================================

router.get(
    "/:jobId/topics/:topicIndex/reviewed-narration",
    async (req, res) => {

        try {

            const { jobId, topicIndex } = req.params;


            // --------------------------------
            // Load Job
            // --------------------------------

            const jobFile = path.join(
                "generated",
                "jobs",
                `${jobId}.json`
            );


            if (!fs.existsSync(jobFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Job not found."
                });

            }


            const job = JSON.parse(
                await fs.promises.readFile(
                    jobFile,
                    "utf8"
                )
            );


            // --------------------------------
            // Load Topic File
            // --------------------------------

            if (!job.topicFile) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not available."
                });

            }


            const topicFile = path.resolve(
                job.topicFile
            );


            if (!fs.existsSync(topicFile)) {

                return res.status(404).json({
                    success: false,
                    message: "Topic file not found."
                });

            }


            const topicData = JSON.parse(
                await fs.promises.readFile(
                    topicFile,
                    "utf8"
                )
            );


            const topic =
                topicData.tutorials?.[
                    Number(topicIndex)
                ];


            if (!topic) {

                return res.status(404).json({
                    success: false,
                    message: "Topic not found."
                });

            }


            // --------------------------------
            // Reviewed Narration Folder
            // --------------------------------

            const reviewedFolder =
                path.join(
                    "generated",
                    "reviewed-narrations",
                    job.className,
                    job.subject,
                    job.chapterName
                );


            if (!fs.existsSync(reviewedFolder)) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Reviewed narration folder not found."
                });

            }


            // --------------------------------
            // Read JSON Files
            // --------------------------------

            const files =
                await fs.promises.readdir(
                    reviewedFolder
                );


            const jsonFiles =
                files.filter(
                    (file) =>
                        file
                            .toLowerCase()
                            .endsWith(".json")
                );


            let reviewedData = null;


            // --------------------------------
            // Find Matching Topic
            // --------------------------------

            for (const file of jsonFiles) {

                const filePath =
                    path.join(
                        reviewedFolder,
                        file
                    );


                try {

                    const data =
                        JSON.parse(
                            await fs.promises.readFile(
                                filePath,
                                "utf8"
                            )
                        );


                    if (
                        data.title &&
                        topic.title &&
                        data.title
                            .trim()
                            .toLowerCase() ===
                        topic.title
                            .trim()
                            .toLowerCase()
                    ) {

                        reviewedData = data;

                        break;
                    }

                } catch (error) {

                    console.log(
                        "Skipping invalid reviewed narration JSON:",
                        file
                    );

                }

            }


            // --------------------------------
            // Not Found
            // --------------------------------

            if (!reviewedData) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Reviewed narration not found for this topic."
                });

            }


            // --------------------------------
            // Response
            // --------------------------------

            res.json({

                success: true,

                topic: {
                    title: reviewedData.title,
                    tutorialId:
                        reviewedData.tutorialId,
                    sectionNumber:
                        reviewedData.sectionNumber
                },

                scenes:
                    reviewedData.scenes || []

            });


        } catch (error) {

            console.error(
                "Failed to load reviewed narration:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load reviewed narration."

            });

        }

    }
);

export default router;