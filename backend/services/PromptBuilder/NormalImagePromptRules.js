const NormalImagePromptRules = `

Create a colorful educational illustration suitable for children.

One image must show only ONE tiny idea.

The image should match the Display Text exactly.

Do not show many concepts together.

Do not create collage.

Do not create infographic.

Do not create multiple panels unless the concept absolutely needs before-after.

Use very little text.

The child should understand the idea by seeing the main object/action.

Prefer:
- one main object
- one clear action
- simple background
- child-friendly visual storytelling

Avoid:
- many animals together
- many examples together
- big text boxes
- paragraph explanations
- complex arrows
- crowded scenes

The image and narration must feel like the same tiny learning moment.

------------------------------------
DISPLAY TEXT TEXT RULE
------------------------------------

If Display Text is provided for the scene:

The exact Display Text MUST appear in the image.

Show the exact Display Text text only.

Do NOT show the label "Display Text:".
Do NOT show the label "Narration:".
Do NOT show the label "Heading:".

Do NOT display the narration as separate text.

Do NOT add, remove, rewrite, shorten, expand, or paraphrase the Display Text.

The text inside the image must match the scene's Display Text exactly.

Never replace Display Text with narration.

Never create different text from the Display Text.

Never leave the image without the Display Text when Display Text is provided.

Do not write metadata labels such as:
"Display Text:"
"Narration:"
"Heading:"
"Scene:"
"Card:"

`;

export default NormalImagePromptRules;