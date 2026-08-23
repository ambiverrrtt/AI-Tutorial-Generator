import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { fileURLToPath } from "url";

const SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly"
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_TOKEN_PATH = path.resolve(
    __dirname,
    "../../sourceToken.json"
);

const CREDENTIALS_PATH = path.resolve(
    __dirname,
    "../../credentials.json"
);

export async function getSourceYouTubeClient() {

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

    if (fs.existsSync(SOURCE_TOKEN_PATH)) {

        oauth2Client.setCredentials(
            JSON.parse(
                fs.readFileSync(
                    SOURCE_TOKEN_PATH,
                    "utf8"
                )
            )
        );

        return oauth2Client;
    }

    const authUrl =
        oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: SCOPES
        });

    console.log("\n================================");
    console.log("SOURCE ACCOUNT AUTHORIZATION");
    console.log("================================\n");

    console.log(
        "Open this URL in browser:\n"
    );

    console.log(authUrl);

    throw new Error(
        "Source account authorization required."
    );
}