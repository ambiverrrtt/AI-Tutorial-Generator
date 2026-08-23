import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function callGemini(request) {

    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

            console.log(
                `Calling Gemini... Attempt ${attempt}/${MAX_RETRIES}`
            );
            console.log(
    "API Key:",
    process.env.GEMINI_API_KEY?.substring(0, 12)
);
console.log("model:", request.model);

            const response = await ai.models.generateContent(request);

            return response;

        } catch (err) {

            console.log(`Gemini Error: ${err.message}`);

            if (
                (
                    err.status === 503 ||
                    err.status === 429 ||
                    err.code === "ECONNRESET"
                ) &&
                attempt < MAX_RETRIES
            ) {

                const waitTime = Math.pow(2, attempt) * 5000;

                console.log(
                    `Retrying in ${waitTime / 1000} seconds...`
                );

                await new Promise(resolve =>
                    setTimeout(resolve, waitTime)
                );

                continue;
            }

            throw err;
        }

    }

}