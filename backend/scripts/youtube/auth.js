import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { fileURLToPath } from "url";

const SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube"
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.resolve(
    __dirname,
    "../../token.json"
);

const CREDENTIALS_PATH = path.resolve(
    __dirname,
    "../../credentials.json"
);

export async function getYouTubeClient() {

    const credentials = JSON.parse(
        fs.readFileSync(CREDENTIALS_PATH, "utf8")
    );

    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;

    const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    if (fs.existsSync(TOKEN_PATH)) {

        oauth2Client.setCredentials(
            JSON.parse(
                fs.readFileSync(TOKEN_PATH, "utf8")
            )
        );

        return oauth2Client;
    }

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
    });

    console.log("\nOpen this URL in browser:\n");
    console.log(authUrl);

    throw new Error(
        "Authorize first. After authorization we'll generate token.json."
    );
}