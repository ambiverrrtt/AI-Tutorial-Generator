import { getOrCreatePlaylist } from "./playlistManager.js";
import { uploadVideo } from "./uploadVideo.js";


// ==================================================
// TEST JOB
// ==================================================

const TEST_JOB = {

    className:
        "class-10",

    subject:
        "Mathematics",

    chapterName:
        "PAIR OF LINEAR EQUATIONS IN TWO VARIABLES",

    tutorialTitle:
        "EXERCISE 3.1",

    language:
        "en",

    videoPath:
        "generated\\videos\\class-10\\Mathematics\\PAIR OF LINEAR EQUATIONS IN TWO VARIABLES\\3.1-EXERCISE 3.1\\tutorial.mp4",

    thumbnailPath:
        "generated\\images\\class-10\\Mathematics\\PAIR OF LINEAR EQUATIONS IN TWO VARIABLES\\3.1-EXERCISE 3.1\\thumbnail.png"

};


// ==================================================
// TEST UPLOAD
// ==================================================

async function testUpload() {

    console.log("");

    console.log("========================================");
    console.log("       SINGLE VIDEO UPLOAD TEST");
    console.log("========================================");

    console.log("");


    // --------------------------------------
    // JOB INFORMATION
    // --------------------------------------

    console.log(
        "Class:",
        TEST_JOB.className
    );

    console.log(
        "Subject:",
        TEST_JOB.subject
    );

    console.log(
        "Chapter:",
        TEST_JOB.chapterName
    );

    console.log(
        "Topic:",
        TEST_JOB.tutorialTitle
    );

    console.log(
        "Language:",
        TEST_JOB.language
    );

    console.log(
        "Video:",
        TEST_JOB.videoPath
    );

    console.log(
        "Thumbnail:",
        TEST_JOB.thumbnailPath
    );

    console.log("");


    try {


        // --------------------------------------
        // STEP 1
        // GET / CREATE PLAYLIST
        // --------------------------------------

        console.log(
            "STEP 1: Getting playlist..."
        );

        const playlistId =
            await getOrCreatePlaylist({

                className:
                    TEST_JOB.className,

                subject:
                    TEST_JOB.subject,

                chapterName:
                    TEST_JOB.chapterName,

                language:
                    TEST_JOB.language

            });


        console.log(
            "Playlist ID:",
            playlistId
        );


        // --------------------------------------
        // STEP 2
        // UPLOAD VIDEO
        // --------------------------------------

        console.log("");

        console.log(
            "STEP 2: Uploading video..."
        );


        const videoId =
            await uploadVideo({

                videoPath:
                    TEST_JOB.videoPath,

                thumbnailPath:
                    TEST_JOB.thumbnailPath,

                title:
                    TEST_JOB.tutorialTitle,

                playlistId,

                language:
                    TEST_JOB.language

            });


        // --------------------------------------
        // SUCCESS
        // --------------------------------------

        console.log("");

        console.log("========================================");
        console.log("       TEST UPLOAD SUCCESS");
        console.log("========================================");

        console.log(
            "Video ID:",
            videoId
        );

        console.log(
            "YouTube URL:",
            `https://www.youtube.com/watch?v=${videoId}`
        );

        console.log(
            "Playlist ID:",
            playlistId
        );

        console.log("");

        console.log("========================================");
        console.log("");


    } catch (error) {


        // --------------------------------------
        // FAILED
        // --------------------------------------

        console.log("");

        console.log("========================================");
        console.log("       TEST UPLOAD FAILED");
        console.log("========================================");

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Response:",
            error?.response?.data ||
            "No response data"
        );

        console.error(
            "Code:",
            error?.code ||
            "No error code"
        );

        console.log("");

        console.log("========================================");
        console.log("");

    }

}


// ==================================================
// RUN
// ==================================================

testUpload();