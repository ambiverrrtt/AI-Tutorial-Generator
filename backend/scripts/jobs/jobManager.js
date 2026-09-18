import fs from "fs";
import path from "path";

const JOB_FOLDER = path.join(
    "generated",
    "jobs"
);

if (!fs.existsSync(JOB_FOLDER)) {
    fs.mkdirSync(JOB_FOLDER, {
        recursive: true
    });
}

export function saveJob(job) {

    const file = path.join(
        JOB_FOLDER,
        `${job.jobId}.json`
    );

    if (fs.existsSync(file)) {

        console.log("Job Already Exists:", job.jobId);
        return;

    }

    console.log("Saving Job ID:", job.jobId);
    console.log("Saving File:", file);

    fs.writeFileSync(
        file,
        JSON.stringify(job, null, 2)
    );

}

export function loadJobs() {

    return fs
        .readdirSync(JOB_FOLDER)
        .map(file => {

            return JSON.parse(

                fs.readFileSync(
                    path.join(JOB_FOLDER, file),
                    "utf8"
                )

            );

        });

}

export function completeJob(jobId) {

   const file = path.join(
    JOB_FOLDER,
    `${jobId}.json`
);

console.log("Completing Job :", jobId);
console.log("Job File :", file);

    if (!fs.existsSync(file))
        return;

    const job = JSON.parse(
        fs.readFileSync(file, "utf8")
    );

    job.status = "completed";

    fs.writeFileSync(
        file,
        JSON.stringify(job, null, 2)
    );

}

export function updateJob(jobId, updates) {

    const file = path.join(
        JOB_FOLDER,
        `${jobId}.json`
    );

    console.log("Updating Job:", jobId);
    console.log("Job File:", file);

    if (!fs.existsSync(file)) {
        console.log("Job File Not Found:", file);
        return null;
    }

    const job = JSON.parse(
        fs.readFileSync(file, "utf8")
    );

    const updatedJob = {
        ...job,
        ...updates
    };

    fs.writeFileSync(
        file,
        JSON.stringify(updatedJob, null, 2)
    );

    console.log("Job Updated:", updatedJob);

    return updatedJob;
}