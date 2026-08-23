import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.resolve(
    __dirname,
    "../../credentials.json"
);

const SOURCE_TOKEN_PATH = path.resolve(
    __dirname,
    "../../sourceToken.json"
);

const SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly"
];

async function authorizeSource() {

    const credentials = JSON.parse(
        fs.readFileSync(
            CREDENTIALS_PATH,
            "utf8"
        )
    );

    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;

    const oauth2Client =
        new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

    const authUrl =
        oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: SCOPES
        });

    console.log("\n======================================");
    console.log("SOURCE YOUTUBE ACCOUNT AUTHORIZATION");
    console.log("======================================\n");

    console.log(
        "Open this URL in your browser:\n"
    );

    console.log(authUrl);

    console.log(
        "\nAfter authorization, Google will give you a code."
    );

    console.log(
        "Paste that code below."
    );

    const readline =
        await import("readline");

    const rl =
        readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

    rl.question(
        "\nAuthorization Code: ",
        async (code) => {

            try {

                const {
                    tokens
                } = await oauth2Client.getToken(
                    code.trim()
                );

                fs.writeFileSync(
                    SOURCE_TOKEN_PATH,
                    JSON.stringify(
                        tokens,
                        null,
                        2
                    )
                );

                console.log(
                    "\n======================================"
                );

                console.log(
                    "SOURCE TOKEN CREATED SUCCESSFULLY"
                );

                console.log(
                    "======================================"
                );

                console.log(
                    "\nSaved at:"
                );

                console.log(
                    SOURCE_TOKEN_PATH
                );

            } catch (error) {

                console.error(
                    "\nAuthorization failed:"
                );

                console.error(
                    error?.response?.data ||
                    error.message
                );

            } finally {

                rl.close();

            }

        }
    );
}

authorizeSource();