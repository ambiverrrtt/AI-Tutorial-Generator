import express from "express";
import ExcelJS from "exceljs";
import fs from "fs";
import { EXCEL_FILE } from "../scripts/youtube/youtubeExcel.js";

const router = express.Router();


// ==========================================
// HELPERS
// ==========================================

function formatClass(className) {

    return String(className || "")
        .replace(/^class-/i, "Class ")
        .trim();

}


// ------------------------------------------
// Extract YouTube Video ID
// ------------------------------------------

function getVideoIdFromUrl(url) {

    if (!url) {
        return "";
    }

    const value = String(url).trim();

    // youtube.com/watch?v=xxxx
    const watchMatch =
        value.match(/[?&]v=([^&]+)/);

    if (watchMatch) {
        return watchMatch[1];
    }

    // youtu.be/xxxx
    const shortMatch =
        value.match(/youtu\.be\/([^?&/]+)/);

    if (shortMatch) {
        return shortMatch[1];
    }

    return "";
}


// ------------------------------------------
// Create YouTube Link Cell
// ------------------------------------------

function setYouTubeLinkCell(cell, youtubeLink) {

    if (!youtubeLink) {

        cell.value = "";

        return;
    }

    cell.value = {

        text: youtubeLink,

        hyperlink: youtubeLink

    };

}


// ------------------------------------------
// Find Correct Position
// ------------------------------------------

function findInsertPosition(
    worksheet,
    {
        className,
        subject,
        chapter
    }
) {

    let lastSameChapterRow = 0;
    let lastSameSubjectRow = 0;
    let lastSameClassRow = 0;

    for (
        let rowNumber = 2;
        rowNumber <= worksheet.rowCount;
        rowNumber++
    ) {

        const row =
            worksheet.getRow(rowNumber);

        const rowClass =
            String(
                row.getCell(1).value || ""
            ).trim();

        const rowSubject =
            String(
                row.getCell(2).value || ""
            ).trim();

        const rowChapter =
            String(
                row.getCell(3).value || ""
            ).trim();

        if (
            rowClass === className
        ) {

            lastSameClassRow =
                rowNumber;

        }

        if (
            rowClass === className &&
            rowSubject === subject
        ) {

            lastSameSubjectRow =
                rowNumber;

        }

        if (
            rowClass === className &&
            rowSubject === subject &&
            rowChapter === chapter
        ) {

            lastSameChapterRow =
                rowNumber;

        }

    }


    // --------------------------------------
    // Same Chapter Found
    // Add after last topic of chapter
    // --------------------------------------

    if (lastSameChapterRow) {

        return lastSameChapterRow + 1;

    }


    // --------------------------------------
    // Same Subject Found
    // Add after subject's last chapter
    // --------------------------------------

    if (lastSameSubjectRow) {

        return lastSameSubjectRow + 1;

    }


    // --------------------------------------
    // Same Class Found
    // Add after class's last subject
    // --------------------------------------

    if (lastSameClassRow) {

        return lastSameClassRow + 1;

    }


    // --------------------------------------
    // Completely New Class
    // Add at end
    // --------------------------------------

    return worksheet.rowCount + 1;

}


// ------------------------------------------
// Write Data Into Row
// ------------------------------------------

function writeUploadRow(
    row,
    {
        className,
        subject,
        chapterName,
        tutorialTitle,
        language,
        youtubeUrl,
        videoId,
        playlistId,
        uploadedAt
    }
) {

    row.getCell(1).value =
        formatClass(className);

    row.getCell(2).value =
        subject || "";

    row.getCell(3).value =
        chapterName || "";

    row.getCell(4).value =
        tutorialTitle || "";

    row.getCell(5).value =
        language || "";

    setYouTubeLinkCell(
        row.getCell(6),
        youtubeUrl
    );

    row.getCell(7).value =
        videoId || "";

    row.getCell(8).value =
        playlistId || "";

    row.getCell(9).value =
        uploadedAt ||
        new Date().toISOString();

}


// ==========================================
// GET YOUTUBE UPLOADS
// ==========================================

router.get("/", async (req, res) => {

    try {

        if (!fs.existsSync(EXCEL_FILE)) {

            return res.json([]);

        }

        const workbook =
            new ExcelJS.Workbook();

        await workbook.xlsx.readFile(
            EXCEL_FILE
        );

        const worksheet =
            workbook.getWorksheet(
                "YouTube Uploads"
            );

        if (!worksheet) {

            return res.json([]);

        }

        const uploads = [];

        worksheet.eachRow(
            (row, rowNumber) => {

                if (rowNumber === 1) {
                    return;
                }

                uploads.push({

                    rowNumber,

                    className:
                        row.getCell(1).value || "",

                    subject:
                        row.getCell(2).value || "",

                    chapter:
                        row.getCell(3).value || "",

                    topic:
                        row.getCell(4).value || "",

                    language:
                        row.getCell(5).value || "",

                    youtubeLink:
                        row.getCell(6).hyperlink ||
                        row.getCell(6).value ||
                        "",

                    videoId:
                        row.getCell(7).value || "",

                    playlistId:
                        row.getCell(8).value || "",

                    uploadedAt:
                        row.getCell(9).value || ""

                });

            }
        );

        res.json(uploads);

    } catch (error) {

        console.error(
            "Failed to read YouTube Excel:",
            error
        );

        res.status(500).json({

            message:
                "Failed to read YouTube upload data."

        });

    }

});


