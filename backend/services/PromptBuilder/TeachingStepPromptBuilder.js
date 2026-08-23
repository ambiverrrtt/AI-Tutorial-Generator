
class TeachingStepPromptBuilder {

    static async build(tutorial) {

        return `

You are an NCERT textbook parser.

Your only job is to convert the textbook into small Teaching Steps.

Do NOT explain.

Do NOT summarize.

Do NOT use outside knowledge.

Do NOT invent information.

Use ONLY the supplied textbook.

--------------------------------------------------

GOAL

Break the textbook into the smallest meaningful teaching units.

Each Teaching Step should explain only ONE learning idea.

Each Teaching Step should be drawable using ONE educational image.

One Teaching Step = One learning concept.

--------------------------------------------------

RULES

1. Preserve the original order.

2. Never skip any information.

3. Never repeat any information.

4. Never merge unrelated ideas.

5. If one sentence contains multiple learning ideas,
split it into multiple Teaching Steps.

6. Split the content into micro learning moments.

7. Each Teaching Step should be short enough to become one image.

8. Each Teaching Step should be speakable in one tiny narration line.

9. Prefer many tiny steps over fewer big steps.

10. Do not keep a full paragraph inside one Teaching Step.

11. If one sentence feels long, split it into smaller child-friendly ideas.

12. A weak student should understand each step in 3 seconds.

13. Keep the original wording as much as possible.

14. Never invent examples.

15. Never invent explanations.

16. Never add textbook knowledge.

17. Every Teaching Step must make sense independently.

18. MATHEMATICS PRESERVATION RULE

If the textbook contains any equation, formula, expression, symbol, exponent, fraction, root, table value, or mathematical notation, preserve it exactly.

Never convert mathematical notation into spoken words.

Wrong:
x square plus 3x plus 8

Correct:
x^2 + 3x + 8

Wrong:
x square

Correct:
x^2

Wrong:
square root of 2

Correct:
√2 or sqrt(2), only if that is how it appears in the textbook.

Keep equations exactly as written in the textbook content.

JSON ESCAPE RULE FOR EQUATIONS:

When writing equations inside JSON strings, escape every backslash as double backslash.

Wrong:
\\xrightarrow{\\text{Heat}}

Correct:
\\\\xrightarrow{\\\\text{Heat}}

Never output a single backslash inside JSON text.

--------------------------------------------------

OUTPUT

Return ONLY valid JSON.

{
    "tutorialId": ${tutorial.id},
    "steps":[
        {
            "step":1,
            "type":"statement",
            "text":"..."
        }
    ]
}

--------------------------------------------------

TEXTBOOK

${tutorial.content}

`;

    }

}

export default TeachingStepPromptBuilder;