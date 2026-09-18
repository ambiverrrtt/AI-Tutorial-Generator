import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
    getAllYouTubeAccounts
} from "../../youtube-accounts/youtubeAccountManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROTATION_FILE = path.resolve(
    __dirname,
    "../../generated/uploads/youtubeRotation.json"
);


// ==========================================
// Ensure Rotation File
// ==========================================

function ensureRotationFile() {

    const folder =
        path.dirname(ROTATION_FILE);

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
            recursive: true
        });
    }

    if (!fs.existsSync(ROTATION_FILE)) {

        const accounts =
            getAllYouTubeAccounts();

      const initialState = {
    currentAccountId:
        accounts.length > 0
            ? accounts[0].accountId
            : null,

    limitReachedAccounts: [],

    lastResetDate:
        new Date().toISOString().split("T")[0]
};

        fs.writeFileSync(
            ROTATION_FILE,
            JSON.stringify(
                initialState,
                null,
                2
            ),
            "utf8"
        );
    }
}


// ==========================================
// Load Rotation State
// ==========================================

export function loadRotationState() {

    ensureRotationFile();

    try {

        const data =
            fs.readFileSync(
                ROTATION_FILE,
                "utf8"
            ).trim();

        // ------------------------------------------
        // If Rotation File Is Empty
        // ------------------------------------------

        if (!data) {

            const accounts =
                getAllYouTubeAccounts();

            const initialState = {

                currentAccountId:
                    accounts.length > 0
                        ? accounts[0].accountId
                        : null,

                limitReachedAccounts: []
            };

            saveRotationState(initialState);

            return initialState;
        }

       const state = JSON.parse(data);

const today =
    new Date().toISOString().split("T")[0];

if (state.lastResetDate !== today) {

    state.currentAccountId =
        getAllYouTubeAccounts()[0]?.accountId || null;

    state.limitReachedAccounts = [];

    state.lastResetDate = today;

    saveRotationState(state);

    console.log(
        "YouTube Rotation Reset For New Day"
    );
}

return state;

    } catch (error) {

        console.error(
            "Failed to load YouTube rotation state:",
            error.message
        );

        return {
            currentAccountId: null,
            limitReachedAccounts: []
        };
    }
}


// ==========================================
// Save Rotation State
// ==========================================

export function saveRotationState(state) {

    ensureRotationFile();

    fs.writeFileSync(
        ROTATION_FILE,
        JSON.stringify(
            state,
            null,
            2
        ),
        "utf8"
    );
}


// ==========================================
// Mark Account Limit Reached
// ==========================================

export function markAccountLimitReached(
    accountId
) {

    const state =
        loadRotationState();

    if (
        accountId &&
        !state.limitReachedAccounts.includes(accountId)
    ) {

        state.limitReachedAccounts.push(
            accountId
        );
    }

    saveRotationState(state);

    console.log(
        `YouTube Account Limit Marked: ${accountId}`
    );

    return state;
}


// ==========================================
// Get Next Available Account
// ==========================================

export function getNextAvailableRotationAccount() {

    const accounts =
        getAllYouTubeAccounts();

    const state =
        loadRotationState();

    const availableAccounts =
        accounts.filter(
            account =>
                !state.limitReachedAccounts.includes(
                    account.accountId
                )
        );

    if (!availableAccounts.length) {

        return null;
    }

    let currentIndex =
        availableAccounts.findIndex(
            account =>
                account.accountId ===
                state.currentAccountId
        );

    if (currentIndex === -1) {

        currentIndex = -1;
    }

    const nextIndex =
        (currentIndex + 1) %
        availableAccounts.length;

    const nextAccount =
        availableAccounts[nextIndex];

    state.currentAccountId =
        nextAccount.accountId;

    saveRotationState(state);

    return nextAccount;
}


// ==========================================
// Get Current Available Account
// ==========================================

export function getCurrentRotationAccount() {

    const accounts =
        getAllYouTubeAccounts();

    const state =
        loadRotationState();

    const account =
        accounts.find(
            item =>
                item.accountId ===
                state.currentAccountId &&
                !state.limitReachedAccounts.includes(
                    item.accountId
                )
        );

    if (account) {
        return account;
    }

    return getNextAvailableRotationAccount();
}


// ==========================================
// Export
// ==========================================

export {
    ROTATION_FILE
};