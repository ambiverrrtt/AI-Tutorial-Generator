import { google } from "googleapis";
import { getSourceYouTubeClient } from "./sourceAuth.js";
import { addYouTubeUploadToExcel } from "./youtubeExcel.js";
import ExcelJS from "exceljs";
import fs from "fs";
import { EXCEL_FILE } from "./youtubeExcel.js";

// ==================================================
// CONFIGURATION
// ==================================================

const PLAYLIST_ID = "PLcYJqwo7Qj2Y";

const CLASS_NAME = "class-10";

const SUBJECT = "Mathematics";

const CHAPTER_NAME = "Arithmetic Progressions";

const LANGUAGE = "hi";
// en = English
// hi = Hindi

// ==================================================
// GET EXISTING VIDEO IDs FROM EXCEL
// ==================================================

async function getExistingVideoIds() {

    const existingIds = new Set();

    if (!fs.existsSync(EXCEL_FILE)) {
        return existingIds;
    }

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(
        EXCEL_FILE
    );

    const worksheet =
        workbook.getWorksheet(
            "YouTube Uploads"
        );

    if (!worksheet) {
        return existingIds;
    }

    for (
        let rowNumber = 2;
        rowNumber <= worksheet.rowCount;
        rowNumber++
    ) {

        const videoId =
            worksheet
                .getRow(rowNumber)
                .getCell(7)
                .value;

        if (videoId) {

            existingIds.add(
                String(videoId).trim()
            );

        }

    }

    return existingIds;
}


// ==================================================
// GET PLAYLIST DETAILS
// ==================================================

async function getPlaylist(
    youtube,
    playlistId
) {

    const response =
        await youtube.playlists.list({

            part: ["snippet"],

            id: playlistId

        });

    const playlist =
        response.data.items?.[0];

    if (!playlist) {

        throw new Error(
            `Playlist not found or not accessible: ${playlistId}`
        );

    }

    return playlist;
}


// ==================================================
// GET ALL PLAYLIST VIDEOS
// ==================================================

async function getAllPlaylistVideos(
    youtube,
    playlistId
) {

    const videos = [];

    let pageToken = undefined;

    do {

        const response =
            await youtube.playlistItems.list({

                part: [
                    "snippet",
                    "contentDetails"
                ],

                playlistId,

                maxResults: 50,

                pageToken

            });

        const items =
            response.data.items || [];

        for (const item of items) {

            const videoId =
                item.contentDetails?.videoId;

            if (!videoId) {
                continue;
            }

            videos.push({

                videoId,

                title:
                    item.snippet?.title || "",

                publishedAt:
                    item.snippet?.publishedAt || ""

            });

        }

        pageToken =
            response.data.nextPageToken;

    } while (pageToken);

    return videos;
}


// ==================================================
// MAIN
// ==================================================

async function importPlaylist() {

    console.log("");
    console.log("========================================");
    console.log("      PLAYLIST → EXCEL IMPORT");
    console.log("========================================");
    console.log("");

    // ----------------------------------------------
    // SOURCE ACCOUNT AUTH
    // ----------------------------------------------

    const auth =
        await getSourceYouTubeClient();

    const youtube =
        google.youtube({

            version: "v3",

            auth

        });


    // ----------------------------------------------
    // SHOW AUTHENTICATED CHANNEL
    // ----------------------------------------------

    const channelResponse =
        await youtube.channels.list({

            part: ["snippet"],

            mine: true

        });

    const channel =
        channelResponse.data.items?.[0];

    console.log(
        "Authenticated Channel:",
        channel?.snippet?.title || "Unknown"
    );

    console.log(
        "Channel ID:",
        channel?.id || "Unknown"
    );

    console.log("");


    // ----------------------------------------------
    // GET PLAYLIST
    // ----------------------------------------------

    console.log(
        "Playlist ID:",
        PLAYLIST_ID
    );

    const playlist =
        await getPlaylist(
            youtube,
            PLAYLIST_ID
        );

    console.log(
        "Playlist:",
        playlist.snippet.title
    );

    console.log("");


    // ----------------------------------------------
    // GET ALL VIDEOS
    // ----------------------------------------------

    console.log(
        "Fetching playlist videos..."
    );

    const videos =
        await getAllPlaylistVideos(
            youtube,
            PLAYLIST_ID
        );

    console.log(
        `Videos Found: ${videos.length}`
    );

    console.log("");


    // ----------------------------------------------
    // GET EXISTING EXCEL VIDEO IDs
    // ----------------------------------------------

    const existingVideoIds =
        await getExistingVideoIds();

    console.log(
        `Existing Excel Videos: ${existingVideoIds.size}`
    );

    console.log("");


    // ----------------------------------------------
    // IMPORT
    // ----------------------------------------------

    let added = 0;

    let skipped = 0;

    for (const video of videos) {

        console.log(
            `Processing: ${video.title}`
        );

        console.log(
            `Video ID: ${video.videoId}`
        );


        // ------------------------------------------
        // DUPLICATE CHECK
        // ------------------------------------------

        if (
            existingVideoIds.has(
                video.videoId
            )
        ) {

            console.log(
                "Already exists in Excel → SKIPPED"
            );

            skipped++;

            console.log("");

            continue;
        }


        // ------------------------------------------
        // ADD TO EXCEL
        // ------------------------------------------

        try {

            await addYouTubeUploadToExcel({

                className:
                    CLASS_NAME,

                subject:
                    SUBJECT,

                chapterName:
                    CHAPTER_NAME,

                tutorialTitle:
                    video.title,

                language:
                    LANGUAGE,

                videoId:
                    video.videoId,

                youtubeUrl:
                    `https://www.youtube.com/watch?v=${video.videoId}`,

                playlistId:
                    PLAYLIST_ID,

                uploadedAt:
                    video.publishedAt

            });


            existingVideoIds.add(
                video.videoId
            );

            added++;

            console.log(
                "Added to Excel"
            );

        } catch (error) {

            console.error(
                "Failed to add video:",
                video.title
            );

            console.error(
                error.message
            );

        }

        console.log("");

    }


    // ----------------------------------------------
    // FINAL SUMMARY
    // ----------------------------------------------

    console.log("");
    console.log("========================================");
    console.log("        IMPORT COMPLETED");
    console.log("========================================");

    console.log(
        "Playlist:",
        playlist.snippet.title
    );

    console.log(
        "Playlist ID:",
        PLAYLIST_ID
    );

    console.log(
        "Total Videos:",
        videos.length
    );

    console.log(
        "New Entries Added:",
        added
    );

    console.log(
        "Duplicate Entries Skipped:",
        skipped
    );

    console.log(
        "Excel File:",
        EXCEL_FILE
    );

    console.log("========================================");
    console.log("");

}


// ==================================================
// RUN
// ==================================================

importPlaylist()
    .catch(error => {

        console.error("");

        console.error(
            "PLAYLIST IMPORT FAILED"
        );

        console.error(
            error.message
        );

        console.error("");

        process.exit(1);

    });