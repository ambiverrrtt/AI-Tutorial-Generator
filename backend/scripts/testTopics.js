// import { generateTopicsPlaywright } from "./playwright/generateTopics.js";

// await generateTopicsPlaywright(
// `
// Read the uploaded chapter carefully.

// Generate 10 topics in JSON format.

// Return only JSON.

// `,
// "./pdfs/class-10/Mathematics/jemh101.pdf",
// 1
// );

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { generateTopicsPlaywright } from "./playwright/generateTopics.js";
import { saveJson } from "./utils/saveJson.js";

dotenv.config();

function cleanGeminiJson(text) {

    return text
        // Markdown remove
        .replace(/```json/gi, "")
        .replace(/```/g, "")

        // Smart quotes
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")

        // Invalid escapes remove
        .replace(/\\(?!["\\/bfnrtu])/g, "")

        // Control characters remove
        .replace(/[\u0000-\u001F]+/g, (match) => {
            return match
                .replace(/\n/g, "\n")
                .replace(/\r/g, "")
                .replace(/\t/g, "\t");
        })

        .trim();

}

async function runTest() {

    const classFolder = "class-10";
    const subjectFolder = "Mathematics";

    const pdfPath =
        "./pdfs/class-10/Mathematics/jemh101.pdf";

    const accountId = 1;

    console.log("Processing:", pdfPath);

    const prompt = `You are an expert NCERT curriculum designer and educational content architect.

Analyze the provided NCERT chapter PDF.

Your task is to prepare the tutorial structure for an AI-powered learning platform.

Instructions:

1. Read the complete PDF from beginning to end.

2. Detect the official chapter title exactly as written.

3. Extract EVERY heading and EVERY subheading exactly as printed.

4. Never skip any heading.

5. Never merge two independent textbook topics.

IMPORTANT

Some bold labels are NOT independent topics.

The following are considered part of the current topic:

Proof
Solution
Explanation
Observation
Construction
Discussion
Reason
Justification
Working
Method
Hint
Answer
Remark
Note attached to a theorem
Proof by contradiction

Case

Case I

Case II

Alternative Method

Alternative Solution

Verification

Check

Inference

Corollary

Algorithm

Important

Remember

Result

Conclusion

Never create a separate tutorial for the above labels.

They belong to the current theorem, example, activity or exercise.

Only create a new tutorial when a new textbook heading starts.

For example:

Theorem 1.2
Proof

must become ONE tutorial.

Example 3
Solution

must become ONE tutorial.

Activity
Observation

must become ONE tutorial.

Exercise 1.2
Question
Solution

must remain inside the Exercise tutorial.

6. Never rename any heading.

7. Never create your own headings.

8. Preserve the original textbook order.

9. The textbook is the only source of truth.

10. Do not ignore any educational content.

Include:

• Every numbered heading

• Every independent textbook heading

• Every theorem

• Every example

• Every solved example

• Every activity

• Every exercise

• Every Figure It Out

• Every Think About It

Do NOT treat the following as independent headings:

Proof

Solution

Observation

Explanation

Construction

Discussion

Reason

Answer

Hint

Remark

Case

Case I

Case II

Alternative Method

Alternative Solution

Verification

Check

Inference

Corollary

Algorithm

Important

Remember

Result

Conclusion

Ignore only:
- Index
- Copyright page
- Blank pages

11. For every topic return:

- id
- sectionNumber
- title
- type
- startHeading
- endHeading
- content

Output Format:

{
  "chapterName": "",

  "tutorials": [

    {

      "id": 1,

      "sectionNumber": "",

      "title": "",

      "type": "section",

      "startHeading": "",

      "endHeading": "",

      "content": "",

          }

  ]
}

type can be one of:

section
subsection
theorem
example
exercise
activity
figure_it_out
think_about_it
table
diagram
note
summary

The "content" field must contain the complete textbook text belonging only to that topic.

Do not include the heading itself inside content.

Content must start immediately after the heading.

Content must stop immediately before the next heading.

Do not include the next topic.

Do not omit any sentence.

Copy the text exactly from the textbook.

Do not summarize.

Do not rewrite.

Never use your own judgement to decide topic boundaries.

A topic starts exactly where its heading starts.

A topic ends immediately before the next independent textbook heading begins.

IMPORTANT

"Proof", "Solution", "Observation", "Explanation", "Construction", "Answer", "Reason", "Hint" and similar labels do NOT end the current topic.

They are continuations of the current topic.

Only a new theorem, example, exercise, activity or major textbook heading ends the current topic.

Do not treat bold text, italic text, blue text, larger font or colored labels as a new heading.

Only semantic textbook topics begin a new tutorial.

Never include any sentence from the next heading.

Every educational element in the textbook must appear exactly once.

Nothing may be skipped.

Do not merge independent textbook topics.

Only merge Proof, Solution, Observation, Explanation and similar labels into their parent topic.

Nothing may be duplicated.

Every Figure It Out must be returned as a separate tutorial.

Every Think About It must be returned as a separate tutorial.

Every table must be returned.

Every diagram must be returned.

Every note must be returned.

The Summary section is mandatory.

Return Summary as the final tutorial.

If a heading has no content before the next heading,
do NOT create a separate tutorial for it.

Only create a tutorial if at least one sentence belongs to that heading.

Never create duplicate tutorials for the same heading.

Before returning the JSON verify:

✓ Every heading is included.

✓ Every subsection is included.

✓ Every Figure It Out is included.

✓ Every Think About It is included.

✓ Every table is included.

✓ Every diagram is included.

✓ Every note is included.

✓ Every summary is included.

FINAL VALIDATION

Before returning JSON verify:

✓ Every theorem includes its proof.

✓ Every example includes its solution.

✓ Every activity includes its discussion.

✓ Every exercise includes its questions.

✓ Never create an empty tutorial.

✓ Never create a tutorial whose content is empty.

✓ Never split a theorem from its proof.

✓ Never split an example from its solution.

✓ Never split an activity from its observation.

If any tutorial has empty content, merge it into the following tutorial before returning JSON.

If a theorem is immediately followed by Proof,

merge both into one tutorial.

If an example is immediately followed by Solution,

merge both into one tutorial.

If an activity is immediately followed by Observation,

merge both into one tutorial.

Do not split them.

No theorem has empty content.

No example has empty content.

No activity has empty content.

No exercise has empty content.

No Figure It Out has empty content.

No Think About It has empty content.

If any of these have empty content, merge them with their associated Proof, Solution, Observation or Discussion before returning JSON.

If anything is missing, regenerate before returning.
`;

    const response = await generateTopicsPlaywright(
        prompt,
        pdfPath,
        accountId
    );

    const cleaned = cleanGeminiJson(response);

    let result;

    try {

        result = JSON.parse(cleaned);

        

        console.log("JSON Parsed Successfully");

    } catch (err) {

        console.log(cleaned);
        throw new Error(
            `Gemini Error: ${err.message}`
        );

    }

    const mergedTutorials = [];

for (let i = 0; i < result.tutorials.length; i++) {

    const current = result.tutorials[i];
    const next = result.tutorials[i + 1];

    if (
        (!current.content || current.content.trim() === "") &&
        next &&
        [
            "Proof",
            "*Proof:",
            "Solution",
            "Explanation",
            "Observation",
            "Discussion"
        ].some(label =>
            next.title.toLowerCase().includes(label.toLowerCase())
        )
    ) {

        current.content = next.content;
        current.endHeading = next.endHeading;

        mergedTutorials.push(current);

        i++;

    } else {

        mergedTutorials.push(current);

    }

}

result.tutorials = mergedTutorials;

if (!result.chapterName) {
    throw new Error("Chapter name missing.");
}

if (!Array.isArray(result.tutorials)) {
    throw new Error("Tutorial list missing.");
}

for (const tutorial of result.tutorials) {

    if (!tutorial.title) {
        throw new Error(
            `Missing title in tutorial id: ${tutorial.id}`
        );
    }

    if (!tutorial.type) {
        tutorial.type = "section";
    }

    const validTypes = [
        "section",
        "subsection",
        "theorem",
        "example",
        "exercise",
        "activity",
        "figure_it_out",
        "think_about_it",
        "table",
        "diagram",
        "note",
        "summary"
    ];

    if (!validTypes.includes(tutorial.type)) {

        throw new Error(
            `Invalid tutorial type: ${tutorial.type}`
        );

    }

}

let currentSection = "";
let childIndex = 0;

for (const tutorial of result.tutorials) {

    if (
        tutorial.sectionNumber &&
        tutorial.sectionNumber.trim() !== ""
    ) {

        currentSection = tutorial.sectionNumber.trim();
        childIndex = 0;

    } else if (currentSection) {

        tutorial.sectionNumber =
            `${currentSection}(${String.fromCharCode(65 + childIndex)})`;

        childIndex++;

    }

}

const seen = new Set();

result.tutorials = result.tutorials.filter(tutorial => {

    const key =
        `${tutorial.startHeading}|${tutorial.type}`;

    if (seen.has(key)) {
        return false;
    }

    seen.add(key);
    return true;

});

if (result.tutorials.length === 0) {

    throw new Error("No tutorials found.");

}

console.log(
    `Detected ${result.tutorials.length} tutorials.`
);

result.className = classFolder;
result.subjectName = subjectFolder;
result.pdfPath = pdfPath;

console.log(
    `Loaded ${result.tutorials.length} tutorials`
);

saveJson(
    `generated/topics/${classFolder}/${subjectFolder}/${result.chapterName}.json`,
    result
);

console.log("\n========== RESULT ==========\n");

console.log("Chapter:");
console.log(result.chapterName);

console.log("");

console.log("Tutorial Count:");
console.log(result.tutorials.length);

console.log("");

console.log(
    JSON.stringify(result, null, 2)
);

console.log("\n============================\n");
