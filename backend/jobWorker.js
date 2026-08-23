import { resumeJobs } from "./scripts/jobs/resumeJobs.js";

const workerId = Number(process.argv[2]);

if (!workerId) {

    console.log("Usage: node jobWorker.js <workerId>");

    process.exit(1);

}

console.log(`\n====================================`);
console.log(` Worker ${workerId} Started`);
console.log(`====================================\n`);

await resumeJobs(workerId);