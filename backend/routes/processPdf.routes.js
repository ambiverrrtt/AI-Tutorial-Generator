// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { saveJob } from "../scripts/jobs/jobManager.js";

// const router = express.Router();

// const uploadFolder = "uploads";

// if (!fs.existsSync(uploadFolder)) {
//     fs.mkdirSync(uploadFolder, {
//         recursive: true
//     });
// }

// const storage = multer.diskStorage({

//     destination: (req, file, cb) => {

//         cb(null, uploadFolder);

//     },

//     filename: (req, file, cb) => {

//         const fileName =
//             Date.now() + "-" + file.originalname;

//         cb(null, fileName);

//     }

// });

// const upload = multer({
//     storage
// });

// router.post(
//     "/process-pdf",
//     upload.single("pdf"),
//     async (req, res) => {

//         try {

//             console.log("========= NEW REQUEST =========");

//             console.log("Class :", req.body.className);

//             console.log("Subject :", req.body.subject);

//             console.log("PDF :", req.file);
//             const className = req.body.className;

// const subject = req.body.subject;

// const pdfPath = req.file.path;
// const workerId = Number(req.body.workerId);

// const job = {

//     jobId: path.parse(req.file.filename).name,

//     className,

//     subject,

//     pdfPath,

//     workerId,

//     accountId: workerId,

//     status: "running"

// };

// saveJob(job);

// console.log("Job Saved");

//            res.json({

//     success: true,

//     message: "Job Created Successfully",

//     jobId: job.jobId

// });

//         } catch (err) {

//             console.log(err);

//             res.status(500).json({

//                 success: false,

//                 message: err.message

//             });

//         }

//     }
// );

// export default router;

import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import { saveJob } from "../scripts/jobs/jobManager.js";

import {
    getAllYouTubeAccounts
} from "../youtube-accounts/youtubeAccountManager.js";


const router = express.Router();


// ========================================
// Upload Folder
// ========================================

const uploadFolder = "uploads";

if (!fs.existsSync(uploadFolder)) {

    fs.mkdirSync(uploadFolder, {
        recursive: true
    });

}


// ========================================
// Multer Storage
// ========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadFolder);

    },

    filename: (req, file, cb) => {

        const fileName =
            Date.now() + "-" + file.originalname;

        cb(null, fileName);

    }

});

const upload = multer({
    storage
});


// ========================================
// GET YouTube Accounts
// ========================================

router.get(
    "/youtube-accounts",
    (req, res) => {

        try {

            const accounts =
                getAllYouTubeAccounts();

            // IMPORTANT:
            // Tokens frontend ko nahi bhejne hain.

            const safeAccounts =
                accounts.map(account => ({

                    accountId:
                        account.accountId,

                    email:
                        account.email,

                    channelName:
                        account.channelName

                }));


            res.json({

                success: true,

                accounts:
                    safeAccounts

            });

        } catch (error) {

            console.error(
                "Failed to load YouTube accounts:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to load YouTube accounts."

            });

        }

    }
);


// ========================================
// Process PDF
// ========================================

router.post(
    "/process-pdf",
    upload.single("pdf"),
    async (req, res) => {

        try {

            console.log(
                "========= NEW REQUEST ========="
            );

            console.log(
                "Class :",
                req.body.className
            );

            console.log(
                "Subject :",
                req.body.subject
            );

            console.log(
                "Worker :",
                req.body.workerId
            );

            console.log(
                "YouTube Account :",
                req.body.youtubeAccountId
            );

            console.log(
                "PDF :",
                req.file
            );


            // ========================================
            // Basic Validation
            // ========================================

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "PDF file is required."

                });

            }


            const className =
                req.body.className;

            const subject =
                req.body.subject;

            const pdfPath =
                req.file.path;

            const workerId =
                Number(req.body.workerId);

            const youtubeAccountId =
                req.body.youtubeAccountId;


            if (
                !className ||
                !subject ||
                !workerId ||
                !youtubeAccountId
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Class, subject, worker and YouTube account are required."

                });

            }


            // ========================================
            // Verify YouTube Account
            // ========================================

            const youtubeAccounts =
                getAllYouTubeAccounts();

            const youtubeAccount =
                youtubeAccounts.find(
                    account =>
                        account.accountId ===
                        youtubeAccountId
                );


            if (!youtubeAccount) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Selected YouTube account not found."

                });

            }


            // ========================================
            // Create Job
            // ========================================

            const job = {

                jobId:
                    path.parse(
                        req.file.filename
                    ).name,

                className,

                subject,

                pdfPath,

                workerId,

                // Existing Gemini/worker account
                accountId:
                    workerId,

                // Selected YouTube account
                youtubeAccountId,

                status:
                    "running"

            };


            // ========================================
            // Save Job
            // ========================================

            saveJob(job);

            console.log(
                "Job Saved:",
                job
            );


            // ========================================
            // Response
            // ========================================

            res.json({

                success: true,

                message:
                    "Job Created Successfully",

                jobId:
                    job.jobId,

                youtubeAccountId:
                    job.youtubeAccountId

            });


        } catch (err) {

            console.error(
                "Process PDF Error:",
                err
            );

            res.status(500).json({

                success: false,

                message:
                    err.message

            });

        }

    }
);


export default router;