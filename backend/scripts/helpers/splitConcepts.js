function clean(text) {
    return text
        .replace(/\s+/g, " ")
        .replace(/^[,.;:\s]+/, "")
        .replace(/[,.;:\s]+$/, "")
        .trim();
}

function pushConcept(list, type, text) {

    text = clean(text);

    if (text.length < 3) return;

    list.push({
        type,
        text
    });

}

function splitSentence(text, type) {

    const concepts = [];

    text = clean(text);

    // Original sentence
    pushConcept(concepts, type, text);

    // Common scientific phrases
    const patterns = [

        /\bdepends on\b/i,
        /\bconsists of\b/i,
        /\bmade of\b/i,
        /\bcomposed of\b/i,
        /\bcaused by\b/i,
        /\bproduced by\b/i,
        /\buses\b/i,
        /\busing\b/i,
        /\bcontains\b/i,
        /\bincludes\b/i,
        /\bcalled\b/i,
        /\bknown as\b/i,
        /\bforms\b/i,
        /\bform\b/i,
        /\bchanges into\b/i,
        /\bconverts into\b/i,
        /\bresults in\b/i

    ];

    for (const pattern of patterns) {

        const match = text.match(pattern);

        if (!match) continue;

        const index = match.index;

        const keyword = match[0];

        const left = clean(text.substring(0, index));

        const right = clean(
            text.substring(index + keyword.length)
        );

        if (left)
            pushConcept(concepts, type, left);

        if (right)
            pushConcept(concepts, type, right);

        pushConcept(
            concepts,
            type,
            `${left} ${keyword} ${right}`
        );

    }

    // Comma split
    text.split(",")

        .map(clean)

        .filter(Boolean)

        .forEach(part =>
            pushConcept(concepts, type, part)
        );

    // and split
    text.split(/\band\b/i)

        .map(clean)

        .filter(Boolean)

        .forEach(part =>
            pushConcept(concepts, type, part)
        );

    // Remove duplicates
    const unique = [];

    const seen = new Set();

    for (const item of concepts) {

        const key =
            item.text.toLowerCase();

        if (seen.has(key)) continue;

        seen.add(key);

        unique.push(item);

    }

    return unique;

}

export function splitConcepts(steps = []) {

    const result = [];

    let step = 1;

    for (const item of steps) {

        const concepts =
            splitSentence(
                item.text,
                item.type || "statement"
            );

        for (const concept of concepts) {

            result.push({

                step: step++,

                type: concept.type,

                text: concept.text

            });

        }

    }

    console.log("========== JS CONCEPTS ==========");
    console.log(JSON.stringify(result, null, 2));
    console.log("=================================");

    return result;

}