
import express from "express";
import cors from "cors";
import processPdfRoutes from "./routes/processPdf.routes.js";
import youtubeUploadsRoutes from "./routes/youtubeUploads.routes.js";
import {
    getYouTubeAuthorizationUrl,
    handleYouTubeOAuthCallback
} from "./youtube-accounts/youtubeOAuth.js";
const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", processPdfRoutes);
app.use("/api/youtube-uploads", youtubeUploadsRoutes);
app.use("/generated", express.static("generated"));

// ========================================
// YouTube OAuth - Connect Account
// ========================================

app.get("/connect-youtube", (req, res) => {

    try {

        const authUrl =
            getYouTubeAuthorizationUrl();

        res.redirect(authUrl);

    } catch (error) {

        console.error(
            "YouTube OAuth Start Error:",
            error
        );

        res.status(500).send(
            "Failed to start YouTube authorization."
        );
    }
});


// ========================================
// YouTube OAuth - Callback
// ========================================

app.get("/oauth2callback", async (req, res) => {

    try {

        const { code } = req.query;

        if (!code) {

            return res.status(400).send(
                "Authorization code is missing."
            );
        }

        const account =
            await handleYouTubeOAuthCallback(
                code
            );

        res.send(`
            <html>
                <body>
                    <h2>YouTube Account Connected Successfully ✅</h2>

                    <p>
                        Channel:
                        ${account.channelName}
                    </p>

                    <p>
                        Account ID:
                        ${account.accountId}
                    </p>

                    <p>
                        You can close this window.
                    </p>
                </body>
            </html>
        `);

    } catch (error) {

        console.error(
            "YouTube OAuth Callback Error:",
            error.response?.data || error
        );

        res.status(500).send(`
            <h2>YouTube Account Connection Failed ❌</h2>
            <pre>
${error.message}
            </pre>
        `);
    }
});
app.get("/", (req, res) => {

    res.send("Backend Running");

});

app.listen(5000,  async () => {

    console.log("Server Started On Port 5000");


});