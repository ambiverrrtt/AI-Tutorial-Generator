import fs from "fs";
import path from "path";
const USE_MULTI_ACCOUNT = false;
import { processSubject } from "./worker.js";
import BrowserManager from "../services/BrowserManager/BrowserManager.js";
import WorkerPool from "./WorkerPool.js";


(async () => {

    const pdfFolder = "./pdfs";
    const jobs = [];

    console.log("Scanning PDFs...");
    console.log(fs.readdirSync(pdfFolder));

    for (const classFolder of fs.readdirSync(pdfFolder)) {

        const classPath = path.join(
            pdfFolder,
            classFolder
        );

        const subjects =
            fs.readdirSync(classPath);

        console.log(`\n${classFolder}`);
        console.log(subjects);

        for (const subjectFolder of subjects) {

           jobs.push({
    classFolder,
    subjectFolder
});

        }

    }
    console.log(jobs);
//    await WorkerPool.run(jobs);

if (USE_MULTI_ACCOUNT) {

    await WorkerPool.run(jobs);

} else {

    const job = jobs[0];

    await processSubject(
        job.classFolder,
        job.subjectFolder,
        1
    );

}

})();