import PromptBuilder from "./PromptBuilder.js";

class NarrationPromptBuilder {

    static async build(tutorial) {

        const prompt =
            await PromptBuilder.buildNarrationPrompt(
                tutorial
            );

        return prompt;

    }

}

export default NarrationPromptBuilder;