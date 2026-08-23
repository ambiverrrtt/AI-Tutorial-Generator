import fs from "fs";
import path from "path";

export function getProgressPath(className, subject, chapter) {
const safeChapter = chapter
    .replace(/[\\/:*?"<>|]/g, "")
    .trim();
    return path.join(
        "generated",
        "progress",
        className,
        subject,
        `${safeChapter}.json`
    );

}

export function loadProgress(className, subject, chapter) {

    const file = getProgressPath(className, subject, chapter);

    if (!fs.existsSync(file)) {

        return {
            currentTutorial: 0,
            currentStep: "start",
            completed: false,
            tutorials: {}
        };

    }

    return JSON.parse(
        fs.readFileSync(file, "utf8")
    );

}
export function saveProgress(
    className,
    subject,
    chapter,
    progress,
    tutorialIndex,
    step
) {

    const file = getProgressPath(
        className,
        subject,
        chapter
    );

    fs.mkdirSync(path.dirname(file), {
        recursive: true
    });

    progress.currentTutorial = tutorialIndex;
    progress.currentStep = step;

    const tempFile = `${file}.tmp`;

fs.writeFileSync(
    tempFile,
    JSON.stringify(progress, null, 2)
);

fs.renameSync(tempFile, file);
}

export function clearProgress(className, subject, chapter) {

    const file = getProgressPath(className, subject, chapter);

    if (!fs.existsSync(file)) {
        return;
    }

    const progress = JSON.parse(
        fs.readFileSync(file, "utf8")
    );

    progress.completed = true;

    fs.writeFileSync(
        file,
        JSON.stringify(progress, null, 2)
    );

}

export function markDone(
    progress,
    tutorialKey,
    stage
) {

    if (!progress.tutorials) {
        progress.tutorials = {};
    }

    if (!progress.tutorials[tutorialKey]) {
        progress.tutorials[tutorialKey] = {};
    }

    progress.tutorials[tutorialKey][stage] = true;

}

export function isDone(
    progress,
    tutorialKey,
    stage
) {

    return progress.tutorials?.[tutorialKey]?.[stage] === true;

}