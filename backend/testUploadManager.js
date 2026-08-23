import { saveUploadJob, loadUploadJobs } from "./scripts/uploads/uploadManager.js";

saveUploadJob({
    jobId: "test-job-1",
    className: "class-10",
    subject: "Mathematics",
    chapterName: "Arithmetic Progressions",
    tutorialTitle: "Introduction",
    language: "en",
    videoPath: "generated/videos/test/tutorial.mp4",
    thumbnailPath: "generated/images/test/thumbnail.png",
    status: "pending",
    retryCount: 0,
    createdAt: new Date().toISOString()
});

console.log("Upload Jobs:");
console.log(loadUploadJobs());