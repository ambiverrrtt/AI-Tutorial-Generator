import { spawn } from "child_process";
import fs from "fs";

const chromePath =
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const TOTAL_ACCOUNTS = 6;
const START_PORT = 9222;

for (let i = 0; i < TOTAL_ACCOUNTS; i++) {

    const port = START_PORT + i;

    const profile = `C:\\ChromeDebug${i + 1}`;

    if (!fs.existsSync(profile)) {
        fs.mkdirSync(profile, { recursive: true });
    }

    spawn(
        chromePath,
        [
            `--remote-debugging-port=${port}`,
            `--user-data-dir=${profile}`,
            "--no-first-run",
            "--no-default-browser-check"
        ],
        {
            detached: true,
            stdio: "ignore"
        }
    ).unref();

    console.log(
        `Chrome ${i + 1} Started (Port ${port})`
    );
}