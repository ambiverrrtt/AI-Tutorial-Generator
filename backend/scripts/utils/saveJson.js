import fs from "fs";
import path from "path";

export function saveJson(filePath, data) {

    const folder = path.dirname(filePath);
 
const fileName = path.basename(filePath);

const safeFileName = fileName.replace(/[\\/:*?"<>|]/g, "");

const safeFilePath = path.join(folder, safeFileName);

    fs.mkdirSync(folder, { recursive: true });

    fs.writeFileSync(
        safeFilePath,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}