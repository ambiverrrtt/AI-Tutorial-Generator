import { google } from "googleapis";
import { getSourceYouTubeClient } from "./sourceAuth.js";

const PLAYLIST_ID = "PLcYJqwo7Qj2Y";

async function testPlaylist() {

    console.log("");
    console.log("================================");
    console.log("PLAYLIST ACCESS TEST");
    console.log("================================");

    const auth = await getSourceYouTubeClient();

    const youtube = google.youtube({
        version: "v3",
        auth
    });

    try {

        const response =
            await youtube.playlistItems.list({

                part: [
                    "snippet",
                    "contentDetails"
                ],

                playlistId: PLAYLIST_ID,

                maxResults: 50

            });

        const items =
            response.data.items || [];

        console.log("");
        console.log(
            "Playlist ID:",
            PLAYLIST_ID
        );

        console.log(
            "Videos Found:",
            items.length
        );

        console.log("");

        for (const item of items) {

            console.log(
                `${item.snippet.position + 1}. ${item.snippet.title}`
            );

            console.log(
                `   Video ID: ${item.contentDetails.videoId}`
            );

            console.log(
                `   Link: https://www.youtube.com/watch?v=${item.contentDetails.videoId}`
            );

            console.log("");

        }

        console.log("================================");
        console.log("PLAYLIST ACCESS SUCCESS");
        console.log("================================");

    } catch (error) {

        console.log("");
        console.log("================================");
        console.log("PLAYLIST ACCESS FAILED");
        console.log("================================");

        console.error(
            error?.response?.data?.error ||
            error.message
        );

        console.log("");

    }

}

testPlaylist();