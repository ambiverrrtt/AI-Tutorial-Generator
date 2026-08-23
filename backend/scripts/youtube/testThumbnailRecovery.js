import { generateThumbnail } from "../gemini/generateThumbnail.js";

const narrationJson = {
    title: "EXERCISE 3.1",
    sectionNumber: "3.1",
    chapterName: "PAIR OF LINEAR EQUATIONS IN TWO VARIABLES",
    className: "class-10",
    subject: "Mathematics"
};

async function test() {

    console.log("");
    console.log("========================================");
    console.log("       THUMBNAIL RECOVERY TEST");
    console.log("========================================");

    try {

        await generateThumbnail(
            narrationJson,
            1
        );

        console.log("");
        console.log("========================================");
        console.log("THUMBNAIL TEST SUCCESS");
        console.log("========================================");

    } catch (error) {

        console.log("");
        console.log("========================================");
        console.log("THUMBNAIL TEST FAILED");
        console.log("========================================");

        console.error(
            error?.response?.data ||
            error.message ||
            error
        );

    }

}

test();