import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_FILE = path.resolve(
    __dirname,
    "../../generated/uploads/youtubeUploads.xlsx"
);


// --------------------------------
// Format Class
// --------------------------------

function formatClass(className) {

    return String(className || "")
        .replace(/^class-/i, "Class ");

}


// --------------------------------
// Normalize Value
// --------------------------------

function normalize(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();

}


// --------------------------------
// Get Row Data
// --------------------------------

function getRowData(row) {

    return {

        className: normalize(
            row.getCell(1).value
        ),

        subject: normalize(
            row.getCell(2).value
        ),

        chapterName: normalize(
            row.getCell(3).value
        ),

        tutorialTitle: normalize(
            row.getCell(4).value
        ),

        language: normalize(
            row.getCell(5).value
        ),

        youtubeUrl: normalize(
            row.getCell(6).text ||
            row.getCell(6).value
        ),

        videoId: normalize(
            row.getCell(7).value
        ),

        playlistId: normalize(
            row.getCell(8).value
        ),

        uploadedAt: normalize(
            row.getCell(9).value
        )

    };

}


// --------------------------------
// Language Order
// --------------------------------

function getLanguageOrder(language) {

    const value =
        normalize(language)
            .toLowerCase();

    if (value === "english") {
        return 0;
    }

    if (value === "hindi") {
        return 1;
    }

    return 2;

}


// --------------------------------
// Reorder Rows
// --------------------------------

function reorderRows(worksheet) {

    const rows = [];

    // --------------------------------
    // Read all existing rows
    // --------------------------------

    for (
        let rowNumber = 2;
        rowNumber <= worksheet.rowCount;
        rowNumber++
    ) {

        const row =
            worksheet.getRow(rowNumber);

        const data =
            getRowData(row);

        if (
            !data.className &&
            !data.subject &&
            !data.chapterName &&
            !data.tutorialTitle
        ) {
            continue;
        }

        rows.push({

            data,

            originalIndex:
                rows.length

        });

    }


    // --------------------------------
    // Preserve chapter order
    // --------------------------------

    const chapterOrder = [];

    for (const item of rows) {

        const key =
            `${item.data.className}|||` +
            `${item.data.subject}|||` +
            `${item.data.chapterName}`;

        if (!chapterOrder.includes(key)) {

            chapterOrder.push(key);

        }

    }


    // --------------------------------
    // Sort
    // --------------------------------
    //
    // 1. Class
    // 2. Subject
    // 3. Chapter order
    // 4. English
    // 5. Hindi
    // 6. Original upload order
    //
    // --------------------------------

    rows.sort((a, b) => {

        const classCompare =
            a.data.className.localeCompare(
                b.data.className,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base"
                }
            );

        if (classCompare !== 0) {
            return classCompare;
        }


        const subjectCompare =
            a.data.subject.localeCompare(
                b.data.subject,
                undefined,
                {
                    sensitivity: "base"
                }
            );

        if (subjectCompare !== 0) {
            return subjectCompare;
        }


        const keyA =
            `${a.data.className}|||` +
            `${a.data.subject}|||` +
            `${a.data.chapterName}`;

        const keyB =
            `${b.data.className}|||` +
            `${b.data.subject}|||` +
            `${b.data.chapterName}`;


        const chapterCompare =
            chapterOrder.indexOf(keyA) -
            chapterOrder.indexOf(keyB);

        if (chapterCompare !== 0) {
            return chapterCompare;
        }


        // --------------------------------
        // IMPORTANT:
        // English BEFORE Hindi
        // --------------------------------

        const languageCompare =
            getLanguageOrder(
                a.data.language
            ) -
            getLanguageOrder(
                b.data.language
            );

        if (languageCompare !== 0) {
            return languageCompare;
        }


        // --------------------------------
        // Same language:
        // preserve upload order
        // --------------------------------

        return (
            a.originalIndex -
            b.originalIndex
        );

    });


    // --------------------------------
    // Remove old data rows
    // --------------------------------

    if (worksheet.rowCount > 1) {

        worksheet.spliceRows(
            2,
            worksheet.rowCount - 1
        );

    }


    // --------------------------------
    // Add sorted rows
    // --------------------------------

    for (const item of rows) {

        worksheet.addRow([

            item.data.className,

            item.data.subject,

            item.data.chapterName,

            item.data.tutorialTitle,

            item.data.language,

            item.data.youtubeUrl,

            item.data.videoId,

            item.data.playlistId,

            item.data.uploadedAt

        ]);

    }

}


