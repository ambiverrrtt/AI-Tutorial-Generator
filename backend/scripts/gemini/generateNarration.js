import dotenv from "dotenv";
import fs from "fs"; 
import { saveJson } from "../utils/saveJson.js";
import { generateNarrationPlaywright } from "../playwright/generateNarration.js";
import { extractTeachingSteps } from "./extractTeachingSteps.js";
// import { generateTeachingPlan } from "./generateTeachingPlan.js";
import { generateMainIdea } from "./generateMainIdea.js";
import { generateNarrationV2 } from "./generateNarrationV2.js";
import { splitTeachingConcepts } from "./splitTeachingConcepts.js";
import { generateLessonPlan } from "./generateLessonPlan.js";
dotenv.config();

function validateScenes(scenes) {
if (!Array.isArray(scenes) || scenes.length === 0) {
        return false;
    }
    const required = [
        "scene",
        "heading",
        "displayText",
        "narration",
        "imagePrompt",
        "duration"
    ];

    for (const scene of scenes) {

        for (const key of required) {

            if (
                scene[key] === undefined ||
                scene[key] === null ||
                scene[key] === ""
            ) {
                console.log(
    `Scene ${scene.scene} is missing field: ${key}`
);
return false;
            }

        }

    }

    return true;
}

export async function generateNarration(pdfPath, tutorial,accountId) {

   console.log("Generating Teaching Steps...");

const teachingData =
    await extractTeachingSteps(
        tutorial,
        accountId
    );

const conceptData =
    await splitTeachingConcepts(
        teachingData.steps,
        accountId
    );

tutorial.teachingSteps =
    conceptData.steps;

const safeChapterName = (tutorial.chapterName || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .trim();

    const mainIdea =
    await generateMainIdea(
        conceptData.steps,
        accountId
    );

const scenePlan =
    await generateLessonPlan(
        conceptData.steps,
        accountId
    );

tutorial.scenePlan = scenePlan;


const originalScenes = scenePlan.scenes;

const topicTitle = String(tutorial.title || "")
    .replace(/^\d+(\.\d+)*\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

const displayTopicTitle =
    topicTitle.length > 42
        ? topicTitle.slice(0, 39).trim() + "..."
        : topicTitle;

        const helloScene = {
    scene: 1,
    cardId: -1,
    heading: "Hello",
    displayText: "Hello, students!",
    narration: "Hello, students!",
    imagePrompt: `A warm, colorful, friendly female teacher in a child-friendly educational cartoon style, smiling and waving hello to students. Create a welcoming classroom-like educational environment. The teacher should look like a friendly animated teaching character, not a real person. Make the scene cheerful and engaging for school children. Use very little text.`,
    duration: 3
};

const isSummary =
    String(topicTitle || "").trim().toLowerCase() === "summary";

const introDisplayText = isSummary
    ? "Let's review the key ideas"
    : `Today we will learn about ${topicTitle}`;

const introNarration = isSummary
    ? "Let's review the key ideas we have learned."
    : `Today we will learn about ${topicTitle}.`;

const introImagePrompt = isSummary
    ? `
A warm, colorful, child-friendly educational review scene for ${tutorial.subject}.
Show children revisiting the most important ideas from the lesson.
The scene should clearly communicate REVIEW and RECALL of previously learned concepts.
Do not present "Summary" as a subject to be learned.
Do not introduce new concepts, facts, examples, or information.
Use very little text.
Do not add unrelated objects.
`
    : `
A warm, colorful, child-friendly educational opening scene for the topic "${topicTitle}" in ${tutorial.subject}.
Make "${topicTitle}" the clear main topic of the slide.
Create a story-like beginning that makes children interested in learning.
Use very little text.
Do not add unrelated facts or objects.
`;

const introScene = {
    scene: 2,
    cardId: -2,
    heading: topicTitle,
    displayText: introDisplayText,
    narration: introNarration,
    imagePrompt: introImagePrompt,
    duration: 3
};

const storyStartScene = {
    scene: 3,
    cardId: -3,
    heading: "Let's Start",
    displayText: "Let's start learning",
    narration: "Let's start learning.",
    imagePrompt: `A warm, colorful, child-friendly story-like transition for starting the lesson "${topicTitle}" in ${tutorial.subject}. Make it feel like the teacher is beginning the lesson and inviting students to learn. Keep it simple, engaging and subject-safe. Use very little text.`,
    duration: 2
};

// ------------------------------------------
// MAIN IDEA SCENES
// ------------------------------------------

// Main Idea may contain multiple important ideas.
// Never put a long paragraph into one image.
//
// Split Main Idea into short connected ideas.
// Each idea gets:
// ONE scene
// ONE image
// ONE narration

const mainIdeaText = String(mainIdea || "")
    .replace(/\s+/g, " ")
    .trim();

const mainIdeaParts = Array.isArray(mainIdea)
    ? mainIdea
    : [String(mainIdea || "").trim()].filter(Boolean);

// If Main Idea contains multiple sentences,
// create a separate scene for each sentence.
// ------------------------------------------
// SAFE VISUAL CONCEPT FOR IMAGE GENERATION
// ------------------------------------------
// Keep the original idea unchanged for narration
// and Display Text.
// Only remove likely real-person names from the
// image-generation prompt so Gemini does not try
// to depict a public figure.

function createSafeVisualIdea(text) {
    return String(text || "")
        .replace(
            /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g,
            "the person mentioned in the concept"
        )
        .trim();
}
const mainIdeaScenes = mainIdeaParts.map((idea, index) => {

    // Keep Display Text short.
    // Remove unnecessary ending punctuation.
    const shortIdea = idea
        .replace(/[.!?]+$/, "")
        .trim();
const safeVisualIdea = createSafeVisualIdea(shortIdea);
    return {
        scene: originalScenes.length + 4  + index,
        cardId: -(index + 4),
        heading: "Main Idea",
        displayText: shortIdea,
        narration: `Remember: ${shortIdea}.`,
       imagePrompt: `A simple, colorful, child-friendly educational closing illustration for "${topicTitle}" in ${tutorial.subject}.

Teach ONLY this educational concept:
"${safeVisualIdea}"

Show one clear visual concept that explains the educational meaning of this idea.

If the original concept refers to a real person, historical person, scientist, author, public figure, or other identifiable individual:
- Do NOT create their portrait.
- Do NOT create an identifiable depiction of that person.
- Do NOT imitate their face or appearance.
- Represent the person's contribution, discovery, work, research, invention, writing, or historical significance using symbolic educational visuals or a generic person.
- Focus on the educational concept rather than the person's identity.

Do not invent new facts.

Do not show paragraphs, long text, UI elements, screenshots, video frames, or unrelated concepts.

Do not add a realistic or identifiable public figure.

The image must remain a simple educational illustration suitable for school students.

Use very little text.`,
 duration: 3
    };
});

const thankYouScene = {
    scene: originalScenes.length + 4 + mainIdeaScenes.length,
   cardId: -(mainIdeaParts.length + 4),
    heading: "Thank You",
    displayText: "Thank you, students",
    narration: "Thank you, students.",
    imagePrompt: `A warm, colorful and friendly closing scene for students after learning "${topicTitle}". Create a pleasant ending to the educational story. Show only simple child-friendly educational elements related to learning. Use very little text. Do not add new facts.`,
    duration: 2
};

scenePlan.scenes = [
    helloScene,

    introScene,

    storyStartScene,

    ...originalScenes.map((scene, index) => ({
        ...scene,
        scene: index + 4
    })),

    ...mainIdeaScenes,

    thankYouScene
];

// ------------------------------------------
// FINAL SCENE NUMBER VALIDATION
// ------------------------------------------

const sceneNumbers = scenePlan.scenes.map(
    scene => scene.scene
);

const duplicateSceneNumbers = sceneNumbers.filter(
    (sceneNumber, index) =>
        sceneNumbers.indexOf(sceneNumber) !== index
);

if (duplicateSceneNumbers.length > 0) {
    throw new Error(
        `Duplicate scene numbers found: ${[
            ...new Set(duplicateSceneNumbers)
        ].join(", ")}`
    );
}

// Scene numbers must be continuous:
// 1, 2, 3, 4, 5, 6...

scenePlan.scenes.forEach((scene, index) => {

    const expectedSceneNumber = index + 1;

    if (scene.scene !== expectedSceneNumber) {
        throw new Error(
            `Invalid scene numbering. Expected scene ${expectedSceneNumber}, found ${scene.scene}`
        );
    }

});

console.log(
    "Generated Scene Count:",
    scenePlan.scenes.length
);

console.log(scenePlan);

const safeOutputFolder = String(tutorial.outputFolder || "")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

saveJson(
    `generated/scene-plans/${tutorial.className}/${tutorial.subject}/${safeChapterName}/${safeOutputFolder}.json`,
    scenePlan
);

const narration =
    await generateNarrationV2(
        scenePlan,
        accountId
    );


const result = {
    tutorialId: tutorial.id,
    sectionNumber: tutorial.sectionNumber,
    title: tutorial.title,
    className: tutorial.className,
    subject: tutorial.subject,
    chapterName: tutorial.chapterName,
    type: tutorial.type,
   scenes: narration.scenes
};

const cleanTitle = tutorial.title
    .replace(/^\d+(\.\d+)*(\([A-Z]\))?\s*/, "");

const safeTitle = cleanTitle
    .replace(/⁰/g, "0")
    .replace(/¹/g, "1")
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .replace(/⁴/g, "4")
    .replace(/⁵/g, "5")
    .replace(/⁶/g, "6")
    .replace(/⁷/g, "7")
    .replace(/⁸/g, "8")
    .replace(/⁹/g, "9")
    .replace(/ⁿ/g, "n")
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi");
    
const fileName = (
    tutorial.sectionNumber
        ? `${tutorial.sectionNumber}-${safeTitle}`
        : safeTitle
)
    // Remove Windows-invalid filename characters
    .replace(/[\\/:*?"<>|]/g, "")
    
    // Remove newline, carriage return and tab
    .replace(/[\r\n\t]/g, " ")
    
    // Convert multiple spaces into one
    .replace(/\s+/g, " ")
    
    .trim();

saveJson(
  `generated/narrations/${tutorial.className}/${tutorial.subject}/${safeChapterName}/${fileName}.json`,
  result
);

console.log(`Narration Saved: ${tutorial.title}`);
return result;
}