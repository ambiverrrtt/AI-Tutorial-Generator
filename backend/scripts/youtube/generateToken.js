import fs from "fs";
import path from "path";
import readline from "readline";
import { google } from "googleapis";

const SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube"
];

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");

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

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
});

console.log("\nOpen this URL:\n");
console.log(authUrl);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("\nPaste authorization code here: ", async (code) => {

    const { tokens } = await oauth2Client.getToken(code);

    fs.writeFileSync(
        TOKEN_PATH,
        JSON.stringify(tokens, null, 2)
    );

    console.log("\n✅ token.json created successfully.");

    rl.close();
});