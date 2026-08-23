import { processChapter } from "../processChapter.js";

process.on("message", async (job) => {

    try {

        console.log("\n========================================");
        console.log(`Worker Started`);
        console.log(`Job : ${job.jobId}`);
        console.log(`Class : ${job.className}`);
        console.log(`Subject : ${job.subject}`);
        console.log("========================================\n");

        await processChapter(

            job.className,

            job.subject,

            job.pdfPath,

            job.accountId,

            job.jobId

        );

        if (process.send) {

            process.send({

                success: true,

                jobId: job.jobId

            });

        }

        process.exit(0);

    } catch (err) {

        console.log(err);

        if (process.send) {

            process.send({

                success: false,

                jobId: job.jobId,

                error: err.message

            });

        }

        process.exit(1);

    }

});