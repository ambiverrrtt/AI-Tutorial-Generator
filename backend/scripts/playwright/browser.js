
import { chromium } from "playwright";
import BrowserManager from "../../services/BrowserManager/BrowserManager.js";

const browsers = new Map();

export async function getBrowser(accountId = 1) {

   if (browsers.has(accountId)) {
    const existingBrowser = browsers.get(accountId);

    if (existingBrowser && existingBrowser.isConnected()) {
        return existingBrowser;
    }

    browsers.delete(accountId);
}

    const accounts =
        BrowserManager.getAccounts();

    const account = accounts.find(
        a => a.id === accountId
    );

    if (!account) {

        throw new Error(
            `Account ${accountId} not found`
        );
    }
console.log("Requested Account ID:", accountId);
console.log("Selected Account:", account);
console.log("Connecting to Port:", account.port);
    const browser =
        await chromium.connectOverCDP(
            `http://127.0.0.1:${account.port}`
        );

    browsers.set(
        accountId,
        browser
    );

    return browser;

}