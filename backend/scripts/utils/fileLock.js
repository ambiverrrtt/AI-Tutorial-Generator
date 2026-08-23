import fs from "fs";

export async function lock(filePath) {

    const lockFile = `${filePath}.lock`;

    while (true) {

        try {

            const fd = fs.openSync(lockFile, "wx");

            fs.closeSync(fd);

            return;

        } catch (err) {

    if (err.code !== "EEXIST") {
        throw err;
    }

    try {

        const stat = fs.statSync(lockFile);

        const age =
            Date.now() - stat.mtimeMs;

        // 5 minutes old lock
        if (age > 5 * 60 * 1000) {

            console.log(
                "Removing Stale Lock:",
                lockFile
            );

            fs.unlinkSync(lockFile);

            continue;
        }

    } catch {}

    await new Promise(resolve =>
        setTimeout(resolve, 100)
    );

}

    }

}

export function unlock(filePath) {

    const lockFile = `${filePath}.lock`;

    if (fs.existsSync(lockFile)) {

        fs.unlinkSync(lockFile);

    }

}