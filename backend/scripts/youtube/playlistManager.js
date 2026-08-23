import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { getYouTubeClient } from "./auth.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLAYLIST_FILE = path.resolve(
    __dirname,
    "../../generated/playlists/playlists.json"
);

const playlistDir = path.dirname(PLAYLIST_FILE);

if (!fs.existsSync(playlistDir)) {
    fs.mkdirSync(playlistDir, { recursive: true });
}

console.log("PLAYLIST FILE:", PLAYLIST_FILE);

export async function getOrCreatePlaylist({
    className,
    subject,
    chapterName,
    language,
    youtubeAccountId
}) {

    const auth = getYouTubeClient(
    youtubeAccountId
);

    const youtube = google.youtube({
        version: "v3",
        auth
    });

    let playlists = {};

    try {

        if (fs.existsSync(PLAYLIST_FILE)) {

            const data = fs.readFileSync(
                PLAYLIST_FILE,
                "utf8"
            ).trim();

            playlists = data ? JSON.parse(data) : {};
        }

    } catch (err) {

        playlists = {};

    }

    const formattedClass = className.replace(/^class-/i, "Class ");

    const playlistTitle =
        `${formattedClass} ${subject} Chapter - ${chapterName} ( ${language === "en" ? "English" : "Hindi"} )`;

    const cacheKey =
    `${youtubeAccountId}_${className}_${subject}_${chapterName}_${language}`;

    // ============================
    // Check Local Cache
    // ============================

    if (playlists[cacheKey]) {

        console.log("Playlist Found In Cache");

        return playlists[cacheKey];
    }

    // ============================
    // Search Playlist (All Pages)
    // ============================

    console.log("Searching Playlist:", playlistTitle);

    let pageToken = undefined;
    let playlist = null;

    do {

        const response = await youtube.playlists.list({
            part: ["snippet"],
            mine: true,
            maxResults: 50,
            pageToken
        });

        playlist = response.data.items.find(
            (item) => item.snippet.title === playlistTitle
        );

        if (playlist) {
            break;
        }

        pageToken = response.data.nextPageToken;

    } while (pageToken);

    // ============================
    // Playlist Found
    // ============================

    if (playlist) {

        console.log("Playlist Found");
        console.log("Playlist ID:", playlist.id);

        playlists[cacheKey] = playlist.id;

        fs.writeFileSync(
            PLAYLIST_FILE,
            JSON.stringify(playlists, null, 2)
        );

        return playlist.id;
    }

    // ============================
    // Create Playlist
    // ============================

    console.log("Playlist Not Found");

    const createResponse = await youtube.playlists.insert({
        part: ["snippet", "status"],
        requestBody: {
            snippet: {
                title: playlistTitle,
                description: ""
            },
            status: {
                privacyStatus: "unlisted"
            }
        }
    });

    console.log("Playlist Created");
    console.log("Playlist ID:", createResponse.data.id);

    playlists[cacheKey] = createResponse.data.id;

    fs.writeFileSync(
        PLAYLIST_FILE,
        JSON.stringify(playlists, null, 2)
    );

    return createResponse.data.id;
}