// --------------------------------
// Add YouTube Upload To Excel
// --------------------------------

export async function addYouTubeUploadToExcel({

    className,
    subject,
    chapterName,
    tutorialTitle,
    language,
    videoId,
    youtubeUrl,
    playlistId,
    uploadedAt

}) {

    const workbook =
        new ExcelJS.Workbook();


    // --------------------------------
    // Read Existing Excel
    // --------------------------------

    if (fs.existsSync(EXCEL_FILE)) {

        await workbook.xlsx.readFile(
            EXCEL_FILE
        );

    }


    let worksheet =
        workbook.getWorksheet(
            "YouTube Uploads"
        );


    // --------------------------------
    // Create Worksheet
    // --------------------------------

    if (!worksheet) {

        worksheet =
            workbook.addWorksheet(
                "YouTube Uploads"
            );

    }


    // --------------------------------
    // Create Header
    // --------------------------------

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

        worksheet.getRow(1).alignment = {
            vertical: "middle"
        };

    }


    // --------------------------------
    // New Video ID
    // --------------------------------

    const newVideoId =
        normalize(videoId);


    // --------------------------------
    // Check Duplicate
    // --------------------------------

    if (newVideoId) {

        for (
            let rowNumber = 2;
            rowNumber <= worksheet.rowCount;
            rowNumber++
        ) {

            const row =
                worksheet.getRow(rowNumber);

            const existingVideoId =
                normalize(
                    row.getCell(7).value
                );

            if (
                existingVideoId &&
                existingVideoId === newVideoId
            ) {

                console.log(
                    "Excel Entry Already Exists:",
                    newVideoId
                );

                return;

            }

        }

    }


    // --------------------------------
    // Prepare New Row
    // --------------------------------

    const newRowData = {

        className:
            formatClass(className),

        subject:
            normalize(subject),

        chapterName:
            normalize(chapterName),

        tutorialTitle:
            normalize(tutorialTitle),

        language:
            language === "en"
                ? "English"
                : "Hindi",

        youtubeUrl:
            youtubeUrl ||
            `https://www.youtube.com/watch?v=${videoId}`,

        videoId:
            newVideoId,

        playlistId:
            playlistId || "",

        uploadedAt:
            uploadedAt ||
            new Date().toISOString()

    };


    // --------------------------------
    // Add New Row
    // --------------------------------

    worksheet.addRow([

        newRowData.className,

        newRowData.subject,

        newRowData.chapterName,

        newRowData.tutorialTitle,

        newRowData.language,

        newRowData.youtubeUrl,

        newRowData.videoId,

        newRowData.playlistId,

        newRowData.uploadedAt

    ]);


    // --------------------------------
    // IMPORTANT:
    // Reorder complete Excel
    // --------------------------------

    reorderRows(
        worksheet
    );


    // --------------------------------
    // Rebuild YouTube Hyperlinks
    // --------------------------------

    for (
        let rowNumber = 2;
        rowNumber <= worksheet.rowCount;
        rowNumber++
    ) {

        const row =
            worksheet.getRow(rowNumber);

        const url =
            normalize(
                row.getCell(6).text ||
                row.getCell(6).value
            );

        if (
            url &&
            url.startsWith("http")
        ) {

            row.getCell(6).value = {

                text: url,

                hyperlink: url

            };

        }

    }


    // --------------------------------
    // Column Width
    // --------------------------------

    worksheet.getColumn(1).width = 15;

    worksheet.getColumn(2).width = 20;

    worksheet.getColumn(3).width = 30;

    worksheet.getColumn(4).width = 50;

    worksheet.getColumn(5).width = 15;

    worksheet.getColumn(6).width = 55;

    worksheet.getColumn(7).width = 25;

    worksheet.getColumn(8).width = 25;

    worksheet.getColumn(9).width = 30;


    // --------------------------------
    // Freeze Header
    // --------------------------------

    worksheet.views = [

        {

            state: "frozen",

            ySplit: 1

        }

    ];


    // --------------------------------
    // Create Folder
    // --------------------------------

    await fs.promises.mkdir(

        path.dirname(
            EXCEL_FILE
        ),

        {
            recursive: true
        }

    );


    // --------------------------------
    // Save Excel
    // --------------------------------

    await workbook.xlsx.writeFile(
        EXCEL_FILE
    );


    console.log(
        "YouTube Excel Updated:",
        EXCEL_FILE
    );

}


// --------------------------------
// Export Excel Path
// --------------------------------

export {

    EXCEL_FILE

};