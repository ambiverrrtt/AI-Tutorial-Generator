class MainIdeaPromptBuilder {

    static async build(concepts) {

        return `

You are an expert NCERT teacher and educational storyboard designer.

Your job is to identify the MOST IMPORTANT LEARNING IDEAS
that students should remember after finishing this topic.

IMPORTANT:

Do NOT create one long summary paragraph.

Do NOT combine multiple important ideas into one sentence.

Break the final takeaway into SMALL, CLEAR learning ideas.

Each idea must represent ONE tiny learning point.

Each idea may later become:

ONE Main Idea Scene
ONE Image
ONE Narration

----------------------------------
MAIN IDEA RULES
----------------------------------

Use ONLY the supplied concepts.

Do NOT add new facts.

Do NOT add new examples.

Do NOT use outside knowledge.

Do NOT explain concepts beyond the supplied input.

Do NOT create a chapter summary.

Do NOT repeat the entire lesson.

Select only the most important ideas students should remember.

Return 2 to 5 important ideas when the supplied concepts contain multiple important learning points.

Minimum: 1 idea.
Maximum: 5 ideas.

Do not return more than 5 ideas.

If the topic genuinely has only ONE important idea,
return only ONE idea.

Never create unnecessary ideas just to increase the number.

----------------------------------
MICRO IDEA RULE
----------------------------------

Each main idea must contain ONLY ONE learning point.

Do NOT combine:

definition + example

rule + exception

question + answer

calculation + explanation

cause + effect

multiple steps of a calculation

into one main idea.

If two ideas are important,
return two separate ideas.

----------------------------------
LENGTH RULE
----------------------------------

Each main idea must be SHORT.

Prefer 3 to 8 words.

Maximum 12 words per idea.

NEVER return a paragraph.

NEVER return 2 or more sentences inside one idea.

NEVER use semicolons to combine multiple ideas.

If an idea becomes too long, split it into separate ideas only when both parts are important learning points.

NEVER return a paragraph.

NEVER return 3 or 4 sentences inside one idea.

NEVER use semicolons to combine multiple ideas.

If an idea becomes too long,
split it into another idea.

----------------------------------
MATHEMATICS
----------------------------------

For Mathematics:

Keep equations, formulas, powers, roots,
fractions and mathematical symbols exactly.

Do NOT convert mathematical notation into words.

For example:

x^2 + 3x + 8

must remain:

x^2 + 3x + 8

Do not invent mathematical examples.

----------------------------------
SCIENCE
----------------------------------

For Science:

Keep the scientific concept exactly within
the supplied concepts.

Do not add organisms, processes, facts,
examples or explanations that are not present
in the supplied concepts.

----------------------------------
STORY LEARNING FLOW
----------------------------------

The Main Idea scenes should feel like the final
important learning moments of the educational story.

They should help the child remember what was learned.

Do not use filler phrases such as:

"Today we learned..."

"In this chapter..."

"In conclusion..."

"Remember everything..."

Do not create motivational text.

Only provide actual learning ideas.

----------------------------------
OUTPUT
----------------------------------

Return ONLY valid JSON.

Use this exact structure:

{
    "mainIdeas": [
        {
            "idea": "..."
        }
    ]
}

Do NOT return:

{
    "mainIdea": "..."
}

Return ONLY "mainIdeas".

----------------------------------
FINAL VALIDATION
----------------------------------

Before returning the JSON, verify:

✓ Every idea comes from the supplied concepts.

✓ Every idea contains ONE learning point.

✓ No idea is a paragraph.

✓ Every idea is maximum 12 words.

✓ "mainIdeas" must always be an array.

✓ Every item in "mainIdeas" must contain exactly one "idea" string.

✓ Never return the key "mainIdea".

✓ Return maximum 5 ideas.

✓ No new facts.

✓ No repeated ideas.

✓ No unnecessary summary.

✓ Mathematical notation is preserved.

✓ The response is valid JSON.

Concepts:

${JSON.stringify(concepts, null, 2)}

`;
    }

}

export default MainIdeaPromptBuilder;