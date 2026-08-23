class ScenePromptBuilder {

    static async build(scene) {

        return `

You are an expert educational content creator.

Your task is to generate ONE educational scene.

INPUT

${JSON.stringify(scene, null, 2)}

RULES

1. Use ONLY the supplied text.

2. Do NOT add any new information.

3. Do NOT summarize.

4. Do NOT rewrite the display text.

5. Do NOT introduce another subject.

6. Generate ONLY:

- heading
- narration
- imagePrompt
- duration

Return ONLY valid JSON.

OUTPUT FORMAT

{
    "heading":"",
    "narration":"",
    "imagePrompt":"",
    "duration":4
}

`;

    }

}

export default ScenePromptBuilder;