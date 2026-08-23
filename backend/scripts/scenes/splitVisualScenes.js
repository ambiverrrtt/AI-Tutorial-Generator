function splitVisualIdeas(text) {

    if (!text) return [];

    let parts = [text];

    const splitRules = [

        /\.\s+/,

        /,\s+(?=let\s+)/i,

        /,\s+(?=now\s+)/i,

        /,\s+(?=next\s+)/i,

        /,\s+(?=therefore\s+)/i,

        /,\s+(?=thus\s+)/i,

        /,\s+(?=hence\s+)/i,

        /,\s+(?=because\s+)/i,

        /,\s+(?=so\s+)/i,

        /,\s+(?=then\s+)/i,

        /,\s+(?=finally\s+)/i

    ];

    for (const rule of splitRules) {

        parts = parts.flatMap(part =>

            part
                .split(rule)
                .map(x => x.trim())
                .filter(Boolean)

        );

    }

    return parts;

}
export function splitVisualScenes(teachingPlan) {

    const scenes = [];
function addScene(text, type = "statement") {

    const visualIdeas = splitVisualIdeas(text);

    if (visualIdeas.length === 0)
        return;

    for (const idea of visualIdeas) {

       scenes.push({
    id: scenes.length + 1,
    type,
    text: idea.trim()
});

    }

}


    // Introduction
    addScene(teachingPlan.introduction, "introduction");

    // Given
    for (const item of teachingPlan.given || []) {
        addScene(item.text, item.type);
    }

    // Explanation
    for (const item of teachingPlan.explanation || []) {
        addScene(item.text, item.type);
    }

    // Solution
    for (const item of teachingPlan.solution || []) {
        addScene(item.text, item.type);
    }

    // Conclusion
    addScene(teachingPlan.conclusion, "conclusion");

    // Thank You
    addScene(teachingPlan.thankYou, "thankYou");
console.log("=================================");
console.log("Visual Scene Splitter");
console.log(JSON.stringify(scenes, null, 2));
console.log("=================================");
    return scenes;

}