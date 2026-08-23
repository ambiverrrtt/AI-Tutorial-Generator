import fs from "fs";
import path from "path";

class BrowserManager {

    static getAccounts() {

       const file = path.join(
    process.cwd(),
    "scripts",
    "config",
    "accounts.json"
);

        return JSON.parse(
            fs.readFileSync(file, "utf8")
        );

    }
}

export default BrowserManager;