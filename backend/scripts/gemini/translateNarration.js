import dotenv from "dotenv";
import { generateHindiNarrationPlaywright } from "../playwright/generateHindiNarration.js";
import { jsonrepair } from "jsonrepair";
const TRANSLATION_BATCH_SIZE = 10;
const MAX_BATCH_RETRY = 3;

dotenv.config();

export async function translateNarration(
    narrationJson,
    accountId = 1
) {
    console.log(
        `Translating : ${narrationJson.title}`
    );


const allScenes = narrationJson.scenes;

const batches = [];

for (
    let i = 0;
    i < allScenes.length;
    i += TRANSLATION_BATCH_SIZE
) {
    batches.push(
        allScenes.slice(
            i,
            i + TRANSLATION_BATCH_SIZE
        )
    );
}

console.log("================================");
console.log("Hindi Translation Batches");
console.log("Total Scenes:", allScenes.length);
console.log("Total Batches:", batches.length);

batches.forEach((batch, index) => {
    console.log(
        `Batch ${index + 1}: Scene ${batch[0].scene} - Scene ${batch[batch.length - 1].scene}`
    );
});

console.log("================================");

const translatedBatches = [];

console.log("================================");
console.log("Starting Hindi Translation");
console.log("================================");

for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {

    const batch = batches[batchIndex];

    console.log(
        `\nTranslating Batch ${batchIndex + 1}/${batches.length}`
    );

    console.log(
        `Scenes: ${batch[0].scene} - ${batch[batch.length - 1].scene}`
    );

    const batchNarrationOnly = {
        narrations: batch.map(scene => ({
            scene: scene.scene,
            text: scene.narration
        }))
    };

    console.log(
        "Batch Scene Count:",
        batchNarrationOnly.narrations.length
    );

    console.log(
        "Batch Scene Numbers:",
        batchNarrationOnly.narrations.map(item => item.scene)
    );

    const prompt = `
You are an expert educational translator and an experienced Indian school teacher.

Rewrite ONLY the value of every "text" field into natural spoken Hindi.

Do NOT perform a literal translation.

Instead, rewrite every sentence exactly as a real Indian teacher would naturally speak it in a classroom.

The narration must sound exactly like a real Indian school teacher teaching live in a classroom.

Do NOT produce translated Hindi.

Do NOT produce book Hindi.

Do NOT produce formal literary Hindi.

Every sentence must sound as if it is being spoken aloud to students.

The output must be ready for Text-to-Speech without any further editing.

IMPORTANT RULES:

1. Translate ONLY the value of "text".
2. Do NOT change the "scene" number.
3. Keep the JSON structure exactly the same.
4. Do NOT add or remove any object.
5. Do NOT change any JSON key.
6. Keep the meaning exactly the same.
7. Do NOT summarize.
8. Do NOT add new information.
9. Return ONLY valid JSON.
10. Do not wrap the response inside json

For every object:

Translate ONLY the value of "text".

Do NOT change the scene number.

Do NOT change any JSON key.

Do NOT add or remove any object.

Only the value of "text" may change.

VERY IMPORTANT FOR TRANSLATION:

- Text must sound exactly like an experienced Indian CBSE classroom teacher or a high-quality Indian educational YouTube teacher.

Use natural conversational spoken Hindi.

Do not sound like Google Translate.

Do not sound like an English narrator.

IMPORTANT SPOKEN HINDI RULES

Imagine you are standing in front of a classroom and teaching students.

Write exactly what you would SPEAK, not what you would WRITE.

The narration should feel like a YouTube teacher or classroom teacher talking to students.

Prefer everyday spoken Hindi over textbook Hindi.

Students should feel that a teacher is talking directly to them.

Avoid overly formal words whenever a simpler spoken alternative exists.

- Use conversational spoken Hindi.
- Avoid pure literary Hindi.

Keep only technical terms in English.

Examples:

Prime factorisation

LCM

HCF

Mathematics

Formula

Equation

Diagram

Theorem

Do NOT keep ordinary numbers in English.

Numbers should be spoken naturally in Hindi.

Example:

140

Speak:
एक सौ चालीस

NOT:
one hundred forty

- Indian teachers naturally mix Hindi and English while teaching. Follow that style.

Examples of words that should remain in English:

Mathematics
Pattern
Patterns
Number
Numbers
Chapter
Topic
Activity
Example
Diagram
Formula
Equation
Fraction
Decimal
Percentage
Geometry
Algebra
Science
Computer
Internet
Experiment
Addition
Subtraction
Multiplication
Division
Shape
Circle
Square
Triangle
Rectangle
Teacher
Student
Homework
Practice
Exercise
Quiz

Example:

English:
Today we will learn about patterns in Mathematics.

Bad Translation:
आज हम गणित में प्रतिरूपों का अध्ययन करेंगे।

Good Translation:
आज हम Mathematics में patterns के बारे में सीखेंगे।

MATHEMATICS SPEAKING RULES

Translate the narration exactly as a skilled Indian Mathematics teacher would speak.

Never read mathematical expressions in pure English.

Examples:

140
Speak:
एक सौ चालीस

26
Speak:
छब्बीस

91
Speak:
इक्यानवे

306
Speak:
तीन सौ छह

657
Speak:
छह सौ सत्तावन

22338
Speak:
बाईस हजार तीन सौ अड़तीस

ANGLE WORD RULE

Whenever the English word "angle" appears in the
mathematics narration and it refers to a mathematical
angle, ALWAYS replace it with the Hindi word "कोण".

Examples:

angle → कोण

an angle → एक कोण

two angles → दो कोण

90° angle → 90 डिग्री का कोण

120° angle → 120 डिग्री का कोण

angle of rotation → घूर्णन का कोण

angle of symmetry → सममिति का कोण

smallest angle → सबसे छोटा कोण

angle between two lines → दो रेखाओं के बीच का कोण

NEVER pronounce the mathematical word "angle"
as the English word "एंगल".

The final Hindi narration must contain "कोण"
instead of "angle" whenever it refers to
a mathematical angle.

----------------------------------------

CLASS AND ROMAN NUMERAL RULES

Never spell Roman numerals letter by letter.

Whenever Roman numerals represent a class, chapter, standard or grade,
convert them into their natural spoken form.

Examples:

Class IX
Speak:
Class 9

Class X
Speak:
Class 10

Class XI
Speak:
Class 11

Class XII
Speak:
Class 12

Chapter IX
Speak:
Chapter 9

Chapter X
Speak:
Chapter 10

Chapter XI
Speak:
Chapter 11

Chapter XII
Speak:
Chapter 12

Never speak:

Class I X

Class X I

Chapter I X

Chapter X I

Roman numerals should always be converted into the corresponding spoken number whenever they refer to classes, chapters, standards, grades or section numbers.

Read mathematical symbols naturally.

Examples

English:
Today we will learn about reproduction.

Bad:
आज हम प्रजनन के बारे में अध्ययन करेंगे।

Good:
आज हम reproduction के बारे में सीखेंगे।

--------------------------------

English:
Let us understand this with an example.

Bad:
आइए इसे एक उदाहरण की सहायता से समझते हैं।

Good:
चलिए इसे एक example से समझते हैं।

--------------------------------

English:
Now observe this diagram carefully.

Bad:
अब इस आरेख का ध्यानपूर्वक अवलोकन कीजिए।

Good:
अब इस diagram को ध्यान से देखिए।

--------------------------------

English:
Can you answer this question?

Bad:
क्या आप इस प्रश्न का उत्तर दे सकते हैं?

Good:
क्या आप इस सवाल का जवाब दे सकते हैं?

×

Speak:
गुणा

÷

Speak:
भाग

=

Speak:
बराबर

+

Speak:
प्लस

-

Speak:
माइनस

>

Speak:
से बड़ा

<

Speak:
से छोटा

≤

Speak:
से छोटा या बराबर

≥

Speak:
से बड़ा या बराबर

------------------------

Read powers naturally.

2²

Speak:
दो का वर्ग

3²

Speak:
तीन का वर्ग

5²

Speak:
पाँच का वर्ग

2³

Speak:
दो का घन

6ⁿ

Speak:
छह की घात n

x²

Speak:
x का वर्ग

x³

Speak:
x का घन

Read fractions naturally.

1/2

Speak:
आधा

1/3

Speak:
एक तिहाई

1/4

Speak:
एक चौथाई

3/4

Speak:
तीन चौथाई

5/8

Speak:
पाँच बटा आठ

------------------------

Read decimals naturally.

2.5

Speak:
दो दशमलव पाँच

3.14

Speak:
तीन दशमलव एक चार

0.25

Speak:
शून्य दशमलव दो पाँच

12.75

Speak:
बारह दशमलव सात पाँच

Read roots naturally.

√2

Speak:
वर्गमूल दो

√3

Speak:
वर्गमूल तीन

√5

Speak:
वर्गमूल पाँच

√10

Speak:
वर्गमूल दस

√x

Speak:
वर्गमूल x

------------------------

Read commonly used mathematical symbols naturally.

π

Speak:
पाई

θ

Speak:
थीटा

α

Speak:
अल्फा

β

Speak:
बीटा

Δ

Speak:
डेल्टा

°

Speak:
डिग्री
------------------------

Read variables naturally.

x

Speak:
एक्स

y

Speak:
वाय

z

Speak:
ज़ेड

a

Speak:
ए

b

Speak:
बी

n

Speak:
एन

Read algebraic expressions naturally.

x + y

Speak:
एक्स प्लस वाय

x − y

Speak:
एक्स माइनस वाय

2x

Speak:
दो एक्स

3y

Speak:
तीन वाय

x² + y²

Speak:
एक्स का वर्ग प्लस वाय का वर्ग

a² + b²

Speak:
ए का वर्ग प्लस बी का वर्ग

Read equations naturally.

2² × 5 × 7

Speak:
दो का वर्ग गुणा पाँच गुणा सात

2 × 3²

Speak:
दो गुणा तीन का वर्ग

2² × 3 × 13

Speak:
दो का वर्ग गुणा तीन गुणा तेरह

LCM × HCF

Speak:
एल सी एम गुणा एच सी एफ

Prime factorisation

Speak:
Prime factorisation

Never expand abbreviations.

Keep these terms exactly unchanged:

LCM

HCF

CBSE

NCERT

PDF

AI

JSON

Do not translate or expand these abbreviations into full Hindi forms.

Do NOT say:

two squared
times
plus
minus
equals

Translate naturally as an Indian Mathematics teacher would speak.

These rules apply ONLY to narration.

The teacher naturally says:

दो का वर्ग

तीन का घन

पाँच गुणा सात

एल सी एम

एच सी एफ

Prime factorisation

Theorem

Example

Exercise

Do NOT sound like Google Translate.

Do NOT sound like an English narrator.

Always sound like an Indian classroom teacher.

VERY IMPORTANT

Before returning the JSON, read every narration aloud mentally.

If any sentence sounds like translated Hindi instead of spoken Hindi,
rewrite it into natural spoken classroom Hindi.

The narration must be pleasant for Text-to-Speech.

Every sentence should sound natural when spoken by an Indian teacher.

Never return translation-style Hindi.
Return spoken Hindi only.

FINAL VALIDATION BEFORE RETURNING

✓ The JSON is syntactically valid.

✓ Every object is properly closed.

✓ Every array is properly closed.

✓ Every quotation mark is balanced.

✓ Scene numbers are unchanged.

✓ Every "text" field has been translated.

✓ No object has been added.

✓ No object has been removed.

✓ Return ONLY valid JSON.

The final narration should be ready to feed directly into Text-to-Speech.

If a sentence sounds unnatural when spoken aloud, rewrite it before returning.

Prioritize natural speech over literal translation.

The first character must be {

The last character must be }

==================================
BATCH COMPLETION REQUIREMENT
==================================

This batch contains exactly ${batch.length} narration items.

You MUST translate ALL ${batch.length} items.

Do NOT stop early.

Do NOT return only the first 5 items.

Every input scene number must appear exactly once in the output.

Expected scene numbers:
${batch.map(scene => scene.scene).join(", ")}

If the input contains ${batch.length} scenes, the output MUST contain exactly ${batch.length} narrations.

==================================

JSON:

${JSON.stringify(batchNarrationOnly)}
`;
for (let attempt = 1; attempt <= MAX_BATCH_RETRY; attempt++) {
    console.log(
    `\nHindi Batch ${batchIndex + 1} Attempt ${attempt}/${MAX_BATCH_RETRY}\n`
);

    const response = await generateHindiNarrationPlaywright(
        prompt,
        accountId
    );

    const cleaned = response
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

let jsonText = cleaned.trim();

// Agar Gemini array return kare
if (jsonText.startsWith("[")) {

    const end = jsonText.lastIndexOf("]");

    jsonText = jsonText.substring(0, end + 1);

}
// Agar object return kare
else {

    const start = jsonText.indexOf("{");
    const end = jsonText.lastIndexOf("}");

    jsonText =
        start !== -1 && end !== -1
            ? jsonText.substring(start, end + 1)
            : jsonText;

}

    console.log("\n========== RAW RESPONSE ==========\n");
    console.log(cleaned);
    console.log("\n==================================\n");

    try {

let translatedJson = JSON.parse(jsonText);

// Agar Gemini ne array return kiya ho
if (Array.isArray(translatedJson)) {
    translatedJson = {
        narrations: translatedJson
    };
}

if (!translatedJson.narration && !translatedJson.narrations) {
    throw new Error("Gemini returned wrong JSON format.");
}

if (!translatedJson.narrations) {
    translatedJson.narrations = translatedJson.narration;
}

const expectedSceneNumbers =
    batch.map(scene => Number(scene.scene));

const actualSceneNumbers =
    translatedJson.narrations.map(
        item => Number(item.scene)
    );

const missingScenes =
    expectedSceneNumbers.filter(
        sceneNumber =>
            !actualSceneNumbers.includes(sceneNumber)
    );

const extraScenes =
    actualSceneNumbers.filter(
        sceneNumber =>
            !expectedSceneNumbers.includes(sceneNumber)
    );

if (missingScenes.length > 0) {
    throw new Error(
        `Gemini returned incomplete translation. Missing scenes: ${missingScenes.join(", ")}`
    );
}

if (extraScenes.length > 0) {
    throw new Error(
        `Gemini returned unexpected scenes: ${extraScenes.join(", ")}`
    );
}

if (
    translatedJson.narrations.length !==
    batch.length
) {
    throw new Error(
        `Gemini returned ${translatedJson.narrations.length} scenes, expected ${batch.length}.`
    );
}
translatedBatches.push(
    translatedJson.narrations
);

console.log(
    `✅ Batch ${batchIndex + 1} Translation Successful`
);

console.log(
    `Translated Scenes: ${translatedJson.narrations
        .map(item => item.scene)
        .join(", ")}`
);

break;

    } catch (err) {

        console.log("\n========== JSON PARSE ERROR ==========\n");
       console.log(err.message);

const match = err.message.match(/position (\d+)/);

if (match) {
    const pos = Number(match[1]);

    console.log("\n===== Error Around =====\n");

    console.log(
        jsonText.substring(
            Math.max(0, pos - 120),
            pos + 120
        )
    );

    console.log("\n========================\n");
}
        if (attempt === MAX_BATCH_RETRY) {
    throw err;
}

        console.log("\nRetrying Gemini...\n");

    }

}
}
// ========================================
// MERGE ALL TRANSLATED BATCHES
// ========================================

const allTranslatedNarrations =
    translatedBatches.flat();

console.log("================================");
console.log("Hindi Translation Completed");
console.log(
    "Total Translated Scenes:",
    allTranslatedNarrations.length
);
console.log("================================");

// Final JSON ki copy
const finalJson = structuredClone(narrationJson);

// Original scenes mein Hindi narration replace karo
for (const translated of allTranslatedNarrations) {

    const scene = finalJson.scenes.find(
        scene =>
            Number(scene.scene) ===
            Number(translated.scene)
    );

    if (!scene) {
        throw new Error(
            `Scene ${translated.scene} not found in original narration.`
        );
    }

    if (typeof translated.text !== "string") {
        throw new Error(
            `Invalid Hindi narration for scene ${translated.scene}.`
        );
    }

    scene.narration = translated.text;
}

// Final scene count check
if (
    finalJson.scenes.length !==
    narrationJson.scenes.length
) {
    throw new Error(
        "Final narration scene count changed unexpectedly."
    );
}

const finalSceneNumbers =
    allTranslatedNarrations.map(
        item => Number(item.scene)
    );

const expectedFinalSceneNumbers =
    narrationJson.scenes.map(
        scene => Number(scene.scene)
    );

const missingFinalScenes =
    expectedFinalSceneNumbers.filter(
        sceneNumber =>
            !finalSceneNumbers.includes(sceneNumber)
    );

const duplicateFinalScenes =
    finalSceneNumbers.filter(
        (sceneNumber, index, array) =>
            array.indexOf(sceneNumber) !== index
    );

if (missingFinalScenes.length > 0) {
    throw new Error(
        `Final Hindi narration missing scenes: ${missingFinalScenes.join(", ")}`
    );
}

if (duplicateFinalScenes.length > 0) {
    throw new Error(
        `Final Hindi narration contains duplicate scenes: ${[
            ...new Set(duplicateFinalScenes)
        ].join(", ")}`
    );
}

// Final translated scene count check
if (
    allTranslatedNarrations.length !==
    narrationJson.scenes.length
) {
    throw new Error(
        `Final Hindi narration incomplete. Expected ${narrationJson.scenes.length}, got ${allTranslatedNarrations.length}.`
    );
}

console.log("✅ All Hindi batches merged successfully.");
console.log(
    `✅ Final Hindi narration contains ${finalJson.scenes.length} scenes.`
);

return finalJson;

}