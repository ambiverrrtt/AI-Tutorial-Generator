export async function safeClosePage(page) {
    if (!page || page.isClosed()) {
        return;
    }

    const context = page.context();

    try {
        const openPages = context.pages().filter(p => !p.isClosed());

        if (openPages.length <= 1) {
            const keeperPage = await context.newPage();
            await keeperPage.goto("about:blank").catch(() => {});
        }

        await page.close().catch(() => {});
    } catch (err) {
        console.log("Safe page close skipped:", err.message);
    }
}