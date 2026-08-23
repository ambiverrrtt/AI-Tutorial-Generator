import fs from "fs";
import path from "path";
import { processChapter } from "./processChapter.js";

export async function processSubject(
    classFolder,
    subjectFolder,
    accountId = 1
){

    const subjectPath = path.join(
        "pdfs",
        classFolder,
        subjectFolder
    );

    const pdfFiles = fs.readdirSync(subjectPath);

    console.log(
        `\n===== ${classFolder} / ${subjectFolder} =====`
    );

    for (const pdfFile of pdfFiles) {

        if (!pdfFile.endsWith(".pdf")) {
            continue;
        }

        const pdfPath = path.join(
            subjectPath,
            pdfFile
        );

        try {

            await processChapter(
    classFolder,
    subjectFolder,
    pdfPath,
    accountId
);

        } catch (err) {

            console.log(
                `Failed : ${pdfPath}`
            );

            console.log(err);

        }

    }

}