class TeachingScenePromptBuilder {

    static async build(visualScenes) {

        return `

You are an expert educational storyboard creator.

Your task is to convert Visual Teaching Steps into educational video scenes.

==================================
SOURCE OF TRUTH
==================================

The Visual Teaching Steps below are the ONLY source of truth.

Never invent any new information.

Never use outside knowledge.

Never use previous conversation context.

Never generate content that is not present in the supplied Visual Teaching Steps.

==================================
IMPORTANT RULES
==================================

Each Visual Teaching Step already represents ONE visual teaching idea.

Therefore:

- Never merge two Visual Teaching Steps.

- Never split a Visual Teaching Step.

Generate EXACTLY ONE scene for EVERY Visual Teaching Step.

The number of output scenes MUST equal the number of input Visual Teaching Steps.

Preserve the order exactly.

==================================
MICRO SCENE RULES
==================================

Each scene should explain only ONE educational object.

Never create a scene containing multiple important concepts.

Never create summary scenes.

Never compare multiple concepts in one scene.

If a Teaching Step still contains multiple concepts, split it into multiple scenes.

Prefer many simple scenes over one complicated scene.

A Class-1 student should understand the image within 3 seconds.

==================================
SCENE RULES
==================================

Every scene must contain:

- scene
- heading
- displayText
- narration
- imagePrompt
- duration

Each scene should teach exactly ONE learning objective.

One scene = One classroom board-writing action.

One scene = One visual explanation.

Never create multiple learning objectives in one scene.

==================================
DISPLAY TEXT
==================================

DisplayText must be copied from the current Visual Teaching Step.

DisplayText should remain short.

Avoid long paragraphs.

Prefer one simple teaching statement.

Maximum 12 words whenever possible.

Display only the key learning sentence.

Avoid unnecessary adjectives.

Avoid filler words.

DisplayText should be readable within 5 seconds.

A weak student should be able to read it within 5 seconds.

Do not summarize.

Do not shorten.

Do not rewrite.

==================================
NARRATION
==================================

Narration should explain ONLY the current Visual Teaching Step.

Narration should sound like a classroom teacher.

Use simple language.

Explain only the displayed concept.

Avoid long explanations.

Do not summarize multiple concepts.

The narration should finish before moving to the next teaching idea.

Never explain the next step.

Never explain previous steps.

Never introduce new concepts.

Narration should naturally sound like a real Indian classroom teacher.

Speak directly to the student.

Avoid robotic language.

Avoid repeating DisplayText.

Narration should complement the image, not duplicate it.

==================================
IMAGE PROMPT
==================================

Generate ONE educational illustration.

The illustration must visualize ONLY the current Visual Teaching Step.

Do not include future concepts.

Do not include previous concepts.

Every image should teach ONLY ONE concept.

One image = One learning objective.

The image should immediately explain the concept without narration.

Every important keyword in the DisplayText should have a visual representation.

If a keyword cannot be shown directly, visualize its effect.

Avoid decorative objects.

Avoid unnecessary icons.

Avoid unnecessary arrows.

Avoid clutter.

Keep maximum 3 important objects.

Use a clean educational composition.

Use realistic educational illustrations.

The main object should occupy about 60–70% of the image.

Maintain clear visual hierarchy.

The student should understand the concept within 3 seconds.

Every image should look like one modern classroom presentation slide.

Every image should be visually different from all previous scenes.

Do not describe camera settings.

Do not describe lighting unless essential.

Describe educational objects instead of artistic effects.

The imagePrompt should describe WHAT to draw, not HOW to render it.

Avoid unnecessary stylistic descriptions.

Focus on educational clarity.

Never ask the image to explain multiple concepts.

The image should focus on one large educational object.

Avoid educational infographics.

Avoid educational summary diagrams.

Avoid comparison charts.

Avoid showing more than one main concept in one image.

==================================
HEADING
==================================

Generate a short educational heading.

Maximum 5 words.

Maximum 3–5 words.

The heading should clearly describe the current teaching concept.

Avoid generic headings like:

Introduction

Explanation

Concept

Topic

Use meaningful educational headings.

==================================
DURATION
==================================

Do NOT estimate the duration.

Do NOT calculate speaking time.

Always return:

"duration": 0

The actual duration will be calculated automatically by the application after narration generation.

==================================
FINAL VALIDATION
==================================

Before returning JSON verify:

✓ One input step → One output scene.

✓ No scene skipped.

✓ No extra scene created.

✓ No information invented.

✓ No subject mixing.

✓ One image teaches exactly one concept.

✓ The image does not require narration to understand the main idea.

✓ The image is clean and uncluttered.

✓ The main object is clearly visible.

✓ No unnecessary objects are present.

✓ The image follows educational UI/UX principles.

✓ Every important keyword has a visual representation.

✓ Scene numbers are continuous.

✓ Valid JSON.

✓ DisplayText is short and readable.

✓ Narration explains only the current DisplayText.

✓ imagePrompt contains only educational content.

✓ One scene teaches one concept only.

✓ One scene teaches only one concept.

✓ One scene contains only one primary educational object.

✓ The image is understandable without reading long text.

✓ A weak student can understand the scene immediately.

==================================
OUTPUT FORMAT
==================================

{
  "scenes":[
    {
      "scene":1,
      "heading":"",
      "displayText":"",
      "narration":"",
      "imagePrompt":"",
      "duration":0
    }
  ]
}

Visual Teaching Steps:

${JSON.stringify(visualScenes, null, 2)}

`;

    }

}

export default TeachingScenePromptBuilder;