// ==========================================
// ADD MANUAL YOUTUBE UPLOAD
// ==========================================

router.post("/", async (req, res) => {

    try {

        const {

            className,
            subject,
            chapterName,
            tutorialTitle,
            language,
            youtubeUrl,
            videoId,
            playlistId,
            uploadedAt

        } = req.body;


        // ----------------------------------
        // Validation
        // ----------------------------------

        if (
            !className ||
            !subject ||
            !chapterName ||
            !tutorialTitle ||
            !language
        ) {

            return res.status(400).json({

                message:
                    "Class, Subject, Chapter, Topic and Language are required."

            });

        }


        // ----------------------------------
        // Create workbook
        // ----------------------------------

        const workbook =
            new ExcelJS.Workbook();


        if (fs.existsSync(EXCEL_FILE)) {

            await workbook.xlsx.readFile(
                EXCEL_FILE
            );

        }


        let worksheet =
            workbook.getWorksheet(
                "YouTube Uploads"
            );


        if (!worksheet) {

            worksheet =
                workbook.addWorksheet(
                    "YouTube Uploads"
                );

        }


        // ----------------------------------
        // Create Header if required
        // ----------------------------------

        if (worksheet.rowCount === 0) {

            worksheet.addRow([

                "Class",
                "Subject",
                "Chapter",
                "Topic",
                "Language",
                "YouTube Link",
                "Video ID",
                "Playlist ID",
                "Uploaded At"

            ]);

            worksheet.getRow(1).font = {
                bold: true
            };

        }


        const formattedClass =
            formatClass(className);


        // ----------------------------------
        // Determine Video ID
        // ----------------------------------

        const finalVideoId =
            videoId ||
            getVideoIdFromUrl(
                youtubeUrl
            );


        // ----------------------------------
        // Prevent duplicate Video ID
        // ----------------------------------

        if (finalVideoId) {

            for (
                let rowNumber = 2;
                rowNumber <= worksheet.rowCount;
                rowNumber++
            ) {

                const existingVideoId =
                    worksheet
                        .getRow(rowNumber)
                        .getCell(7)
                        .value;

                if (
                    String(existingVideoId || "")
                        .trim() ===
                    String(finalVideoId)
                        .trim()
                ) {

                    return res.status(409).json({

                        message:
                            "This YouTube video already exists in Excel."

                    });

                }

            }

        }


        // ----------------------------------
        // Find correct position
        // ----------------------------------

        const insertPosition =
            findInsertPosition(
                worksheet,
                {
                    className:
                        formattedClass,

                    subject:
                        String(subject).trim(),

                    chapter:
                        String(chapterName).trim()
                }
            );


        // ----------------------------------
        // Insert Row
        // ----------------------------------

        worksheet.insertRow(
            insertPosition,
            []
        );


        const row =
            worksheet.getRow(
                insertPosition
            );


        writeUploadRow(
            row,
            {

                className:
                    formattedClass,

                subject:
                    String(subject).trim(),

                chapterName:
                    String(chapterName).trim(),

                tutorialTitle:
                    String(tutorialTitle).trim(),

                language:
                    String(language).trim(),

                youtubeUrl:
                    youtubeUrl ||
                    (
                        finalVideoId
                            ? `https://www.youtube.com/watch?v=${finalVideoId}`
                            : ""
                    ),

                videoId:
                    finalVideoId,

                playlistId:
                    playlistId || "",

                uploadedAt:
                    uploadedAt ||
                    new Date().toISOString()

            }
        );


        // ----------------------------------
        // Column widths
        // ----------------------------------

        worksheet.getColumn(1).width = 15;
        worksheet.getColumn(2).width = 20;
        worksheet.getColumn(3).width = 30;
        worksheet.getColumn(4).width = 50;
        worksheet.getColumn(5).width = 15;
        worksheet.getColumn(6).width = 55;
        worksheet.getColumn(7).width = 25;
        worksheet.getColumn(8).width = 25;
        worksheet.getColumn(9).width = 30;


        // ----------------------------------
        // Save
        // ----------------------------------

        await workbook.xlsx.writeFile(
            EXCEL_FILE
        );


        console.log(
            "Manual YouTube Entry Added:",
            formattedClass,
            subject,
            chapterName,
            tutorialTitle
        );


        res.status(201).json({

            message:
                "YouTube upload entry added successfully.",

            rowNumber:
                insertPosition

        });


    } catch (error) {

        console.error(
            "Failed to add YouTube Excel entry:",
            error
        );

        res.status(500).json({

            message:
                "Failed to add YouTube upload entry."

        });

    }

});


