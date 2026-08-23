import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.resolve(
    __dirname,
    "../../credentials.json"
);

const TOKEN_PATH = path.resolve(
    __dirname,
    "../../token.json"
);

const SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube"
];

async function authorize() {

    const credentials =
        JSON.parse(
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

    console.log("");
    console.log("========================================");
    console.log("MAIN YOUTUBE ACCOUNT AUTHORIZATION");
    console.log("========================================");
    console.log("");
    console.log("Open this URL in browser:");
    console.log("");
    console.log(authUrl);
    console.log("");

    const rl =
        readline.createInterface({

            input: process.stdin,

            output: process.stdout

        });

    rl.question(
        "Authorization Code: ",
        async (code) => {

            try {

                const {
                    tokens
                } =
                    await oauth2Client.getToken(
                        code.trim()
                    );

                fs.writeFileSync(
                    TOKEN_PATH,
                    JSON.stringify(
                        tokens,
                        null,
                        2
                    )
                );

                console.log("");
                console.log("========================================");
                console.log("TOKEN CREATED SUCCESSFULLY");
                console.log("========================================");
                console.log("");
                console.log(
                    "Saved:",
                    TOKEN_PATH
                );
                console.log("");

            } catch (error) {

                console.log("");
                console.log("AUTHORIZATION FAILED");
                console.log("");

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

authorize();