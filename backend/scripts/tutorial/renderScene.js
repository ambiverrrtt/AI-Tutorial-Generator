import { exec } from "child_process";

export async function renderScene(
    imagePath,
    audioPath,
    outputPath
) {

    return new Promise((resolve, reject) => {
const command = `ffmpeg -y \
-loop 1 \
-framerate 30 \
-i "${imagePath}" \
-i "${audioPath}" \
-map 0:v:0 \
-map 1:a:0 \
-c:v libx264 \
-vf "scale=1920:1080,fps=30" \
-crf 18 \
-preset medium \
-tune stillimage \
-c:a aac \
-ar 48000 \
-ac 2 \
-b:a 192k \
-shortest \
-pix_fmt yuv420p \
-movflags +faststart \
"${outputPath}"`;

        console.log(command);

        exec(command, (error, stdout, stderr) => {

    console.log(stdout);
    console.log(stderr);

    if (error) {
        reject(error);
        return;
    }

    resolve();
});

    });

}