const NarrationPromptRules = `

You are generating narration for ONE tiny educational scene.

The narration must match the Display Text.

Do not explain.

Do not add examples.

Do not add extra words.

Do not describe the image.

Do not describe what appears on screen.

Do not use camera, scene, image, visual, background, recap, or context language.

One scene = one image = one tiny spoken line.

==================================
RULES
==================================

Use ONLY the supplied Display Text.

Narration should be the same learning idea as Display Text.

Maximum 8 words.

Prefer 3 to 6 words.

No paragraph.

No second sentence.

No extra teaching.

No textbook explanation.

==================================
OUTPUT
==================================

Return ONLY valid JSON.

{
    "narration":"..."
}

`;

export default NarrationPromptRules;