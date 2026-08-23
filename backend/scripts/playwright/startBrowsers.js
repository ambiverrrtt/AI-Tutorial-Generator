import { spawn } from "child_process";

const chromePath =
"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const TOTAL_ACCOUNTS = 11;

for (let i = 0; i < TOTAL_ACCOUNTS; i++) {

    const port = 9222 + i;

    const profile = `C:\\ChromeDebug${i + 1}`;

    spawn(
        chromePath,
        [
            `--remote-debugging-port=${port}`,
            `--user-data-dir=${profile}`,
            "--disable-gpu",
            "--disable-extensions",
            "--disable-sync",
            "--disable-background-networking",
            "--disable-notifications",
            "--mute-audio"
        ],
        {
            detached: true,
            stdio: "ignore"
        }
    );

    console.log(
        `Chrome ${i + 1} Started (Port ${port})`
    );

}

console.log("All Browsers Started.");