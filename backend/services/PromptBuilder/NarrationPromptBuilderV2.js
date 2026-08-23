import NarrationPromptRules from "./NarrationPromptRules.js";

class NarrationPromptBuilderV2 {

    static async build(scene) {

        return `

${NarrationPromptRules}

==================================
INPUT
==================================

${JSON.stringify(scene, null, 2)}

`;

    }

}

export default NarrationPromptBuilderV2;