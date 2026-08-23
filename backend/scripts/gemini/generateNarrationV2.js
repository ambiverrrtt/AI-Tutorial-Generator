
function cleanNarration(text) {
    const value = String(text || "")
        .trim()
        .replace(/\s+/g, " ");

    if (!value) {
        return "";
    }

    return /[.!?]$/.test(value)
        ? value
        : `${value}.`;
}

function getDuration(text) {
    const words = String(text || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    let duration = Math.ceil(words / 2.5);

    if (duration < 2) {
        duration = 2;
    }

    if (duration > 4) {
        duration = 4;
    }

    return duration;
}

export async function generateNarrationV2(scenePlan) {
    console.log("================================");
    console.log("Generating Micro Narration...");
    console.log("================================");

    for (const scene of scenePlan.scenes) {
        scene.narration = cleanNarration(
    scene.narration || scene.displayText
);
        scene.duration = getDuration(scene.narration);
    }

    console.log("================================");
    console.log("Micro Narration Completed");
    console.log("================================");

    return scenePlan;
}