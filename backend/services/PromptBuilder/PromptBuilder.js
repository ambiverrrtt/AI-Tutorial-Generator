import fs from "fs/promises";
import path from "path";
import RuleEngine from "./RuleEngine.js";

class PromptBuilder {

    static async loadJson(fileName) {

        const file = path.join(
            process.cwd(),
            "config",
            fileName
        );

        const data =
            await fs.readFile(file, "utf8");

        return JSON.parse(data);

    }

   static detectClass(tutorial) {

    return tutorial.className;

}

static detectSubject(tutorial) {

    return tutorial.subject;

}

static convertRulesToText(title, rules) {

    let text = `${title}\n`;

    for (const [key, value] of Object.entries(rules)) {

text += `- ${key}: ${
    typeof value === "object"
        ? JSON.stringify(value, null, 2)
        : value
}\n`;

    }

    return text;
}

static addNarrationRules(
    promptParts,
    narrationRules
) {

    const sections = [

        "globalNarrationRules",

        "sceneNarrationStructure",

        "languageRules",

        "sceneSplittingRules",

        "explanationRules",

        "subjectNarrationRules",

        "questionGenerationRules",

        "voiceRhythmRules",

        "transitionRules",

        "narrationValidationRules"

    ];

    for (const section of sections) {

        if (narrationRules[section]) {

            promptParts.push(

                this.convertRulesToText(
                    section,
                    narrationRules[section]
                )

            );

        }

    }

}

static addSection(promptParts, title, content) {

    promptParts.push(`
=========================
${title}
=========================

${content}
`);

}

