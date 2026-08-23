import {
    loadUploadJobs,
    updateUploadJob
} from "../uploads/uploadManager.js";
import { cleanupTutorial } from "../cleanup/cleanupTutorial.js";
import { getOrCreatePlaylist } from "./playlistManager.js";
import { uploadVideo } from "./uploadVideo.js";
import {
    addYouTubeUploadToExcel
} from "./youtubeExcel.js";
async function processUploadQueue() {

    const jobs = loadUploadJobs();

    console.log(`Found ${jobs.length} Upload Jobs`);

    for (const job of jobs) {

    if (job.status === "completed") {
        continue;
    }

    let videoUploaded = Boolean(job.videoId);

    try {

        // ==========================================
        // RESUME PLAYLIST FOR ALREADY UPLOADED VIDEO
        // ==========================================

        if (
            job.status === "uploaded" &&
            job.videoId &&
            job.playlistId
        ) {

            console.log(
                `Resuming Playlist For: ${job.tutorialTitle} (${job.language})`
            );

            console.log(
                `Existing YouTube Video: ${job.videoId}`
            );

            console.log(
                `Existing Playlist: ${job.playlistId}`
            );

            const videoId = await uploadVideo({

                videoPath: job.videoPath,

                thumbnailPath: job.thumbnailPath,

                title: job.tutorialTitle,

                playlistId: job.playlistId,

                language: job.language,

                existingVideoId: job.videoId

            });

            await addYouTubeUploadToExcel({

                className: job.className,

                subject: job.subject,

                chapterName: job.chapterName,

                tutorialTitle: job.tutorialTitle,

                language: job.language,

                videoId,

                youtubeUrl:
                    `https://www.youtube.com/watch?v=${videoId}`,

                playlistId: job.playlistId,

                uploadedAt:
                    job.uploadedAt ||
                    new Date().toISOString()

            });

            await updateUploadJob(job.jobId, {

                status: "completed",

                videoId,

                playlistId: job.playlistId,

                youtubeUrl:
                    `https://www.youtube.com/watch?v=${videoId}`,

                completedAt:
                    new Date().toISOString()

            });

            console.log(
                `Playlist Resume Completed : ${job.tutorialTitle} (${job.language})`
            );

            continue;
        }

        // ==========================================
        // NORMAL PENDING UPLOAD
        // ==========================================

        if (job.status !== "pending") {
            continue;
        }

        console.log(
            `Uploading ${job.tutorialTitle} (${job.language})`
        );

        const playlistId = await getOrCreatePlaylist({
            className: job.className,
            subject: job.subject,
            chapterName: job.chapterName,
            language: job.language
        });

        console.log("Playlist:", playlistId);

const videoId = await uploadVideo({
    videoPath: job.videoPath,
    thumbnailPath: job.thumbnailPath,
    title: job.tutorialTitle,
    playlistId,
    language: job.language,
    existingVideoId: job.videoId,

    onUploaded: async (uploadedVideoId) => {

        await updateUploadJob(job.jobId, {
            status: "uploaded",
            videoId: uploadedVideoId,
            playlistId,
            youtubeUrl:
                `https://www.youtube.com/watch?v=${uploadedVideoId}`,
            uploadedAt: new Date().toISOString()
        });
videoUploaded = true;
        console.log(
            `YouTube Video ID Saved: ${uploadedVideoId}`
        );

    }
});

await addYouTubeUploadToExcel({

    className: job.className,

    subject: job.subject,

    chapterName: job.chapterName,

    tutorialTitle: job.tutorialTitle,

    language: job.language,

    videoId,

    youtubeUrl:
        `https://www.youtube.com/watch?v=${videoId}`,

    playlistId,

    uploadedAt:
        new Date().toISOString()
});
await updateUploadJob(job.jobId, {
    status: "completed",
    videoId,
    playlistId,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    completedAt: new Date().toISOString()
});

console.log(
    `Upload Completed : ${job.tutorialTitle} (${job.language})`
);

    } catch (error) {

    console.error(error.message);

    const reason =
        error?.response?.data?.error?.errors?.[0]?.reason;

    if (reason === "uploadLimitExceeded") {

        console.log("\n======================================");
        console.log("YouTube Upload Limit Reached");
        console.log("Stopping Upload Worker...");
        console.log("Remaining Jobs Will Stay Pending");
        console.log("======================================\n");

        break;
    }

    if (videoUploaded) {

    await updateUploadJob(job.jobId, {
        status: "uploaded",
        retryCount: (job.retryCount || 0) + 1
    });

    console.log(
        `Playlist Resume Failed — Keeping Job Uploaded For Retry: ${job.tutorialTitle}`
    );

} else {

    await updateUploadJob(job.jobId, {
        status: "failed",
        retryCount: (job.retryCount || 0) + 1
    });

}

    console.log(
        `Upload Failed : ${job.tutorialTitle} (${job.language})`
    );

}

}

}
processUploadQueue();