// ==========================================
// EDIT / SAVE EXISTING ENTRY
// ==========================================

router.put("/:rowNumber", async (req, res) => {

    try {

        const rowNumber =
            Number(req.params.rowNumber);


        if (
            !Number.isInteger(rowNumber) ||
            rowNumber < 2
        ) {

            return res.status(400).json({

                message:
                    "Invalid Excel row number."

            });

        }


        if (!fs.existsSync(EXCEL_FILE)) {

            return res.status(404).json({

                message:
                    "Excel file not found."

            });

        }


        const workbook =
            new ExcelJS.Workbook();

        await workbook.xlsx.readFile(
            EXCEL_FILE
        );


        const worksheet =
            workbook.getWorksheet(
                "YouTube Uploads"
            );


        if (!worksheet) {

            return res.status(404).json({

                message:
                    "YouTube Uploads worksheet not found."

            });

        }


        if (
            rowNumber >
            worksheet.rowCount
        ) {

            return res.status(404).json({

                message:
                    "Excel row not found."

            });

        }


        const {

            className,
            subject,
            chapterName,
            tutorialTitle,
            language,
            youtubeUrl,
            videoId,
            playlistId,
            uploadedAt

        } = req.body;


        // ----------------------------------
        // Validation
        // ----------------------------------

        if (
            !className ||
            !subject ||
            !chapterName ||
            !tutorialTitle ||
            !language
        ) {

            return res.status(400).json({

                message:
                    "Class, Subject, Chapter, Topic and Language are required."

            });

        }


        const finalVideoId =
            videoId ||
            getVideoIdFromUrl(
                youtubeUrl
            );


        // ----------------------------------
        // Duplicate check
        // ----------------------------------

        if (finalVideoId) {

            for (
                let currentRow = 2;
                currentRow <= worksheet.rowCount;
                currentRow++
            ) {

                if (
                    currentRow === rowNumber
                ) {
                    continue;
                }


                const existingVideoId =
                    worksheet
                        .getRow(currentRow)
                        .getCell(7)
                        .value;


                if (
                    String(existingVideoId || "")
                        .trim() ===
                    String(finalVideoId)
                        .trim()
                ) {

                    return res.status(409).json({

                        message:
                            "Another Excel entry already uses this YouTube video."

                    });

                }

            }

        }


        // ----------------------------------
        // Remove old row
        // ----------------------------------

        worksheet.spliceRows(
            rowNumber,
            1
        );


        // ----------------------------------
        // Find new correct position
        // ----------------------------------

        const insertPosition =
            findInsertPosition(
                worksheet,
                {

                    className:
                        formatClass(className),

                    subject:
                        String(subject).trim(),

                    chapter:
                        String(chapterName).trim()

                }
            );


        // ----------------------------------
        // Insert updated row
        // ----------------------------------

        worksheet.insertRow(
            insertPosition,
            []
        );


        const row =
            worksheet.getRow(
                insertPosition
            );


        writeUploadRow(
            row,
            {

                className:
                    className,

                subject:
                    subject,

                chapterName:
                    chapterName,

                tutorialTitle:
                    tutorialTitle,

                language:
                    language,

                youtubeUrl:
                    youtubeUrl ||
                    (
                        finalVideoId
                            ? `https://www.youtube.com/watch?v=${finalVideoId}`
                            : ""
                    ),

                videoId:
                    finalVideoId,

                playlistId:
                    playlistId || "",

                uploadedAt:
                    uploadedAt ||
                    new Date().toISOString()

            }
        );


        await workbook.xlsx.writeFile(
            EXCEL_FILE
        );


        console.log(
            "YouTube Excel Entry Updated:",
            insertPosition
        );


        res.json({

            message:
                "YouTube upload entry updated successfully.",

            rowNumber:
                insertPosition

        });


    } catch (error) {

        console.error(
            "Failed to update YouTube Excel entry:",
            error
        );

        res.status(500).json({

            message:
                "Failed to update YouTube upload entry."

        });

    }

});


// ==========================================
// DOWNLOAD YOUTUBE UPLOADS EXCEL
// ==========================================

router.get("/download", async (req, res) => {

    try {

        if (!fs.existsSync(EXCEL_FILE)) {

            return res.status(404).json({

                message:
                    "Excel file not found."

            });

        }


        res.download(

            EXCEL_FILE,

            "youtubeUploads.xlsx",

            (error) => {

                if (error) {

                    console.error(
                        "Excel Download Error:",
                        error
                    );

                }

            }

        );

    } catch (error) {

        console.error(
            "Failed to download Excel:",
            error
        );

        res.status(500).json({

            message:
                "Failed to download Excel file."

        });

    }

});


export default router;