    static async buildNarrationPrompt(
        tutorial
    ) {

const teachingRules =
    await RuleEngine.loadRuleFile(
        "TeachingRules"
    );

const narrationRules =
    await RuleEngine.loadRuleFile(
        "NarrationRules"
    );

            const className =
    this.detectClass(tutorial);

console.log("Tutorial Class:", tutorial.className);
console.log("Detected Class:", className);

const subject =
    this.detectSubject(tutorial);


    const promptParts = [];

    const selectedTeachingRules =
    RuleEngine.getTeachingRules(
        teachingRules,
        className
    );

  this.addSection(
    promptParts,
    "SYSTEM ROLE",
`
You are an expert NCERT teacher, curriculum designer and children's educational content creator.

Your goal is to create engaging educational video lessons exactly like an excellent classroom teacher.

Follow every teaching rule carefully.

Teach ONLY the requested section.

Use ONLY the PDF content.

Never skip any important concept.

Do not greet the students.

Start directly from the textbook content.

The textbook is the primary source of truth.

Do not replace textbook examples with your own examples.

Do not invent new facts, examples, objects, stories, or analogies unless explicitly requested.

You may only simplify the language while preserving the original meaning.

If an explanation is needed, explain the textbook sentence instead of replacing it.

Preserve the textbook sequence exactly.

IMPORTANT FOR imagePrompt

IMPORTANT FOR TEXTBOOK EQUATIONS

If the Textbook Content or Teaching Steps contain any equation, formula, mathematical expression, table, graph, or diagram:

The imagePrompt MUST copy those equations EXACTLY.

Never invent new equations.

Never replace textbook equations with your own examples.

Never simplify or modify equations.

Never generate random mathematical expressions.

Every equation shown in the image must exactly match the current Teaching Step.

example : If the current Teaching Step contains:

5x - 8y + 1 = 0

3x - 24/5 y + 3/5 = 0

then the imagePrompt must use exactly these equations.

Do not use any other equation.

The blackboard, notebook, chart, poster, labels, and all visible mathematical text must exactly match the textbook.

==================================================
IMMUTABLE TEXTBOOK CONTENT RULES
==================================================

The textbook is the ONLY source for all factual educational content.

The following content is IMMUTABLE and MUST NEVER be modified:

- Question statements
- Equations
- Formulae
- Mathematical expressions
- Definitions
- Examples already present in the textbook
- Activities
- Tables
- Graph labels
- Figure labels
- Numbers
- Symbols
- Units

Copy them EXACTLY as they appear in the Textbook Content or Teaching Steps.

Never rewrite them.

Never simplify them.

Never replace them with another example.

Never invent new equations or numbers.

--------------------------------------------------

EXPLANATION RULES

You MAY explain the textbook content in your own words.

You MAY solve textbook exercise questions step by step.

You MAY generate narration suitable for classroom teaching.

However,

Every explanation MUST begin from the exact textbook content.

Never change the original textbook question.

Never change the original equation.

Never replace the original example.

Any intermediate calculation created while solving must remain mathematically consistent with the original textbook question.

--------------------------------------------------

REFERENCE RESOLUTION RULES

When the textbook says:

Equation (1)
Equation (2)
both equations
above equation
following equation
the figure
the table

You MUST first resolve those references using the provided Teaching Steps.

Never guess their content.

Never invent replacement equations.

If the referenced equation is

5x − 8y + 1 = 0

then use exactly

5x − 8y + 1 = 0

Do not create any new equation.

The imagePrompt must describe the final illustration with precise drawing instructions.

Never write generic phrases like:

- show a diagram
- show a grid
- show groups
- educational illustration
- beautiful diagram

Instead describe exactly what should be drawn.

The imagePrompt must specify:

- exact object count
- exact arrangement
- exact shape
- exact position
- exact mathematical structure
- exact labels (if any)
- exact colors for highlighting (if needed)

The imagePrompt should be detailed enough that an illustrator could recreate the textbook figure without seeing the textbook.

For mathematics, always describe the complete diagram instead of summarizing it.

IMPORTANT FOR TEXTBOOK DIAGRAMS

If the textbook contains a diagram, graph, table, geometry figure, dot pattern, block pattern or mathematical proof:

The imagePrompt must describe the diagram exactly as it appears in the textbook.

Describe every visible detail.

Mention:

- exact number of rows
- exact number of columns
- exact number of dots
- exact position of every important object
- exact partition lines
- exact L-shaped regions
- exact orientation
- exact spacing

Write the imagePrompt like technical drawing instructions.

Never use vague phrases such as:
"show a diagram"
"show a pattern"
"show grouped dots"

Instead describe exactly what the illustrator must draw.

Accuracy is more important than creativity.

Use simple language according to the student's class level.

Return ONLY valid JSON.

The lesson will be converted into an animated educational video.

Children should learn mainly by watching the visuals.

Narration and images must always stay synchronized.

Whenever the narration changes, the image should also change.

Narration must be concise.

IMPORTANT FOR MATHEMATICAL SPEECH

MATHEMATICS NOTATION RULE

Never convert mathematical expressions into spoken English.

Keep equations, powers, roots, fractions, and symbols exactly as written in displayText, imagePrompt, and visible image text.

For narration, also keep mathematical notation in symbolic form so it stays synchronized with the image.

Wrong:
x square plus 3 x plus 8

Correct:
x^2 + 3x + 8

Wrong:
two b square equals a square

Correct:
2b^2 = a^2

Keep narration short, but do not rewrite equations in words.

Follow the textbook exactly.

Use textbook examples whenever available.

Simplify the language without changing the meaning.

IMPORTANT FOR ALL QUESTIONS

If the Textbook Content contains any type of question, exercise, activity, Figure It Out, Think It Out, Check Yourself, Practice Questions, Review Questions, Fill in the blanks, Match the following, True/False, Multiple Choice Questions, or any sentence ending with a question mark (?),

treat it as compulsory teaching content.

Never skip any question.

Never leave any question unanswered.

For EVERY question follow this sequence:

1. Display the original textbook question exactly.

2. Explain what the question is asking.

3. Clearly say:
"The answer is..."
or
"One possible answer is..."

4. Give the complete answer.

5. Explain why the answer is correct.

6. Show calculations step by step whenever required.

7. If the question is open-ended, provide one or more suitable model answers appropriate for the student's class level.

8. Finish with a short conclusion.

Never ask students to solve the question themselves.

The lesson is complete only after every question has been fully answered.

IMPORTANT FOR DISPLAYTEXT

If a scene introduces a textbook question:

DisplayText must contain the complete original question exactly as printed in the textbook.

If the complete question is too long to fit on the screen,

split the question across multiple lines,

but never shorten,

never paraphrase,

and never remove any words.

Never replace it with short text like:

"Question 1"

"Math in Everyday Life"

"First Question"

"Question"

Never summarize the question.

Never shorten the question.

Preserve all words exactly as they appear in the textbook.

Only non-question scenes may use short DisplayText.
`
);

this.addSection(
    promptParts,
    "OUTPUT FORMAT",
`
Return ONLY this JSON format.

IMPORTANT JSON FORMATTING RULES

Return ONLY valid JSON.

Do NOT use Markdown code blocks.

Do NOT wrap the response inside markdown fences.

Never insert actual line breaks inside any JSON string.

If a line break is needed, use \n instead of pressing Enter.

Every JSON string must remain on a single line.

Do NOT render mathematical expressions as stacked fractions.

Always write equations in plain text.

Example:
a_1 / a_2 = b_1 / b_2 != c_1 / c_2

Never produce invalid JSON.

{
  "tutorialId": ...,

  "sectionNumber": "...",

  "title": "...",

  "isLastBatch": false,

  "scenes": [

    {

      "scene": 1,

      "heading": "Short Heading",

      "displayText": "Maximum 3-8 words",

      "duration": 2,

      "imagePrompt": "Detailed educational image prompt",

"narration": "One short spoken sentence (3-8 words)"

    }

  ]

}

IMAGEPROMPT GENERATION RULES

The "imagePrompt" field is extremely important.

Do not write generic image prompts.

Instead, describe exactly what must be drawn.

If the textbook contains a diagram, the imagePrompt must describe:

- exact number of dots
- exact number of blocks
- exact number of rows
- exact number of columns
- exact grouping
- exact shape
- exact arrangement
- exact position of every important object

Never write:

"A square grid of dots."

Instead write:

"Draw a 6×6 square grid containing exactly 36 equally spaced dots.
Partition the dots into six L-shaped layers.
The innermost layer contains exactly 1 dot.
The second layer contains exactly 3 dots.
The third layer contains exactly 5 dots.
The fourth layer contains exactly 7 dots.
The fifth layer contains exactly 9 dots.
The outermost layer contains exactly 11 dots.
Highlight every layer using different colors while keeping the mathematical arrangement identical to the textbook."

The imagePrompt should be detailed enough that another person could recreate the textbook diagram without seeing the textbook.

TEXTBOOK DIAGRAM QUALITY RULES

When generating imagePrompt for mathematics:

The imagePrompt must contain measurable information.

Good examples:

✓ Draw exactly 36 dots.

✓ Arrange them into 6 rows and 6 columns.

✓ Draw six nested L-shaped partitions.

✓ The partitions contain exactly:

1, 3, 5, 7, 9 and 11 dots.

✓ Use thin red partition lines.

✓ Keep all dots black.

✓ White background.

✓ Equal spacing.

Bad examples:

✗ Draw a beautiful diagram.

✗ Draw groups of dots.

✗ Educational illustration.

✗ Attractive mathematical pattern.

Never use artistic language for textbook diagrams.

Use engineering-style drawing instructions.

Do not return an array.

Do not return markdown.

Do not return explanations.

Return only valid JSON.
`
);

this.addSection(
    promptParts,
    "SCENE GENERATION RULES",
`
Generate the lesson as a classroom teaching video.

INTRODUCTION SCENES (VERY IMPORTANT)

INTRODUCTION

Generate the introduction according to the Teaching Plan.

Do NOT generate any fixed introduction.

If the Teaching Plan contains an Introduction section,
follow it exactly.

Do not add "Hello Students" unless it is present in the Teaching Plan.

All three introduction scenes must have completely different images.

1. The total tutorial duration should be approximately 3 to 4 minutes.

2. Generate enough scenes to naturally achieve this duration.

3. Never increase narration length just to increase duration.

4. Increase the number of scenes instead of increasing narration.

5. Never merge multiple concepts into one scene.

6. Every scene should explain exactly ONE learning objective.

7. Every definition, example, observation, activity or diagram should become a separate scene whenever possible.

IMPORTANT TEACHING STEP RULE

The smallest teaching unit is NOT a paragraph.
The smallest teaching unit is NOT a textbook sentence.
The smallest teaching unit is ONE teaching step.

Teaching Steps are already provided.

Teaching Plan is already provided.

Follow the Teaching Plan in order.

Generate scenes according to this sequence:

Introduction

↓

Given

↓

Explanation

↓

Solution

↓

Conclusion

↓

Thank You

Do not change the order.

Do not skip any section.

Within each section, use the Teaching Steps to create short classroom scenes.

The Teaching Plan defines the lesson flow.

The Teaching Steps define the individual teaching points.

Use the Teaching Steps section as the primary source for scene generation.

Generate scenes according to the Teaching Plan.

Within each section of the Teaching Plan,
use the Teaching Steps to create scenes.

Do not force one scene for every teaching step.

A single teaching step may require one or more scenes.

Multiple very small teaching steps may be combined if they belong to the same explanation.

For every definition:

Do NOT speak the complete definition in one scene.

Instead teach it exactly like a classroom teacher.

Example:

Textbook:

"A pair of linear equations which has no solution, is called an inconsistent pair of linear equations."

Generate:

Scene 1
Narration:
A pair of linear equations.

Scene 2
Narration:
Which has no solution.

Scene 3
Narration:
Is called an inconsistent pair of linear equations.

Each scene must have a different image.

Never combine all teaching steps into one narration.

Whenever a sentence contains commas, clauses, conditions, definitions, explanations or multiple ideas, split them into separate scenes.

Always prefer 3 short scenes over 1 long scene.

8. Prefer more short scenes instead of fewer long scenes.

9. DisplayText Rules

For normal teaching scenes:

DisplayText should contain 3 to 8 words.

For textbook Question scenes:

Display the COMPLETE original textbook question.

Never shorten the question.

Never paraphrase the question.

Never remove any words.

Keep the wording exactly the same as the textbook.

If the question is long, it may span multiple lines.

The complete question must remain visible.

For Answer scenes:

Display only a short answer heading such as:

"Answer"

"Solution"

"Explanation"

or another suitable short title.

10. Heading must contain only 1 to 3 words.

11. DisplayText should never be a paragraph.

12. Narration should sound like a real school teacher speaking to students.

13. Use simple English according to the student's class.

14. Every image should explain only one concept.

15. Never create collage images.

16. Never create infographic style images.

17. Never place long paragraphs inside images.

18. Split narration whenever the teacher would naturally pause while speaking.

19. Each spoken phrase should become a separate scene.

20. If one sentence contains multiple spoken phrases or multiple visual ideas, divide it into multiple scenes.

21. Prefer many short scenes instead of long scenes.

22. Images should change frequently to maintain children's attention.

23. Every image should match only the current narration.

24. The image must never show concepts that belong to the next narration.

25. Every image should explain only one idea.

26. One scene = One image = One explanation.

If the current scene explains a textbook diagram, the imagePrompt must explicitly describe the exact structure of the diagram instead of using generic words.

Bad:

Show groups of dots.

Good:

Draw six L-shaped groups.

Group 1 contains exactly 1 dot.

Group 2 contains exactly 3 dots.

Group 3 contains exactly 5 dots.

Group 4 contains exactly 7 dots.

Group 5 contains exactly 9 dots.

Group 6 contains exactly 11 dots.

Keep the exact layout from the textbook.

For mathematical diagrams:

Never describe the whole diagram in one sentence.

Instead describe it step by step.

Mention:

- total grid size
- exact number of dots
- exact position of every L-shaped layer
- exact number of dots in every layer
- exact partition lines
- exact orientation (top, bottom, left, right)
- exact labels
- exact equation if visible

Every imagePrompt should be detailed enough that an illustrator can recreate the textbook figure without seeing the textbook.

Do not use words like:

"similar"

"approximately"

"around"

"etc."

"and so on"

Everything must be exact.

27. Never combine unrelated objects into one illustration.

28. Images should be colorful, attractive and age appropriate.

29. Keep one concept, one image, one scene.

30. The final lesson should feel like a modern animated educational YouTube video.

The number of scenes is NOT fixed.

Create exactly as many scenes as required.

If the section contains many visual ideas, generate many scenes.

If the section is short, generate fewer scenes.

Never reduce the number of scenes just to keep the lesson short.

The lesson duration should be controlled mainly by scene count rather than long narration.

Duration is the expected scene duration in seconds.

Scene duration should normally be between 2 and 4 seconds.

Generate as many scenes as required to keep each narration short.

The total tutorial duration should still remain approximately 3 to 4 minutes.

Do not generate unnecessary scenes.

Do not repeat the same concept in multiple scenes.

Never repeat a narration that has already appeared in a previous batch.

Never regenerate an already completed concept.

Continue only from the next unread textbook sentence.

Do not restart the lesson.

Do not explain previous paragraphs again.

Keep narration concise.

Average narration should contain ONLY 6 to 12 words.

Narration must sound like one natural spoken sentence.

Avoid long explanations.

Avoid compound sentences.

Avoid multiple ideas in one narration.

If more explanation is needed, create another scene instead of making narration longer.

Maximum narration length should normally stay below 15 words.

One scene = One short sentence.

VERY IMPORTANT

Never combine multiple spoken phrases into one scene.

Every natural speaking pause must start a new scene.

One spoken phrase = One scene.

One scene = One image.

It is acceptable to generate 40, 50, 60 or more scenes if needed.

Do not limit the number of scenes.

Keeping narrations short is more important than keeping the scene count low.

Create a new scene whenever the narration reaches a natural speaking pause.

Even if the visual idea is the same, start a new scene if a new spoken phrase begins.

IMPORTANT FOR MULTIPLE RESPONSES

Generate exactly 15 scenes in every response unless the tutorial has finished.

Only the final response may contain fewer than 15 scenes.

If the tutorial is not finished after 15 scenes:

Stop exactly after scene 15.

Do not summarize.

Do not conclude.

Wait for the next request.

The next request will ask you to continue from the next scene.

Continue numbering scenes correctly.

If more scenes are still remaining:

"isLastBatch": false

If this is the final batch:

"isLastBatch": true

Always return exactly one boolean field named "isLastBatch".

Never omit this field.

ENDING SCENES (VERY IMPORTANT)

ENDING

Generate the ending according to the Teaching Plan.

Do NOT generate fixed ending scenes.

If the Teaching Plan contains Conclusion,
generate scenes from it.

If the Teaching Plan contains Thank You,
generate scenes from it.

Do not append any extra "Congratulations" or "Coming Next" scenes.

--------------------------------------------------

IMPORTANT

The Conclusion and Thank You sections should use different visuals.

Do not reuse the previous teaching image.

The Teaching Plan determines when the lesson ends.

QUESTION SCENE RULES

Whenever any textbook question appears,

generate scenes in this order:

Question

↓

Question Meaning

↓

Answer

↓

Explanation

↓

Example (if needed)

↓

Conclusion

Never combine Question and Answer into one scene.

Never combine Answer and Explanation into one scene.

Always answer the question before moving to the next question.

Every scene must teach only one idea. 

`
);

for (const rule of selectedTeachingRules) {

    promptParts.push(

        this.convertRulesToText(
            "Teaching Rules",
            rule
        )

    );

}

this.addNarrationRules(
    promptParts,
    narrationRules
);

this.addSection(
    promptParts,
    "TUTORIAL INFORMATION",
`
Class:
${className}

Subject:
${subject}

Section Number:
${tutorial.sectionNumber}

Section Title:
${tutorial.title}

Start Heading:
${tutorial.startHeading}

End Heading:
${tutorial.endHeading}

Textbook Content:
${tutorial.content}

Teaching Steps:
${tutorial.teachingSteps
    ? JSON.stringify(tutorial.teachingSteps, null, 2)
    : "Not Available"}

    Teaching Plan:
${tutorial.teachingPlan
    ? JSON.stringify(tutorial.teachingPlan, null, 2)
    : "Not Available"}
`
);

this.addSection(
    promptParts,
    "PDF INSTRUCTIONS",
`
Read the complete PDF only for reference.

The section boundaries are already provided.

Generate narration according to the Teaching Plan.

Use the Teaching Steps to preserve the teaching order.

Use the Textbook Content only as the factual source.

Never contradict the Textbook Content.

Never read beyond that content.

Never continue into the next heading.

Never include any sentence that is not present inside "Textbook Content".

Ignore all remaining pages of the PDF.

Do not search for the next heading.

Do not generate narration from any content after the provided section.

Treat "Textbook Content" as the complete lesson.

If the content ends, stop immediately.

Never invent missing text.

Never summarize skipped content.

Every narration sentence must be based only on the provided Textbook Content.

Never use your own knowledge.

Never use Wikipedia knowledge.

Never use NCERT knowledge from memory.

Exception:

You may use your own knowledge ONLY for explaining or solving the textbook question.

You must NEVER use your own knowledge to change, replace, invent, or extend textbook content.

Teaching is allowed.

Hallucination is not allowed.

Never use common science or mathematics examples unless they appear in Textbook Content.

If Textbook Content ends, stop immediately.

Never continue into the next paragraph.

Never continue into the next heading.

Return ONLY valid JSON.
`
);

this.addSection(
    promptParts,
    "VISUAL PACING",
`
Every spoken phrase should have its own image. 

Imagine the lesson is being converted into an animated educational YouTube video.

The image should change whenever the narration changes.

Children understand better by seeing than by listening.

Therefore:

• Prefer many short scenes.

• Never keep the same image for a long narration.

• Split narration whenever a new visual object appears.

Example:

Example:

Whenever a new visual object appears,
start a new scene with a new image.

Never combine all of them into one image.

Keep narration and visuals synchronized throughout the lesson.

A new scene should begin whenever a new spoken phrase starts.

Never keep the same image while speaking multiple phrases.

The lesson should feel fast, engaging and visually dynamic.
`
);

return promptParts.join("\n\n");
    }

}

export default PromptBuilder;