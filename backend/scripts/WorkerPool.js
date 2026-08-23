import { processSubject } from "./worker.js";
import BrowserManager from "../services/BrowserManager/BrowserManager.js";

class WorkerPool {

    static async run(jobs) {

        const accounts =
            BrowserManager.getAccounts()
                .filter(a => a.enabled);

        if (accounts.length === 0) {

            throw new Error(
                "No enabled accounts found."
            );

        }

        console.log(
            `Workers : ${accounts.length}`
        );

        const workers = accounts.map(account =>
            this.startWorker(
                account,
                jobs
            )
        );

        await Promise.all(workers);

    }

    static async startWorker(
        account,
        jobs
    ) {

        while (jobs.length > 0) {

            const job = jobs.shift();

            if (!job) {

                return;

            }

            console.log(
                `\n====================================`
            );

            console.log(
                `Worker ${account.id}`
            );

            console.log(
                `${job.classFolder} -> ${job.subjectFolder}`
            );

            console.log(
                `====================================`
            );

            await processSubject(

                job.classFolder,

                job.subjectFolder,

                account.id

            );

        }

    }

}

export default WorkerPool;