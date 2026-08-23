export async function typeLargePrompt(page, prompt) {

    const chunkSize = 3000;

    for (let i = 0; i < prompt.length; i += chunkSize) {

        const chunk = prompt.slice(i, i + chunkSize);

        await page.keyboard.insertText(chunk);

        await page.waitForTimeout(100);
    }

}