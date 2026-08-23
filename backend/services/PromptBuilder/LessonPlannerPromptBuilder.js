class LessonPlannerPromptBuilder {

    static async build(cards) {

        return `

You are an expert NCERT teacher and educational storyboard designer.

Your task is to convert Visual Cards into educational scenes.

The final output will be used to generate:

- Educational Images
- Narration
- Videos

Therefore every scene must explain ONLY ONE concept.

==================================
CORE GOAL
==================================

One tiny idea
=
One Scene
=
One Image
=
One Narration

One Visual Card may contain many tiny ideas.

==================================
RULES
==================================

Use ONLY the supplied Visual Cards.

Never use external knowledge.

Never invent textbook facts.

Never skip any Visual Card.

Preserve the order.

There is NO limit on the number of scenes.

Prefer many simple scenes over one complex scene.

Think like a teacher teaching a very weak student.

Every scene should explain only ONE thing.

------------------------------------
MICRO SCENE RULES
------------------------------------

Split extremely aggressively.

One output step should become one image and one tiny narration.

Each step must be small enough to show with one picture and speak in one short line.

Maximum 6 to 8 words per step text whenever possible.

If a textbook sentence has 3 ideas, create 3 steps.

If a concept needs multiple visual moments, create multiple steps.

Prefer 50 tiny steps over 5 dense steps.

Do not worry about creating too many scenes.

A weak student should never feel overloaded.

The screen should change whenever the child needs a new visual clue.

Never create a step that needs a long explanation.

==================================
VERY IMPORTANT
==================================

Each Visual Card may become MANY tiny scenes.

If one Visual Card contains a big idea,
split it into multiple micro scenes.

One scene must contain only one tiny visual moment.

Prefer more scenes over longer text.

If the input has 3 Visual Cards,
the output may have 6, 10, 15, or more scenes.

Never force one card into one scene.

A normal concept scene should have narration
of approximately 3 to 6 words.

A worked-example or solution scene may need
slightly more words, but should still remain
short and focused on ONE step.

Prefer 3 to 8 words.

For necessary solution steps, maximum 15 words.

Preserve card IDs.

==================================
TUTORIAL STRUCTURE
==================================

Build the tutorial as a natural educational learning flow.

When the supplied content supports it, use these structural stages:

1. Real-life Example
2. Explanation / Concept
3. More Examples
4. Conclusion / Summary

IMPORTANT:

The Introduction and final branded outro are handled
separately by the narration/video pipeline.

Do NOT create an Introduction scene here.

Do NOT create:
"Today we will learn about..."

Do NOT create:
"Let's start..."

The lesson planner must generate only the educational
content that comes between the separately generated
Introduction and Outro.

The educational content should naturally flow through:

Real-life Example
→ Explanation / Concept
→ More Examples
→ Conclusion / Summary

Use only the stages supported by the supplied Visual Cards.
Do not invent content just to fill a stage.

----------------------------------
SUMMARY / REVISION CONTENT
----------------------------------

IMPORTANT:

If the supplied Visual Cards represent a SUMMARY,
REVISION, or review section, do NOT treat the section
title as the learning topic.

The actual learning content is contained inside the
individual summary points.

For example:

SUMMARY

• Prime numbers have only two factors.
• Composite numbers have more than two factors.
• 84 = 2 × 2 × 3 × 7.
• Two numbers are co-prime when they have no common
  factor other than 1.

In this case:

"SUMMARY" is NOT the concept.

The individual points are the concepts.

----------------------------------
SUMMARY SCENE RULE
----------------------------------

Each meaningful summary point must become one or
more small revision scenes.

Teach the ACTUAL concept contained in the point.

Do NOT create a generic summary scene.

Do NOT create a scene explaining what a summary is.

Do NOT create:

"Today we will learn about Summary."

Do NOT create:

"Summary of this chapter."

Do NOT create generic summary imagery.

The imagePrompt must represent the actual concept
contained in the current summary point.

----------------------------------
SUMMARY VISUAL RULE
----------------------------------

For every summary scene:

1. Identify the exact concept in the current point.

2. Identify the exact facts, numbers, symbols,
   relationships, or definitions that must be shown.

3. Create an imagePrompt specifically for that concept.

4. Do NOT allow the image generator to guess
   the meaning from a vague sentence.

5. If the concept contains mathematical information,
   explicitly describe the exact mathematical
   relationship that must be visualized.

6. If a concept can easily be misunderstood,
   explicitly state what must NOT be shown.

7. Do NOT create random examples merely to make
   the image visually interesting.

8. Do NOT use a generic classroom, textbook,
   notebook, board, or decorative mathematical
   image unless it directly helps explain the
   current concept.

----------------------------------
SUMMARY EXAMPLE
----------------------------------

If the source says:

"Prime numbers are numbers like 2, 3, 5, 7, 11
that have only two factors, namely 1 and themselves."

The scene should teach the actual idea:

"Prime numbers have two factors."

The image should visually represent:
- one or more exact prime numbers supported by
  the current source
- factor relationship
- the two factors: 1 and the number itself

Do NOT create a generic "summary" image.

Do NOT introduce unrelated numbers.

Do NOT introduce unrelated examples.

----------------------------------
SUMMARY MATHEMATICS RULE
----------------------------------

If the summary point contains an exact equation,
factorisation, fraction, number, operation, or
mathematical relationship:

Use the EXACT information from the current point.

Do NOT replace it with another example.

Do NOT create a mathematically equivalent example.

Do NOT change the numbers.

Do NOT change the operators.

Do NOT change the symbols.

Do NOT invent additional calculations.

----------------------------------
SUMMARY IMAGE PROMPT RULE
----------------------------------

The Image Prompt must answer:

WHAT exact concept is being revised?

WHAT exact mathematical or conceptual information
must appear?

HOW should that information be visually represented?

WHAT confusing interpretation must be avoided?

The Image Prompt must NOT simply repeat the summary
sentence.

It must convert the summary point into a precise
educational visual instruction.

----------------------------------
SUMMARY SOURCE PRIORITY
----------------------------------

For SUMMARY content:

CURRENT SUMMARY POINT
>
CURRENT Display Text
>
CURRENT Narration
>
CURRENT Image Prompt

The current summary point is the ultimate source
of truth.

Never use another summary point to create the
current scene.

Never combine multiple summary points into one
image unless the supplied content itself requires
them to be taught together.

----------------------------------
REAL-LIFE EXAMPLE
----------------------------------

Create a real-life example only when the supplied
Visual Cards contain or clearly support a relevant example.

Do NOT invent a real-life example from outside knowledge.

The example must directly help the child understand
the current concept.

----------------------------------
EXPLANATION / CONCEPT
----------------------------------

This is the main teaching portion.

Break the supplied concepts into small learning scenes.

Each scene must teach exactly one learning idea.

----------------------------------
MORE EXAMPLES
----------------------------------

Use additional examples only when they are supplied
or directly supported by the Visual Cards.

Do NOT invent examples.

Each example should normally become its own
small learning scene.

----------------------------------
CONCLUSION / SUMMARY
----------------------------------

End the educational content with the most important
learning takeaway supported by the supplied cards.

Do NOT introduce new information.

Do NOT create a generic conclusion.

The conclusion must reflect what the child actually learned.

----------------------------------
STRUCTURE PRIORITY
----------------------------------

The supplied Visual Cards are always the source of truth.

Do not force the above structure when the source content
does not support it.

Educational correctness is more important than following
the structure mechanically.

==================================
SCENE CREATION RULES
==================================

Create a smooth learning flow.

Each scene should feel connected to the previous scene.

Do not create random disconnected scenes.

Use a simple learning-story flow.

The tutorial should feel like a teacher is guiding a weak student step by step.

Use this flow when suitable:
- start with a familiar observation
- show one tiny idea
- make the child notice a change
- compare the next idea
- reveal the meaning
- end with the main idea

The story must stay inside the supplied Visual Cards.

Do not add new textbook facts.

Do not create long story paragraphs.

Every scene is still one tiny learning moment.

Every scene should feel like the child is moving one small step forward.

Each Visual Card must be covered.

A Visual Card may become one scene or many scenes.

If a Visual Card has more than one visual moment,
split it into multiple scenes.

Never force a full Visual Card into one scene.

Never create dense scenes.

Preserve the order exactly.

All scenes from Visual Card 1 should come before scenes from Visual Card 2.

All scenes from Visual Card 2 should come before scenes from Visual Card 3.

Continue until all Visual Cards are fully covered.

Use the same cardId for all scenes created from that Visual Card.

==================================
DISPLAY TEXT
==================================

Display Text must be extremely short.

Maximum 6 words.

Prefer 3 to 5 words.

Use only one tiny idea.

Never write a full sentence if a small phrase can work.

Never write paragraphs.

Never put explanation in Display Text.

Never put more than one concept in Display Text.

Display Text and narration should carry the same meaning.

A weak child should understand the scene just by reading this small text.

Display Text must be a learning idea, not a scene direction.

Do not describe what appears on screen.

Do not describe camera actions.

Do not describe teacher actions.

Do not describe image composition.

Do not describe visual movement.

Display Text must teach the concept itself.

Use concept words from the current Visual Card.

Use simple child-friendly wording.

For Mathematics, do not simplify equations into words.

Keep equations, formulas, powers, roots, fractions, and symbols exactly.

Wrong Display Text:
x square plus 3x plus 8

Correct Display Text:
x^2 + 3x + 8

Keep the meaning same as the current Visual Card.

Do not add new facts.

Do not add examples.

Do not add subject-specific details.

Avoid vague words.

Do not create filler opening scenes.

Do not create recap scenes.

Do not create background scenes.

Do not create meaningless or filler introduction scenes.

If an introduction stage is required by the tutorial structure,
it must introduce the actual learning topic using only
the supplied content.

Do not create an introduction merely to add a scene.

If the first Visual Card is only an opening sentence,
convert it into the actual learning idea.

Start directly with the concept.

Avoid meta or filler words like:
- background
- recap
- scene
- introduction
- basics
- overview
- simple

A good Display Text should answer:
"What should the child learn from this scene?"

A bad Display Text only answers:
"What is visible in the image?"

Good Display Text should be:
- short
- subject-safe
- from the current input only
- easy for a weak student
- maximum 6 words

Bad Display Text:
- long sentence
- textbook paragraph
- multiple ideas together
- more than 6 words

==================================
HEADING
==================================

Maximum 4 words.

Should immediately tell the topic.

Heading should be derived only from the current Visual Card.
Never use another Visual Card.

Never use another concept.

==================================
NARRATION
==================================

Narration must explain exactly ONE learning idea
represented by the current scene.

For a normal concept scene:

- Maximum 8 words.
- Prefer 3 to 6 words.
- Keep the narration short and natural.

IMPORTANT:

If the current scene is part of a:

- question
- problem
- calculation
- worked example
- exercise
- activity
- construction
- experiment
- reasoning process
- practice task

then the narration must explain the CURRENT STEP
of solving or performing it.

Do NOT stop at the question.

Do NOT only say:

"Let's solve this."
"Let's calculate."
"Try this."
"Now find the answer."

Actually teach the current step.

The COMPLETE solution must be divided into
MULTIPLE scenes whenever multiple steps are required.

Each meaningful solution step must have:

ONE scene
ONE image
ONE Display Text
ONE narration

The narration must explain ONLY the current step.

Do not explain future steps in the current narration.

Do not jump directly to the final answer when
intermediate steps are required.

----------------------------------
WORKED EXAMPLE FLOW
----------------------------------

Whenever the supplied cards contain enough information
to solve a problem, use this flow when applicable:

1. Identify what is given.
2. Identify what must be found.
3. Identify the required operation or method.
4. Perform the first step.
5. Perform the next step.
6. Show the calculation.
7. State the result.
8. State the final answer.

Do NOT create unnecessary steps.

Use only the steps supported by the supplied cards.

Do NOT invent missing information.

Do NOT invent an answer.

Do NOT use external knowledge.

----------------------------------
EXAMPLE
----------------------------------

If the supplied cards contain:

-125 + (-30) = ?

and the supplied content supports the calculation,
do NOT create only:

"We add two negative integers."

Instead create separate scenes such as:

Scene 1:
"We have -125 and -30."

Scene 2:
"Both numbers are negative."

Scene 3:
"Add 125 and 30."

Scene 4:
"125 + 30 = 155."

Scene 5:
"The result is negative."

Scene 6:
"-125 + (-30) = -155."

The exact wording may change according to the
supplied cards, but the mathematical meaning must
remain correct.

----------------------------------
IMAGE AND NARRATION MATCH
----------------------------------

The narration MUST match the current image.

If the image shows:

125 + 30 = 155

the narration must explain:

"125 plus 30 equals 155."

If the image shows the negative sign,
the narration must explain the negative sign.

If the image shows the final equation,
the narration must state the final result.

Never make the image teach one step while the
narration teaches another step.

----------------------------------
MATHEMATICS
----------------------------------

Keep mathematical expressions in symbolic form.

Do NOT convert:

x^2 → x square
√2 → square root of two
3x → three x

Keep equations, formulas, powers, roots,
fractions and symbols exactly as required
by the supplied cards.

----------------------------------
MATHEMATICS IMAGE ACCURACY
----------------------------------

For Mathematics image generation, mathematical correctness
is more important than visual creativity.

The image must represent the EXACT mathematical concept
of the CURRENT scene.

Do NOT invent:

- numbers
- equations
- fractions
- decimals
- percentages
- factors
- multiples
- shapes
- measurements
- angles
- answers
- examples
- operations

unless they are explicitly supported by the CURRENT Visual Card,
Display Text, Narration, or Image Prompt.

Do NOT introduce a new mathematical concept just to make
the image visually interesting.

For example:

If the current concept is:

"Complete division"

the image must communicate WHOLE-NUMBER DIVISION
with ZERO REMAINDER.

Do NOT represent complete division using:

- 1/2
- 1/3
- 1/4
- fraction bars
- pizza slices
- cake slices
- fractional pieces
- percentage models

unless fractions are explicitly part of the current scene.

If the current scene requires an equation,
show the exact equation required by the current scene.

Never replace a required equation with a different equation.

Never change a number.

Never change an operator.

Never change a mathematical symbol.

Never invent an example.

----------------------------------
MATHEMATICAL VISUAL MEANING
----------------------------------

The visual representation must match the mathematical meaning.

Examples:

Complete division
→ Show a whole-number division with zero remainder.

Fraction
→ Show an actual fraction representation.

Prime factorisation
→ Show the exact prime factors required by the scene.

Addition
→ Show addition, not subtraction.

Multiplication
→ Show multiplication, not repeated unrelated division.

Greater than
→ Show the correct comparison direction.

Less than
→ Show the correct comparison direction.

Equal
→ Show equality accurately.

Do not substitute one mathematical representation
for another.

----------------------------------
NO CREATIVE MATHEMATICAL SUBSTITUTION
----------------------------------

Do NOT creatively reinterpret a mathematical concept.

For example:

"Complete division"

must NOT become:

"three equal pieces of a pizza"

because that may introduce fractions.

"Prime factorisation"

must NOT become an unrelated number example.

"84 = 2 × 2 × 3 × 7"

must NOT become another mathematically correct
but different equation.

The CURRENT scene content always has priority
over visual creativity.

Mathematical accuracy comes before artistic creativity.

----------------------------------
NARRATION LENGTH
----------------------------------

For normal concept scenes:

Maximum 8 words.

For necessary worked-example or solution scenes:

The narration MAY exceed 8 words only when
the current solution step cannot be clearly
explained within 8 words.

Prefer 8 to 12 words.

NEVER create a long paragraph.

NEVER create 3 or 4 lines of narration.

Maximum 15 words for ONE solution step.

If a solution step needs more than 15 words,
split it into another scene.

Always prefer:

more scenes + shorter narration

over:

fewer scenes + long narration.

Do not combine multiple solution steps merely
to keep the narration short.

Prefer creating another scene instead.

Narration must:

- teach the current idea
- match the current image
- stay inside the supplied content
- use simple child-friendly language
- avoid unrelated explanations
- avoid outside facts
- avoid invented examples

Narration must NOT:

- describe camera movement
- describe image composition
- describe the screen
- describe what appears visually
- add a second unrelated idea
- skip a supported calculation step

==================================
IMAGE PROMPT
==================================

Generate ONE educational illustration.

One illustration should explain ONE SCENE.

One scene must represent exactly ONE tiny learning idea.

If the current scene is part of a calculation,
question, example, exercise, activity, construction,
or solution:

show ONLY the current step being taught.

Do not show the entire solution in one image.

Do not show future solution steps.

Do not show unrelated steps.

The image must match the current narration exactly.

Do not create collage.

Do not create infographic.

Do not combine multiple Visual Cards.

Maximum 3 important objects.

The illustration should explain the narration visually.

A weak student should understand the concept by looking at the image.

The image should be understandable even without narration.

The image should immediately explain the concept.

One image should contain only one learning objective.

Image Prompt may describe what should appear visually.

Display Text must not describe what appears visually.

Display Text teaches the idea.

Image Prompt shows the idea.

Never copy image-direction words into Display Text.

----------------------------------
VISUAL FACTS — MANDATORY
----------------------------------

Every scene MUST contain meaningful visualFacts.

visualFacts are the exact factual visual requirements
that the image generator must follow.

They are NOT a summary of the narration.

They are NOT generic descriptions.

They are NOT optional.

For EVERY scene, extract the specific visual facts
that must be represented in the image.

For each scene, visualFacts should identify, when
supported by the current Visual Card:

- exact objects that must appear
- exact numbers
- exact equations
- exact mathematical symbols
- exact shapes
- exact measurements
- exact angles
- exact labels when required
- exact relationships between objects
- exact direction or position when educationally important
- exact sequence or step when the scene teaches a process
- exact definition or property when it must be visually represented

IMPORTANT:

Use ONLY information supported by the CURRENT Visual Card.

Do NOT use outside knowledge.

Do NOT invent facts.

Do NOT create random examples.

Do NOT add facts from previous or future scenes.

Do NOT combine multiple Visual Cards.

For Mathematics:

visualFacts MUST preserve exact mathematical
information from the current scene.

If the scene contains:

- a number
- equation
- operation
- fraction
- factorisation
- angle
- measurement
- shape
- comparison
- mathematical relationship

include that exact information in visualFacts.

Do NOT replace exact mathematical information
with a mathematically equivalent example.

Do NOT change numbers.

Do NOT change operators.

Do NOT change symbols.

Do NOT invent calculations.

For diagrams:

visualFacts MUST describe the important structural
elements that make the diagram educationally correct.

For example, when supported by the current Visual Card,
visualFacts may include:

- object type
- required parts
- relative position
- direction
- relationship
- labels
- important lines or rays
- important points
- measurements
- required result

Do NOT add diagram elements that are not supported
by the current scene.

For processes or worked examples:

visualFacts must describe ONLY the CURRENT step.

Do NOT include future steps.

Do NOT include the complete solution when the current
scene represents only one step.

For SUMMARY or REVISION scenes:

visualFacts must describe the actual concept in the
CURRENT summary point.

Do NOT write:

"summary"

"revision"

"chapter summary"

as the visual fact.

Instead, extract the actual educational facts,
numbers, relationships, definitions, or examples
contained in the current summary point.

IMPORTANT:

visualFacts must NEVER be empty when the current
scene contains information that can be represented
visually.

If the scene contains a concept that cannot be
represented with a physical object, describe the
educational visual relationship needed to represent
that concept.

Every scene must have at least 1 meaningful visualFact.

The imagePrompt MUST be consistent with visualFacts.

The visualFacts MUST be consistent with:

1. Current Visual Card
2. Current Display Text
3. Current Narration
4. Current Image Prompt

If there is a conflict, the CURRENT Visual Card
is the ultimate source of truth.

Do not create visualFacts merely to satisfy the
field requirement.

Every visualFact must have a real purpose in
making the educational image correct.

----------------------------------
MUST SHOW / MUST NOT SHOW
----------------------------------

Every scene MUST contain:

- mustShow
- mustNotShow

These fields control the visual correctness of
the generated educational image.

----------------------------------
MUST SHOW
----------------------------------

mustShow contains the specific visual elements
that MUST be present in the generated image.

For every scene, identify the important elements
that are required to correctly teach the CURRENT
scene.

mustShow may contain:

- exact objects
- exact numbers
- exact equations
- exact mathematical symbols
- exact shapes
- exact measurements
- exact angles
- exact labels when required
- required parts of a diagram
- required relationships
- required directions
- required positions
- required result
- required current solution step

Use ONLY information supported by the CURRENT
Visual Card.

Do NOT invent mustShow elements.

Do NOT add decorative elements as mustShow.

Do NOT copy information from previous or future
scenes.

Do NOT combine multiple Visual Cards.

For Mathematics, preserve exact values.

For example, if the current scene requires:

84 = 2 × 2 × 3 × 7

mustShow should contain the exact mathematical
information required by that scene.

Do NOT replace it with another equation.

If the current scene is a diagram, mustShow must
identify the structural elements required for the
diagram to be educationally correct.

If the current scene is a worked example,
mustShow must describe ONLY the CURRENT step.

----------------------------------
MUST NOT SHOW
----------------------------------

mustNotShow contains visual elements that could
make the CURRENT educational concept incorrect,
confusing, or misleading.

Use mustNotShow whenever the current concept has
a realistic risk of visual misinterpretation.

Examples:

- wrong mathematical value
- wrong equation
- wrong operator
- wrong angle
- wrong shape
- wrong direction
- wrong diagram structure
- unrelated example
- unrelated number
- future solution step
- previous solution step
- incorrect mathematical representation
- misleading visual analogy

For example:

If the current scene teaches complete whole-number
division with zero remainder:

mustNotShow may include:

- fractions
- fraction bars
- pizza slices
- percentage models
- fractional pieces
- unrelated division examples

ONLY include mustNotShow elements when they are
relevant to preventing a realistic misunderstanding.

Do NOT create a huge generic list of things that
should never appear.

Do NOT forbid normal visual elements unless they
would conflict with the CURRENT scene.

----------------------------------
SOURCE OF TRUTH
----------------------------------

For mustShow and mustNotShow:

CURRENT Visual Card
>
CURRENT scene concept
>
CURRENT Display Text
>
CURRENT Narration
>
CURRENT Image Prompt

Never use outside knowledge.

Never invent educational facts.

The purpose of these fields is to make the image
semantically correct, not merely visually attractive.

----------------------------------
CONSISTENCY RULE
----------------------------------

mustShow MUST be consistent with visualFacts.

mustNotShow MUST NOT contradict mustShow.

mustShow MUST be supported by the CURRENT Visual Card.

mustNotShow MUST describe only realistic visual
confusions relevant to the CURRENT scene.

The Image Prompt MUST follow mustShow.

The Image Prompt MUST respect mustNotShow.

Every generated scene must contain both fields
as arrays.

Example:

"mustShow":[
    "exact required visual element",
    "exact mathematical relationship"
],

"mustNotShow":[
    "incorrect visual interpretation",
    "unrelated example"
]

If there is nothing meaningful to forbid for the
current scene, mustNotShow may be an empty array:

"mustNotShow":[]

However, mustShow must contain at least one
meaningful required visual element.

----------------------------------
IMAGE PROMPT QUALITY RULES
----------------------------------

Every Image Prompt must be specific enough that an
image-generation model can create the correct educational
visual without guessing the mathematical or conceptual meaning.

The Image Prompt must explicitly describe:

1. WHAT concept must be shown.
2. WHICH objects must be shown.
3. WHICH numbers or symbols must be shown, when required.
4. WHAT relationship between the objects must be shown.
5. WHAT must NOT be shown when there is a risk of confusion.

Do not write vague prompts such as:

"Show the concept visually."

"Create an educational diagram."

"Show the idea creatively."

Instead, describe the exact educational visual.

The image should be visually simple, clean, and easy for
a weak student to understand.

----------------------------------
CONCEPT-TO-VISUAL TRANSLATION
----------------------------------

The Image Prompt must convert the CURRENT scene's
learning idea into a concrete visual representation.

Do NOT rely on the image generator to infer the
educational meaning from a short sentence.

For abstract concepts, explicitly define the visual
relationship that represents the concept.

For mathematical concepts, explicitly specify:

- exact numbers
- exact equations
- exact operators
- exact symbols
- exact relationships
- required diagram structure
- required labels, if supported

If the concept has a common visual misconception,
explicitly state what NOT to show.

The Image Prompt must be specific enough that another
teacher could understand exactly what educational
visual is required without seeing the source PDF.

For SUMMARY scenes especially:

Do NOT generate a generic "summary" illustration.

Generate an illustration of the ACTUAL concept being
revised.

----------------------------------
CURRENT SCENE ONLY
----------------------------------

The Image Prompt must represent ONLY the CURRENT scene.

Do NOT combine information from:

- previous scenes
- next scenes
- other Visual Cards
- unrelated examples
- general textbook knowledge

Previous scenes may provide visual continuity,
but they must NOT change the mathematical or conceptual
content of the CURRENT scene.

The CURRENT scene is always the source of truth.

----------------------------------
EXACT MATHEMATICAL CONTENT
----------------------------------

If the current scene contains a mathematical value,
equation, factor, fraction, operation, measurement,
angle, shape, or number:

Use the EXACT value from the current scene.

Do not replace it with another example.

Do not generate a "similar" example.

Do not generate a random example.

Do not change the numbers to make the image easier.

Do not change mathematical notation.

Do not add additional mathematical examples.

----------------------------------
EXPLICIT NEGATIVE INSTRUCTIONS
----------------------------------

Whenever a concept can easily be misunderstood,
the Image Prompt MUST explicitly state what NOT to show.

For example, if the concept is complete whole-number division:

"Show whole-number division with zero remainder.
Do NOT show fractions, fraction notation, pizza slices,
cake slices, percentage models, or fractional pieces."

If the concept is prime factorisation:

"Show only the required number and its exact prime factors.
Do NOT introduce another number or another factorisation."

If the concept is an equation:

"Show the exact equation from the current scene.
Do NOT create another equation or example."

----------------------------------
VISUAL SIMPLICITY
----------------------------------

Prefer:

- one clear educational composition
- one main concept
- one mathematical relationship
- simple objects
- clean layout
- readable required text
- accurate symbols
- clear spacing

Avoid:

- decorative mathematical objects
- unnecessary characters
- unnecessary numbers
- unrelated objects
- complicated backgrounds
- multiple examples
- multiple equations
- multiple concepts
- confusing diagrams

Visual creativity must NEVER change the educational meaning.

----------------------------------
CHILD-FRIENDLY BUT ACCURATE
----------------------------------

The image should be:

- colorful
- clean
- friendly
- educational
- age appropriate
- visually engaging

However:

Do NOT sacrifice mathematical accuracy
for visual creativity.

Do NOT turn a mathematical concept into
an unrelated cartoon analogy.

Use a real educational representation whenever
the concept requires mathematical precision.

==================================
DISPLAY TEXT IMAGE RULE
==================================

IMPORTANT:

If text is visible inside the generated educational image,
the ONLY allowed educational text is the EXACT Display Text
of the current scene.

Never place the narration inside the image.

Never copy narration into the image.

Never create additional explanatory text.

Never paraphrase Display Text.

Never shorten Display Text.

Never rewrite Display Text.

Never add extra words to Display Text.

If Display Text is:
"2 × 3 = 6"

the visible text must be exactly:
"2 × 3 = 6"

Do not write:
"Two times three equals six."

Do not write the narration.

Do not add:
- headings
- labels
- captions
- explanations
- subtitles
- narration text
- scene names
- UI text
- "Display Text"
- "Narration"
- "Answer"
- "Solution"

The generated image must never contain the words:
"Display Text", "Narration", "Heading", "Scene",
or any similar metadata labels.

The image may contain the exact Display Text only when
text is necessary for understanding the current learning idea.

If text is not necessary, prefer a visual explanation
without additional text.

NEVER invent text that was not provided in Display Text.

----------------------------------
DISPLAY TEXT EXACTNESS
----------------------------------

If the current Display Text contains mathematical content,
the image must preserve it exactly.

Examples:

Display Text:
84 = 2 × 2 × 3 × 7

Allowed:
84 = 2 × 2 × 3 × 7

Not allowed:
84 = 2 × 3 × 14

Not allowed:
84 = 2 × 2 × 21

Not allowed:
Prime factorisation of 84

Not allowed:
84 can be factorised into primes.

The image must use the exact current Display Text,
not a mathematically equivalent replacement.

If Display Text is:

"Complete division"

the image may show the words:

"Complete division"

but must NOT add:

"1/3"

"1/2"

"12 ÷ 3 = 4"

or any other mathematical example unless
that exact information is supported by the current scene.

==================================
DURATION
==================================

Normally use:

4

Use larger duration only if really required.

==================================
OUTPUT
==================================

{
    "scenes":[
        {
            "scene":1,
            "cardId":1,
            "heading":"",
            "displayText":"",
            "narration":"",
          "visualFacts":[
    "exact visual fact 1",
    "exact visual fact 2"
],
"mustShow":[
    "exact required visual element 1",
    "exact required visual element 2"
],
"mustNotShow":[
    "specific incorrect visual element"
],
"imagePrompt":"",
"duration":4
        }
    ]
}

FINAL VALIDATION

Before returning JSON verify:


✓ Scene order = Visual Card order

Every Visual Card is covered.
A Visual Card may be split into many scenes.
No scene has more than one tiny idea.
Normal concept narration is maximum 8 words.

Worked-example and solution narration may exceed
8 words when necessary to explain ONE supported
solution step.

Do not reject a necessary solution explanation
only because it exceeds 8 words.

For every solvable problem supported by the input:

✓ The question is not left unanswered.

✓ Required intermediate steps are taught.

✓ Each meaningful solution step is a separate scene.

✓ The calculation is shown when supported.

✓ The final answer is explicitly stated.

✓ Image and narration describe the same step.

✓ No answer is invented.

✓ No mathematical example is invented.

✓ No number is invented.

✓ No equation is changed.

✓ No fraction is introduced unless supported
  by the current scene.

✓ No mathematical concept is visually substituted
  with another concept.

✓ Image Prompt describes a specific educational visual.

✓ Image Prompt contains enough detail for the image
  generator to understand the intended visual.

✓ Every scene contains visualFacts.

✓ visualFacts are not empty.

✓ Every visualFact is directly supported by the
  current Visual Card.

✓ visualFacts contain concrete visual requirements,
  not generic statements.

✓ visualFacts preserve exact mathematical information.

✓ visualFacts describe only the CURRENT scene.

✓ visualFacts are consistent with the Image Prompt.

✓ visualFacts are sufficient for an image generator
  to understand what must be visually represented.

  ✓ Every scene contains mustShow.

✓ mustShow is an array.

✓ mustShow contains at least one meaningful
  required visual element.

✓ Every scene contains mustNotShow.

✓ mustNotShow is an array.

✓ mustShow is supported by the current Visual Card.

✓ mustNotShow contains only relevant visual
  prohibitions.

✓ mustShow is consistent with visualFacts.

✓ mustNotShow does not contradict mustShow.

✓ Image Prompt follows mustShow.

✓ Image Prompt respects mustNotShow.

✓ mustShow and mustNotShow describe only the
  CURRENT scene.

✓ No outside information is added to mustShow
  or mustNotShow.

✓ visualFacts contain only information supported
  by the current Visual Card.

✓ Mathematical visualFacts preserve exact numbers,
  equations, symbols, and relationships.

✓ Summary scenes represent the actual concept,
  not the word "SUMMARY".

✓ Image Prompt uses the current scene's visualFacts.

✓ No unrelated mathematical information is added
  to visualFacts.

✓ Any potentially confusing mathematical interpretation
  is explicitly prevented with negative instructions.

✓ The image must represent the CURRENT scene,
  not a previous or future scene.

✓ No outside information is added.

Every displayText is maximum 6 words.

✓ No Visual Card is skipped


==================================
INPUT
==================================

${JSON.stringify(cards, null, 2)}

Return ONLY valid JSON.

`;

    }

}

export default LessonPlannerPromptBuilder;