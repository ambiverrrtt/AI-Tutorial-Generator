

import { loadJobs } from "./jobManager.js";
import { processChapter } from "../processChapter.js";

export async function resumeJobs(workerId) {

    console.log("\nChecking Pending Jobs...\n");

    const jobs = loadJobs();

    for (const job of jobs) {

        if (job.status !== "running") {
            continue;
        }

        if (job.workerId !== workerId) {
    continue;
}

        console.log(
            `Resuming : ${job.className} / ${job.subject}`
        );

       await processChapter(
    job.className,
    job.subject,
    job.pdfPath,
    job.accountId,
    job.jobId,
    job.youtubeAccountId

);
    }
}