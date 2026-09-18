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
import {
    loadRotationState,
    saveRotationState,
    markAccountLimitReached,
    getCurrentRotationAccount,
    getNextAvailableRotationAccount
} from "./youtubeRotationManager.js";
async function processUploadQueue() {

    const jobs = loadUploadJobs();

    console.log(`Found ${jobs.length} Upload Jobs`);
const rotationState = loadRotationState();

const currentAccount =
    getCurrentRotationAccount();

if (!currentAccount) {
    console.log("\n======================================");
    console.log("No YouTube Account Available");
    console.log("All Accounts May Have Reached Limit");
    console.log("Stopping Upload Worker...");
    console.log("======================================\n");

    return;
}

console.log(
    "Current YouTube Account:",
    currentAccount.email,
    "|",
    currentAccount.channelName,
    "|",
    currentAccount.accountId
);
    console.log("FIRST 5 JOBS:");
jobs.slice(0, 5).forEach((job, index) => {
    console.log(
        index,
        "|",
        job.tutorialTitle,
        "|",
        job.language,
        "|",
        job.status,
        "|",
        job.youtubeAccountId
    );
});

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

                existingVideoId: job.videoId,
                youtubeAccountId: job.youtubeAccountId

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

        // ==========================================
// Use Global Rotation Account
// ==========================================

const uploadAccount =
    getCurrentRotationAccount();

if (!uploadAccount) {
    console.log(
        "No available YouTube account. Stopping worker..."
    );
    break;
}

job.youtubeAccountId =
    uploadAccount.accountId;

await updateUploadJob(job.jobId, {
    youtubeAccountId:
        uploadAccount.accountId
});

console.log(
    `Using YouTube Account: ${uploadAccount.email} | ${uploadAccount.channelName}`
);

        console.log(
            `Uploading ${job.tutorialTitle} (${job.language})`
        );

        const playlistId = await getOrCreatePlaylist({
            className: job.className,
            subject: job.subject,
            chapterName: job.chapterName,
            language: job.language,
            youtubeAccountId: job.youtubeAccountId
        });

        console.log("Playlist:", playlistId);

const videoId = await uploadVideo({
    videoPath: job.videoPath,
    thumbnailPath: job.thumbnailPath,
    title: job.tutorialTitle,
    playlistId,
    language: job.language,
    existingVideoId: job.videoId,
    youtubeAccountId: job.youtubeAccountId,

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
    console.log(
        `Current Account: ${job.youtubeAccountId}`
    );
    console.log("Switching To Next YouTube Account...");
    console.log("======================================\n");

    // ------------------------------------------
    // Mark Current Account As Limit Reached
    // ------------------------------------------

    markAccountLimitReached(
        job.youtubeAccountId
    );

    // ------------------------------------------
    // Get Next Available Account
    // ------------------------------------------

    const nextAccount =
        getNextAvailableRotationAccount();

    if (!nextAccount) {

        console.log("\n======================================");
        console.log("All YouTube Accounts Have Reached Limit");
        console.log("Remaining Jobs Will Stay Pending");
        console.log("Stopping Upload Worker...");
        console.log("======================================\n");

        break;
    }

    console.log("\n======================================");
    console.log("YouTube Account Switched");
    console.log(
        `New Account: ${nextAccount.email}`
    );
    console.log(
        `Channel: ${nextAccount.channelName}`
    );
    console.log(
        `Account ID: ${nextAccount.accountId}`
    );
    console.log("======================================\n");

    // ------------------------------------------
    // Assign New Account To Current Job
    // ------------------------------------------

    job.youtubeAccountId =
        nextAccount.accountId;

    await updateUploadJob(job.jobId, {
        youtubeAccountId:
            nextAccount.accountId
    });

    // ------------------------------------------
    // Retry Same Job With New Account
    // ------------------------------------------

    try {

        console.log(
            `Retrying ${job.tutorialTitle} (${job.language})`
        );

        const playlistId =
            await getOrCreatePlaylist({
                className: job.className,
                subject: job.subject,
                chapterName: job.chapterName,
                language: job.language,
                youtubeAccountId:
                    nextAccount.accountId
            });

        console.log(
            "Playlist:",
            playlistId
        );

        const videoId =
            await uploadVideo({

                videoPath:
                    job.videoPath,

                thumbnailPath:
                    job.thumbnailPath,

                title:
                    job.tutorialTitle,

                playlistId,

                language:
                    job.language,

                existingVideoId:
                    job.videoId,

                youtubeAccountId:
                    nextAccount.accountId,

                onUploaded:
                    async (uploadedVideoId) => {

                        await updateUploadJob(
                            job.jobId,
                            {
                                status: "uploaded",

                                videoId:
                                    uploadedVideoId,

                                playlistId,

                                youtubeUrl:
                                    `https://www.youtube.com/watch?v=${uploadedVideoId}`,

                                uploadedAt:
                                    new Date().toISOString(),

                                youtubeAccountId:
                                    nextAccount.accountId
                            }
                        );

                        videoUploaded = true;

                        console.log(
                            `YouTube Video ID Saved: ${uploadedVideoId}`
                        );
                    }
            });

        await addYouTubeUploadToExcel({

            className:
                job.className,

            subject:
                job.subject,

            chapterName:
                job.chapterName,

            tutorialTitle:
                job.tutorialTitle,

            language:
                job.language,

            videoId,

            youtubeUrl:
                `https://www.youtube.com/watch?v=${videoId}`,

            playlistId,

            uploadedAt:
                new Date().toISOString()
        });

        await updateUploadJob(
            job.jobId,
            {
                status: "completed",

                videoId,

                playlistId,

                youtubeUrl:
                    `https://www.youtube.com/watch?v=${videoId}`,

                completedAt:
                    new Date().toISOString(),

                youtubeAccountId:
                    nextAccount.accountId
            }
        );

        console.log(
            `Upload Completed After Account Switch : ${job.tutorialTitle} (${job.language})`
        );

    } catch (switchError) {

        console.error(
            "Upload Failed After Account Switch:",
            switchError.message
        );

        // ------------------------------------------
        // If Next Account Also Reaches Limit
        // ------------------------------------------

        const nextReason =
            switchError?.response?.data
                ?.error?.errors?.[0]?.reason;

        if (
            nextReason ===
            "uploadLimitExceeded"
        ) {

            markAccountLimitReached(
                nextAccount.accountId
            );

            console.log(
                `Account ${nextAccount.accountId} also reached upload limit.`
            );
        }

        // Keep job pending so it can be
        // processed again after rotation.
        await updateUploadJob(
            job.jobId,
            {
                status: "pending",
                youtubeAccountId:
                    nextAccount.accountId,
                retryCount:
                    (job.retryCount || 0) + 1
            }
        );
    }

    continue;
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