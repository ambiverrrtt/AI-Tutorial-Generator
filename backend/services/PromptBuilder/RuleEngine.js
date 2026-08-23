import fs from "fs/promises";
import path from "path";

class RuleEngine {

    static async loadRuleFile(fileName) {

        const filePath = path.join(
            process.cwd(),
            "config",
            `${fileName}.json`
        );

        const data = await fs.readFile(
            filePath,
            "utf8"
        );

        return JSON.parse(data);

    }

    static getClassGroup(className) {

        className = className.replace(/\s+/g, "");

    if (
        ["Class1","Class2","Class3","Class4","Class5"]
        .includes(className)
    ) {

        return "primary";

    }

    if (
        ["Class6","Class7","Class8"]
        .includes(className)
    ) {

        return "middle";

    }

    if (
        ["Class9","Class10"]
        .includes(className)
    ) {

        return "secondary";

    }

    return "seniorSecondary";

}

static getTutorialInfo(tutorial) {

    return {

        className: tutorial.className,

        subject: tutorial.subject,

        board: tutorial.board,

        chapter: tutorial.chapterName,

        section: tutorial.sectionNumber,

        title: tutorial.title

    };

}

static getTeachingRules(
    teachingRules,
    className
) {

console.log("ClassName =", className)

console.log("Group =", this.getClassGroup(className))

    const rules = [];

    if (teachingRules.globalRules) {

        rules.push(
            teachingRules.globalRules
        );

    }

     const group =
        this.getClassGroup(className);

    switch (group) {

        case "primary":

            if (teachingRules.primaryRules) {

                rules.push(
                    teachingRules.primaryRules
                );

            }

            break;

        case "middle":

            if (teachingRules.middleRules) {

                rules.push(
                    teachingRules.middleRules
                );

            }

            break;

        case "secondary":

            if (teachingRules.secondaryRules) {

                rules.push(
                    teachingRules.secondaryRules
                );

            }

            break;

        case "seniorSecondary":

            if (
                teachingRules.seniorSecondaryRules
            ) {

                rules.push(
                    teachingRules.seniorSecondaryRules
                );

            }

            break;

    }

    const commonSections = [

    // "teachingFlow",

    "learningPointRules",

    "visualTeachingRules",

    // "studentPsychologyRules",

    // "bookContentRules",

    // "scenePlanningRules",

    // "teachingDecisionRules",

    // "sceneQualityRules",

    // "teachingValidationRules"

];

for (const section of commonSections) {

    if (teachingRules[section]) {

        rules.push(
            teachingRules[section]
        );

    }

}

    return rules;

}

}

export default RuleEngine;

