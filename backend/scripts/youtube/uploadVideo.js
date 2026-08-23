import fs from "fs";
import { google } from "googleapis";
import { getYouTubeClient } from "./auth.js";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../");

export async function uploadVideo({
    videoPath,
    thumbnailPath,
    title,
    playlistId,
    language = "en",
    onUploaded,
    existingVideoId = null,
        youtubeAccountId
}) {
 if (!youtubeAccountId) {
    throw new Error(
        "youtubeAccountId is required for YouTube upload."
    );
}
   const absoluteVideoPath = path.resolve(ROOT_DIR, videoPath);
const absoluteThumbnailPath = path.resolve(ROOT_DIR, thumbnailPath);

if (!fs.existsSync(absoluteVideoPath)) {

    throw new Error(
        `Video Not Found : ${absoluteVideoPath}`
    );

}

console.log("Video:", absoluteVideoPath);
console.log("Thumbnail:", absoluteThumbnailPath);

    const auth =
    getYouTubeClient(youtubeAccountId);

    const youtube = google.youtube({
        version: "v3",
        auth
    });

    console.log(`Uploading ${title} (${language})`);
console.log("STEP: Starting YouTube video upload...");
   let videoId;

if (existingVideoId) {

    console.log(
        `YouTube video already exists: ${existingVideoId}`
    );

    console.log(
        "Skipping YouTube video upload."
    );

    videoId = existingVideoId;

} else {

    console.log("STEP: Starting YouTube video upload...");

    const response = await youtube.videos.insert({

        part: [
            "snippet",
            "status"
        ],

        requestBody: {

            snippet: {

                title,

                description: "",

                tags: [],

                categoryId: "27"

            },

            status: {

                privacyStatus: "unlisted",

                selfDeclaredMadeForKids: true

            }

        },

        media: {

            body: fs.createReadStream(
                absoluteVideoPath
            )

        }

    });

    console.log(
        "STEP: Video upload API completed."
    );

    videoId = response.data.id;

    console.log(
        "Uploaded:",
        videoId
    );

    if (onUploaded) {

        await onUploaded(videoId);

    }

}

    

   if (thumbnailPath && fs.existsSync(absoluteThumbnailPath)) {

    try {

        const tempThumbnail = absoluteThumbnailPath.replace(".png", "_youtube.jpg");

        await sharp(absoluteThumbnailPath)
            .flatten({ background: "#ffffff" }) // remove transparency
            .jpeg({ quality: 90 })
            .toFile(tempThumbnail);

            console.log("Thumbnail Path:", thumbnailPath);
console.log(
    "Thumbnail Exists:",
    fs.existsSync(absoluteThumbnailPath)
);

console.log("YouTube JPG Exists:", fs.existsSync(tempThumbnail));

        await youtube.thumbnails.set({

            videoId,

            media: {

                body: fs.createReadStream(tempThumbnail)

            }

        });

        console.log("Thumbnail Uploaded");

        if (fs.existsSync(tempThumbnail)) {

    fs.unlinkSync(tempThumbnail);

    console.log("Temporary Thumbnail Deleted");

}

   } catch (err) {

    console.log("Thumbnail Upload Failed");
    console.error(err.response?.data || err);

}

}
console.log("Playlist ID:", playlistId);


    if (playlistId) {

    console.log(
        "Checking whether video is already in playlist..."
    );

    let playlistItemExists = false;

    let pageToken;

    do {

        const response =
            await youtube.playlistItems.list({

                part: ["snippet", "contentDetails"],

                playlistId,

                maxResults: 50,

                pageToken

            });

        const items =
            response.data.items || [];

        playlistItemExists =
            items.some(
                item =>
                    item.contentDetails?.videoId === videoId
            );

        if (playlistItemExists) {

            console.log(
                `Video ${videoId} already exists in playlist.`
            );

            break;

        }

        pageToken =
            response.data.nextPageToken;

    } while (pageToken);

    if (!playlistItemExists) {

        console.log(
            `Adding video ${videoId} to playlist...`
        );

        await youtube.playlistItems.insert({

            part: [
                "snippet"
            ],

            requestBody: {

                snippet: {

                    playlistId,

                    resourceId: {

                        kind: "youtube#video",

                        videoId

                    }

                }

            }

        });

        console.log(
            "Added To Playlist"
        );

    } else {

        console.log(
            "Playlist Add Skipped — Video Already Exists"
        );

    }

}

    return videoId;

}