import fs from "fs";
import path from "path";
import { execFile } from "child_process";

export async function generateAudio(
    narrationJson,
    language = "en"
) {

    console.log(
        `Generating Audio : ${narrationJson.title}`
    );

   const cleanTitle = narrationJson.title
    .replace(/^\d+(\.\d+)(\([A-Z]\))?\s*/, "");

const safeTitle = cleanTitle
    .replace(/⁰/g, "0")
    .replace(/¹/g, "1")
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .replace(/⁴/g, "4")
    .replace(/⁵/g, "5")
    .replace(/⁶/g, "6")
    .replace(/⁷/g, "7")
    .replace(/⁸/g, "8")
    .replace(/⁹/g, "9")
    .replace(/ⁿ/g, "n")
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi");

const folderName = (
    narrationJson.sectionNumber
        ? `${narrationJson.sectionNumber}-${safeTitle}`
        : safeTitle
)
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();

const safeChapterName = String(narrationJson.chapterName || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const outputFolder = path.join(
    "generated",
    language === "hi"
        ? "audio-hi"
        : "audio",
    narrationJson.className,
    narrationJson.subject,
    safeChapterName,
    folderName
);

await fs.promises.mkdir(
    outputFolder,
    {
        recursive: true
    }
);

    // ---------------------------------
    // Absolute paths
    // ---------------------------------

    const absoluteOutputFolder =
        path.resolve(outputFolder);

    const pythonPath =
        path.resolve(".venv", "Scripts", "python.exe");

    const ttsScript =
        path.resolve(
            language === "hi"
                ? "scripts/tts/edgeTTS.py"
                : "scripts/tts/kokoroTTS.py"
        );

    console.log("Python:", pythonPath);
    console.log("TTS Script:", ttsScript);

    // ---------------------------------
    // Process every scene
    // ---------------------------------

    for (const scene of narrationJson.scenes) {

        const sceneNumber =
            String(scene.scene).padStart(2, "0");

        const fileName =
            `${sceneNumber}.wav`;

        const outputPath =
            path.join(
                absoluteOutputFolder,
                fileName
            );

        // ---------------------------------
        // Skip existing audio
        // ---------------------------------

        if (fs.existsSync(outputPath)) {

            console.log(
                `${fileName} Already Exists`
            );

            continue;
        }

        const textFile =
            path.join(
                absoluteOutputFolder,
                `${sceneNumber}.txt`
            );

        console.log(
            `Generating Audio ${fileName}`
        );

        console.log(
            "Scene:",
            scene.scene
        );

        console.log(
            "Narration:",
            scene.narration
        );

        console.log(
            "Scene Object:",
            scene
        );

        // ---------------------------------
        // Save narration text
        // ---------------------------------

        await fs.promises.writeFile(
            textFile,
            scene.narration || "",
            "utf8"
        );

        await fs.promises.access(
            textFile,
            fs.constants.F_OK
        );

        console.log(
            "TXT File:",
            textFile
        );

        console.log(
            "TXT Exists:",
            fs.existsSync(textFile)
        );

        console.log(
            "Absolute TXT:",
            textFile
        );

        console.log(
            "Absolute WAV:",
            outputPath
        );

        console.log(
            "Python Exists:",
            fs.existsSync(pythonPath)
        );

        console.log(
            "TTS Script Exists:",
            fs.existsSync(ttsScript)
        );

        console.log(
            "Files in output folder:"
        );

        console.log(
            fs.readdirSync(absoluteOutputFolder)
        );

        // ---------------------------------
        // Run Python TTS
        // ---------------------------------

      const pythonTxtPath = textFile.replace(/\\/g, "/");
const pythonOutputPath = outputPath.replace(/\\/g, "/");
const pythonScriptPath = ttsScript.replace(/\\/g, "/");

console.log("Python TXT Path:", pythonTxtPath);
console.log("Python WAV Path:", pythonOutputPath);
console.log(
    "Node confirms TXT:",
    fs.existsSync(textFile)
);
await new Promise((resolve, reject) => {

    execFile(
        pythonPath,
        [
            pythonScriptPath,
            pythonTxtPath,
            pythonOutputPath
        ],
        {
            windowsHide: true,
            cwd: process.cwd()
        },
        (error, stdout, stderr) => {

            console.log(
                "===== PYTHON STDOUT ====="
            );

            console.log(stdout);

            console.log(
                "===== PYTHON STDERR ====="
            );

            console.log(stderr);

            if (error) {

                console.error(
                    "TTS Error:",
                    error.message
                );

                reject(error);

                return;
            }

            resolve();

        }
    );

});

        console.log(
            `${fileName} Finished`
        );

        // ---------------------------------
        // Delete temporary TXT
        // ---------------------------------

        if (fs.existsSync(textFile)) {

            await fs.promises.unlink(
                textFile
            );

        }

    }

    console.log(
        "All Audio Generated Successfully."
    );

    console.log(
        "Leaving generateAudio()"
    );
}