import { generateNarrationPlaywright } from "../playwright/generateNarration.js";
import { saveJson } from "../utils/saveJson.js";
import { jsonrepair } from "jsonrepair";

function cleanJsonResponse(text) {
  let cleaned = String(text || "").trim();

  // Remove markdown code fences
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Remove text before JSON
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace > 0) {
    cleaned = cleaned.slice(firstBrace);
  }

  // Remove text after JSON
  const lastBrace = cleaned.lastIndexOf("}");
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }

  return cleaned.trim();
}

function validateReviewedNarration(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Reviewed narration is not a valid object.");
  }

  if (!Array.isArray(data.scenes)) {
    throw new Error("Reviewed narration must contain a scenes array.");
  }

  if (data.scenes.length === 0) {
    throw new Error("Reviewed narration contains no scenes.");
  }

  for (let i = 0; i < data.scenes.length; i++) {
    const scene = data.scenes[i];

    if (!scene || typeof scene !== "object") {
      throw new Error(`Scene ${i + 1} is invalid.`);
    }

    const requiredFields = [
  "scene",
  "cardId",
  "heading",
  "displayText",
  "narration",
  "imagePrompt",
  "duration",
];

    for (const field of requiredFields) {
      if (!(field in scene)) {
        throw new Error(
          `Scene ${i + 1} is missing required field: ${field}`
        );
      }
    }

    if (!Number.isInteger(scene.scene) || scene.scene < 1) {
  throw new Error(
    `Scene ${i + 1}: scene must be a positive integer.`
  );
}

if (scene.scene !== i + 1) {
  throw new Error(
    `Scene ${i + 1}: scene number must be ${i + 1}.`
  );
}

    if (!Number.isInteger(scene.cardId) || scene.cardId < 1) {
  throw new Error(
    `Scene ${i + 1}: cardId must be a positive integer.`
  );
}

if (scene.cardId !== scene.scene) {
  throw new Error(
    `Scene ${i + 1}: cardId must match scene number.`
  );
}

    // Optional visual validation fields
// Special scenes may not have these fields.
if (scene.visualFacts !== undefined && !Array.isArray(scene.visualFacts)) {
  throw new Error(`Scene ${i + 1}: visualFacts must be an array.`);
}

if (scene.mustShow !== undefined && !Array.isArray(scene.mustShow)) {
  throw new Error(`Scene ${i + 1}: mustShow must be an array.`);
}

if (scene.mustNotShow !== undefined && !Array.isArray(scene.mustNotShow)) {
  throw new Error(`Scene ${i + 1}: mustNotShow must be an array.`);
}

    if (!String(scene.narration || "").trim()) {
      throw new Error(`Scene ${i + 1}: narration is empty.`);
    }

    if (!String(scene.imagePrompt || "").trim()) {
      throw new Error(`Scene ${i + 1}: imagePrompt is empty.`);
    }

    if (scene.displayText !== scene.narration) {
  throw new Error(
    `Scene ${i + 1}: displayText must be exactly identical to narration.`
  );
}
  }

  return true;
}

/**
 * Review an already generated narration against the original NCERT topic content.
 *
 * Gemini receives exactly two main inputs:
 * 1. Original topic content
 * 2. Complete current narration JSON
 *
 * Gemini must return the COMPLETE updated narration JSON.
 */
export async function reviewNarration(
  topicContent,
  narration,
  accountId,
  outputPath
) {
  console.log("\n========================================");
  console.log("Starting Gemini Narration Review");
  console.log("========================================");

  if (!topicContent || !String(topicContent).trim()) {
    throw new Error("Original topic content is empty.");
  }

  if (!narration || !Array.isArray(narration.scenes)) {
    throw new Error("Invalid narration supplied for review.");
  }

  // ==================================================
   // PRESERVE COMMON OPENING + CLOSING SCENES
  // ==================================================

  if (narration.scenes.length < 4) {
    throw new Error(
      "Narration must contain at least 4 scenes: 3 opening scenes + 1 closing scene."
    );
  }

  // First 3 scenes are common tutorial opening scenes.
  const commonStartScenes = narration.scenes.slice(0, 3);

  // Last scene is the common tutorial closing scene.
  const commonEndScene = narration.scenes[narration.scenes.length - 1];

  // Only educational scenes will be sent to Gemini for review.
  const educationalScenes = narration.scenes.slice(3, -1);

  // Create narration object containing only educational scenes.
  const narrationForReview = {
    ...narration,
    scenes: educationalScenes,
  };

  const prompt = `
You are a SENIOR SCHOOL TEACHER, CURRICULUM EDITOR, and TEACHING-QUALITY REVIEWER.

Your task is to review an already generated educational narration against the ORIGINAL NCERT TOPIC CONTENT.

You will receive EXACTLY TWO IMPORTANT INPUTS:

INPUT 1:
Original NCERT topic content.

INPUT 2:
The educational scenes from the current narration JSON.

The first 3 scenes are common tutorial opening scenes and the final scene
is the common tutorial closing scene. These common scenes are handled
separately by the application and are NOT included in INPUT 2.

Review ONLY the educational scenes provided in INPUT 2.

Your job is NOT to give suggestions.

Your job is to CREATE THE COMPLETE UPDATED NARRATION JSON.

The updated narration must be ready to directly replace the current narration in the educational video pipeline.

==================================================
GROUND TRUTH
==================================================

The ORIGINAL NCERT topic content is the source of truth.

You MUST NOT:
- invent facts
- invent unsupported examples
- invent unsupported definitions
- invent unsupported formulas
- invent unsupported methods
- change the meaning of the source content
- introduce unrelated information that is not relevant to the topic

However, when the original content contains a question, exercise,
problem, calculation, or task, you MAY independently solve or answer
that task using the information provided in the source and correct
academic reasoning.

A solution derived logically or mathematically from the given
information is NOT considered an invented answer.

Any independently derived answer MUST:
- be correct
- be directly relevant to the question
- use only information available in the source or standard reasoning
  required to solve the task
- not introduce unrelated facts
- not change the intended meaning of the original question
- be checked for accuracy before inclusion

Do not add unsupported factual content, examples, definitions,
methods, or claims.

EXCEPTION:

When the source contains a question, exercise, calculation, problem,
or task, a correct answer or solution may be derived using the source
information and valid academic reasoning, as explicitly allowed in
the QUESTION SOLVING RULE.

Such a verified derived solution is considered part of teaching the
supported task, not unrelated or invented content.

SOURCE CONTENT vs TEACHING EXPLANATION:

You may reorganize the presentation of supported source content
when doing so improves student understanding.

You may:
- clarify wording
- improve transitions
- split overloaded scenes
- combine closely related sentences
- reorder presentation only when the logical meaning of the
  source is preserved
- make an implied relationship explicit when it is directly
  supported by the source

You must NOT introduce new factual claims merely because they
would make the explanation sound better.

Teaching clarity may improve.
Source meaning must remain unchanged.

==================================================
TEACHING QUALITY REVIEW
==================================================

Review EVERY educational scene.

Think like an experienced teacher teaching students at the intended
educational level of the provided content.

The reviewer must be able to handle content from Class 6 to Class 12
and across all subjects.

Do not assume that every student has strong prior knowledge.

Explain concepts clearly enough that an average or struggling student
can follow the learning sequence, while still maintaining the correct
academic depth required for the actual class and subject.

Check:

1. Is every important teaching step properly explained?

2. Can an average or struggling student at the intended educational
   level understand the concept from the narration?

3. Is the sequence logically connected?

4. Does each scene naturally follow the previous scene?

5. Is one scene trying to explain multiple separate ideas?

6. If two different teaching steps are combined in one scene,
   SPLIT them into separate scenes.

7. If a scene is too long or contains too much explanation,
   SPLIT it into smaller scenes.

8. Detect missing teaching steps.

9. Detect weak or incomplete explanations.

10. Detect unnecessary repetition.

11. Detect explanations that jump too quickly.

12. Detect scenes that assume knowledge which has not yet been explained.

13. Ensure the same teaching standard is maintained throughout the topic.

14. Ensure examples and worked solutions are properly explained when
    the original content supports them.

==================================================
DO NOT BLINDLY REWRITE
==================================================

IMPORTANT:

Do NOT rewrite every scene just because you can.

IMPORTANT:

Preserving an existing scene is NOT a reason to keep it unchanged.

If a scene is technically correct but is unclear, incomplete,
ambiguous, too dense, poorly connected, or not sufficiently
teachable, improve or split it.

Preserve good content, not poor structure.

If an existing scene is already:
- correct
- clear
- complete
- logically connected
- appropriate for the intended educational level
then PRESERVE IT.

Only modify a scene when there is a genuine teaching-quality problem.

==================================================
SCENE GRANULARITY AND VISUAL TEACHING
==================================================

IMPORTANT:

The PRIMARY goal is that the student understands the educational
content clearly, correctly, and without confusion.

This narration may be used for students from Class 6 to Class 12.

Therefore, adjust the explanation, language, depth, and visual detail
according to the actual class level, subject, topic, and difficulty
of the provided content.

Do NOT assume a specific class, subject, or topic unless it is provided
in the input.

Do NOT try to minimize the number of scenes.

If creating more scenes makes the content easier to understand,
you MUST create more scenes.

A higher scene count is completely acceptable.

Student understanding is more important than keeping the original
number of scenes.

--------------------------------------------------
ONE TEACHABLE IDEA = ONE SCENE
--------------------------------------------------

Each scene should communicate ONE clear primary teaching idea.

A teachable idea may be:
- a concept
- a definition
- an important fact
- one logical step
- one calculation or transformation
- one example
- one comparison
- one relationship
- one part of a process
- one question/task requirement
- one conclusion

Do NOT create a separate scene for every grammatical phrase or sentence.

However, a single sentence may still be TOO LONG for one scene.

If a sentence contains multiple meaningful parts that a student
needs to understand separately, SPLIT those parts into separate
scenes.

Do NOT keep a long definition, explanation, instruction, calculation,
or teaching statement in one scene merely because it is written as
one sentence in the source.

The reviewer MUST consider both:
1. whether the scene contains one teaching idea, and
2. whether that teaching idea can be comfortably understood in one
   short narration.

If the teaching idea is correct but the narration becomes long,
dense, difficult to listen to, or contains multiple logical parts,
SPLIT it into additional connected scenes.

When splitting a long teaching statement:
- preserve the complete meaning
- preserve the logical order
- do not remove important information
- keep each resulting scene focused
- make each resulting narration short and easy to understand
- ensure every resulting scene remains connected to the previous scene

Do NOT force multiple logical parts into one scene just to reduce
the scene count.

If more explanation is required, create another scene.

If a scene can be understood clearly in a shorter form, prefer the
shorter form.

The final narration must be divided according to meaningful teaching
steps, not according to the number of sentences in the source.

The goal is NOT to maximize or minimize the number of scenes.

The goal is to create as many short, clear, connected scenes as are
necessary for complete student understanding.

Never merge independent teaching ideas merely to reduce scene count.
Never split a genuinely short and coherent teaching idea merely to
increase scene count.

--------------------------------------------------
EVERY SCENE MUST HAVE ONE CLEAR VISUAL PURPOSE
--------------------------------------------------

For EVERY educational scene:

1. Identify the ONE main teaching idea of the scene.

2. Create an imagePrompt specifically for that teaching idea.

3. The visual must directly help the student understand the
   concept being explained.

4. Do not combine unrelated concepts into one visual.

5. Do not use generic decorative visuals when an explanatory
   visual is possible.

6. Do not create an image that only represents the overall topic.

7. The image must visually support or explain what the narration
   is teaching.

8. If a concept involves multiple logical steps, show the relevant
   step or relationship clearly rather than overcrowding one visual.

9. If separating concepts into different scenes would make the
   visual explanation clearer, create separate scenes.

10. visualFacts, mustShow, and mustNotShow must support the exact
    teaching purpose of the current scene.

The student should be able to connect:

DISPLAY TEXT + NARRATION + VISUAL

to the SAME teaching idea.

--------------------------------------------------
DISPLAY TEXT AND NARRATION MUST BE EXACTLY IDENTICAL
--------------------------------------------------

IMPORTANT — MANDATORY:

For EVERY scene:

displayText MUST be EXACTLY IDENTICAL to narration.

The two fields must contain the SAME text, with the SAME:
- words
- word order
- numbers
- mathematical expressions
- punctuation
- capitalization
- symbols
- spacing where applicable

Do NOT make displayText shorter than narration.

Do NOT make narration longer than displayText.

Do NOT paraphrase one field differently from the other.

Do NOT add an explanation to narration that is missing from displayText.

Do NOT shorten narration into a label for displayText.

The following relationship MUST always be true:

displayText === narration

Character-for-character equality is required.

If a scene needs more explanation, rewrite displayText and narration
together so both contain the same concise explanation.

The narration must NEVER contain additional information that is not
present in displayText.

The displayText must NEVER contain information that is not present
in narration.

Keep BOTH fields concise.

If a teaching point is too long to fit into one concise narration,
SPLIT it into additional scenes instead of making the narration long.

Avoid vague references such as:
- this
- these
- it
- they
- the number
- the above
- the following

when the reference is not immediately clear.

When necessary, use the actual concept, number, object, step, or subject
in BOTH displayText and narration.

FINAL RULE:

For every scene, before returning the JSON, verify:

displayText === narration

If they are not exactly identical, revise the scene before returning
the final JSON.

--------------------------------------------------
QUESTIONS, ACTIVITIES, EXERCISES AND TASKS
--------------------------------------------------

Questions and instructional tasks require special review.

Whenever the source contains ANY question or student task, detect it
before reviewing the teaching sequence.

A question or task may be identified by ANY of the following:

- a sentence ending with a question mark (?)
- a question mark appearing anywhere in the source text
- an explicit question such as What, Why, How, When, Where, Which,
  Who, Is, Are, Can, Does, Do, etc.
- Exercise
- Activity
- Try This
- Think About It
- Find
- Calculate
- Solve
- Explain
- Compare
- Prove
- Identify
- Determine
- Show that
- Give reasons
- Fill in the blanks
- Match the following
- Complete
- Discuss
- Describe
- Write
- List
- or any other instruction that requires the student to produce
  an answer, explanation, calculation, comparison, proof, identification,
  or other response.

IMPORTANT:

A question mark (?) is itself a strong signal that the source contains
a question and MUST be reviewed explicitly.

Do NOT ignore a question merely because it is written as part of a
paragraph, appears after a story, or is not introduced by words such as
Find, Calculate, or Solve.

Question-like content may appear anywhere in the original source.
Detect and review it wherever it occurs.

A question mark (?) is a strong question indicator even when the
question is embedded inside a paragraph or explanation.

Whenever a question mark (?) is detected, determine whether it is:

1. A STUDENT TASK that expects the student to produce an answer, solve
   something, calculate, explain, compare, identify, prove, determine,
   or perform another task.

OR

2. An EXPLANATORY / RHETORICAL QUESTION that is being used by the
   source to introduce, connect, or explain an idea.

Both types MUST be reviewed.

For a STUDENT TASK:
- explain what is given,
- explain what is required,
- identify the relevant concept or reasoning,
- solve or answer it when a reliable solution can be derived,
- explain important reasoning,
- state the final answer when applicable.

For an EXPLANATORY / RHETORICAL QUESTION:
- preserve its educational purpose,
- connect it naturally to the explanation,
- do not incorrectly convert it into a separate student exercise.

do NOT merely repeat or paraphrase the question.

Whenever a question or task is detected, it MUST be explicitly reviewed.

Do NOT allow the reviewer to pass over a detected question without
deciding how it should be taught.

For every detected question or task, determine:

1. WHAT information is given.
2. WHAT the student is being asked to find, calculate, identify,
   compare, explain, prove, determine, write, or do.
3. WHAT conditions, restrictions, or requirements apply.
4. WHAT concept, rule, formula, principle, evidence, passage,
   reasoning, or method is relevant.
5. WHETHER the task can be reliably answered using the source,
   supported concepts, and correct academic reasoning.
6. IF it can be reliably answered, solve or answer it and explain
   the important reasoning.
7. IF it cannot be reliably answered, do not guess or fabricate.
   Preserve and explain the task accurately.

A detected question must never be reduced to a vague narration such as:
"Now solve this question."

The student must understand both the task and, when reliably possible,
the answer or solution.

--------------------------------------------------
QUESTION SOLVING RULE
--------------------------------------------------

IMPORTANT:

If the source provides a question, exercise, calculation, or
problem but does NOT provide its answer or solution, DO NOT
automatically leave the question unanswered.

Instead, independently solve the question whenever a correct
solution can be derived from:
- the information provided in the source
- the concepts explained in the source
- standard academic reasoning appropriate to the subject and
  educational level

The reviewer is allowed to calculate, reason, derive, or solve
the answer even when the original source does not explicitly
provide the solution.

--------------------------------------------------
QUESTION SOLVING RULE
--------------------------------------------------

IMPORTANT:

If the source provides a question, exercise, calculation, or
problem but does NOT provide its answer or solution, DO NOT
automatically leave the question unanswered.

Instead, independently solve the question whenever a correct
solution can be derived from:
- the information provided in the source
- the concepts explained in the source
- standard academic reasoning appropriate to the subject and
  educational level

The reviewer is allowed to calculate, reason, derive, or solve
the answer even when the original source does not explicitly
provide the solution.

--------------------------------------------------
NO ANSWER-ONLY SOLUTIONS
--------------------------------------------------

For every STUDENT TASK that can be reliably solved, the final narration
MUST NOT consist only of the final answer.

Before stating the final answer, include the minimum necessary reasoning
that lets a student understand how the answer was obtained.

For calculation-based tasks, this MUST include the actual meaningful
calculation or transformation used to reach the result.

For reasoning-based tasks, this MUST include the key reasoning that
connects the given information to the conclusion.

If the required reasoning cannot fit into one concise scene, split it
into multiple scenes.

A scene containing only a question and its final answer is NOT sufficient
when the task is solvable.

A scene containing only a formula or rule is NOT sufficient when the
actual calculation or reasoning is needed to obtain the answer.

Do not omit a necessary intermediate step merely because the final
answer is obvious to an expert.

Use the simplest complete reasoning appropriate to the student's level.

SOLVABLE EXERCISES MUST BECOME WORKED TEACHING SEQUENCES

Whenever the source contains a solvable exercise, numerical problem,
calculation, or reasoning task, do not leave it as an unanswered prompt
or as an answer-only statement.

Convert the task into a short worked teaching sequence.

The sequence should normally teach these parts, when applicable:

1. What is given or what problem is being asked.
2. What we need to find or determine.
3. The relevant rule, definition, formula, concept, or principle.
4. The actual important calculation or reasoning step.
5. The final answer or conclusion.

For numerical calculations, the meaningful numerical operation itself MUST
appear in displayText and narration. Do not put the actual calculation only
inside visualFacts, mustShow, or imagePrompt.

For reasoning questions, the important logical reasoning MUST appear in
displayText and narration.

The question may remain as its own scene, but a solvable question MUST be
followed by the teaching/solution scenes.

Do not assume that a student will understand a calculation merely because
the final answer is shown.

Do not replace the solution with phrases such as "similarly", "therefore",
"it is", "equals", or "since" when those phrases hide an important
calculation or reasoning step.

If the solution requires multiple meaningful steps, split those steps into
multiple short scenes.

The student must be able to understand and reproduce the solution using
only displayText and narration, without depending on visualFacts,
mustShow, or imagePrompt.

--------------------------------------------------
STEP-BY-STEP SOLUTION AND REASONING
--------------------------------------------------

IMPORTANT:

For every solvable student question, exercise, problem,
calculation, or task, do NOT jump directly from the task
to the final answer.

The student must be able to understand HOW and WHY the
answer or result was obtained.

The amount of explanation must match the type of task,
subject, and educational level.

For mathematical or numerical problems:

1. State what is given.
2. State what needs to be found.
3. Identify the relevant rule, formula, definition, or concept.
4. Show the important calculation or reasoning steps.
5. Explain intermediate values when they are necessary
   for student understanding.
6. Verify the result when practical.
7. State the final answer clearly.

For conceptual, scientific, analytical, language-based, or
other non-numerical tasks:

1. State what information is given.
2. State what the student needs to determine or explain.
3. Identify the relevant concept, rule, evidence, principle,
   or reasoning.
4. Explain the important reasoning in a logical sequence.
5. Do not skip a reasoning step that the student needs
   to understand the answer.
6. State the conclusion or final answer clearly when applicable.

Do NOT assume that a student already understands an
intermediate step if that step is necessary to understand
the answer.

The goal is not merely to provide the correct answer.

The goal is to TEACH HOW THE ANSWER OR CONCLUSION IS OBTAINED.

If the solution requires multiple meaningful steps, create
multiple scenes.

Keep each scene concise.

Never put a complete multi-step solution into one long scene
when splitting it would make the reasoning easier to understand.

Do NOT create unnecessary steps or explanations that do not
help the student understand the task.

Do NOT assume that a student already understands an intermediate
calculation if that calculation is necessary to understand the
answer.

The goal is not merely to provide the correct answer.

The goal is to TEACH HOW THE ANSWER IS OBTAINED.

If the solution requires multiple meaningful steps, create
multiple scenes.

Keep each scene concise.

Never put the complete multi-step solution into one long scene
when splitting it would make the reasoning easier to understand.

Any independently derived solution must be verified for correctness
before it is included in the final narration.

For numerical or mathematical answers, independently verify the result
by substituting the answer back into the original condition whenever
such verification is possible.

For calculations, check the arithmetic carefully before including
the result.

Do NOT guess an answer.

Do NOT fabricate an answer.

Do NOT create an answer simply because the question appears
incomplete.

If the question cannot be reliably answered from the available
information and appropriate reasoning, preserve the question
accurately and explain what the student is being asked to do.

MANDATORY SOLVABILITY CHECK:

Before finalizing the narration, for EVERY detected STUDENT TASK,
internally determine:

"Can the answer be reliably derived from the source and correct
academic reasoning?"

If YES:
The reviewer MUST include the solution or answer in the narration.

If NO:
The reviewer MUST NOT guess or fabricate an answer and must explain
the task accurately instead.

Do not leave a reliably solvable student question unanswered merely
because the original source does not print its solution.

--------------------------------------------------
HOW TO TEACH THE QUESTION
--------------------------------------------------

Do not simply say:

"Now solve this question."

Instead, make the student's task clear.

The narration should explain:

- what is given
- what needs to be found
- what concept is being tested
- how to approach the problem
- the solution steps, when a reliable solution can be derived
- the final answer, when applicable

For numerical and calculation-based questions, "solution steps"
means actual meaningful calculations or transformations, not merely
stating the formula or final result.

The student should be able to trace the answer from the given
information to the final result.

If an intermediate number is used, explain how that number was
obtained whenever it is important for understanding.

Do not assume the student can mentally fill in missing calculation
steps.

Do not skip important reasoning steps.

Do not jump directly from the question to the final answer.

For calculation-based questions, show the important calculation
or reasoning steps clearly.

For conceptual questions, explain the reasoning behind the answer.

For multi-step problems, break the solution into separate scenes
when necessary.

--------------------------------------------------
QUESTION SCENE STRUCTURE
--------------------------------------------------

When appropriate, use this teaching sequence:

Scene 1:
Explain what information is given.

Scene 2:
Explain exactly what the student needs to find or determine.

Scene 3:
Explain the relevant concept, formula, rule, or reasoning needed
to solve the task.

Scene 4:
Work through the solution step-by-step.

Scene 5:
State and explain the final answer.

Do NOT force all five scenes when they are unnecessary.

Use only as many scenes as are genuinely useful for understanding.


QUESTION SOLUTION GRANULARITY:

For a multi-step student task, one scene should represent one
meaningful reasoning or solving step.

Do NOT put the complete question, method, multiple calculations,
and final answer into one scene when that would make the reasoning
difficult for the student to follow.

Create additional scenes when separate reasoning steps need to be
understood separately.

Do NOT create a separate scene for every grammatical sentence.
Split according to meaningful teaching or reasoning steps.

QUESTION CONCISENESS:

When solving a question, keep each scene focused on ONE important
solving step.

Do not put the complete explanation and all calculations into one
long scene.

Because displayText and narration must be identical, write the concise
teaching sentence directly in both fields.

If more explanation is needed, create another scene.

A shorter scene is preferred over a long narration, but never omit
necessary reasoning.

--------------------------------------------------
SOURCE AND SOLUTION BOUNDARY
--------------------------------------------------

The source remains the authority for the meaning and intended
content of the topic.

However, solving a question is an allowed teaching operation.

You may derive a correct answer from the source even when the source
does not explicitly provide that answer.

You must NOT use question-solving as an excuse to introduce unrelated
facts, unsupported claims, or additional content outside the scope
of the task.

The final answer must remain consistent with the source content.

--------------------------------------------------
KEEP NARRATION CONCISE
--------------------------------------------------

Narration must be clear, natural, and appropriate for the
educational level of the content.

Do NOT make narration unnecessarily long.

Do NOT add extra background information merely to make the
narration sound more detailed.

Do NOT repeat the same information unnecessarily.

Prefer one clear teaching point per scene.

If a concept requires multiple explanations or steps,
create additional scenes instead of making one narration
overly long.

ADDITIONAL CONCISENESS RULE:

Because displayText and narration must be identical, keep both fields
short enough to be comfortably read and spoken in the scene.

Prefer one or two short, clear sentences per scene.

Do NOT create long paragraph-style narration.

If a teaching point requires several sentences to explain correctly,
split the explanation into multiple scenes.

--------------------------------------------------
DISPLAY TEXT LENGTH LIMIT
--------------------------------------------------

IMPORTANT:

Because displayText is shown directly on the educational video,
displayText must remain short and easy to read on screen.

For every educational scene:

- Prefer 8–15 words.
- Avoid more than 18 words whenever possible.
- Do NOT create long paragraph-style displayText.
- If a teaching point requires more than 18 words to explain clearly,
  SPLIT it into multiple connected scenes.

A scene may contain only ONE short teaching idea.

For example, if one scene contains a long explanation with
multiple meaningful parts, do NOT keep the explanation together.

Instead, divide it into separate scenes.

Example:

BAD:
"Each triangle is an isosceles right triangle with identical legs
equal to the original square side and angles of 45, 45, and 90 degrees."

GOOD:

Scene 1:
"Each triangle is an isosceles right triangle."

Scene 2:
"Its two equal legs match the original square side."

Scene 3:
"Its angles are 45 degrees, 45 degrees, and 90 degrees."

Because displayText and narration must be identical,
the same short text MUST appear in both fields.

If the explanation cannot fit comfortably in a short display,
create additional scenes instead of making displayText longer.

Do NOT remove important information just to satisfy the length limit.
Distribute the important information across additional scenes.

Do NOT remove important information just to make narration short.
Instead, distribute the important information across additional
scenes.

Every scene should be short, focused, and easy to understand.

Use language appropriate to the class level, subject,
and complexity of the provided content.

For younger students, prefer simpler explanations and clearer
visual support.

For higher classes, maintain the appropriate academic depth
without oversimplifying important concepts.

--------------------------------------------------
SCENE COUNT
--------------------------------------------------

There is NO fixed maximum scene count.

It is completely acceptable for the reviewed narration to contain
MORE scenes than the original narration.

The number of scenes must be determined by the teaching needs
of the content.

Prioritize:

1. Student understanding
2. Concept clarity
3. Correctness
4. Logical teaching sequence
5. Visual understanding
6. Appropriate academic depth
7. Concise narration
8. Scene count

NEVER merge separate teaching ideas only to reduce the
number of scenes.

NEVER create unnecessary scenes only to increase the
number of scenes.

Create exactly as many scenes as are pedagogically useful.

--------------------------------------------------
SCENE SPLITTING DECISION
--------------------------------------------------

For every scene, ask:

"Does this scene contain more than one independently understandable
teaching idea?"

If YES:

Determine whether separating those ideas would make the content
clearer for the student.

If YES, SPLIT the scene into separate complete scenes.

If NO, keep them together as one coherent teaching point.

When splitting a scene, preserve the original logical sequence.

--------------------------------------------------
FINAL STUDENT UNDERSTANDING CHECK
--------------------------------------------------

Before returning the final JSON, review EVERY educational scene.

For each scene, mentally check:

1. Is the teaching point clear?

2. Is the narration easy to understand at the appropriate
   educational level?

3. Is displayText EXACTLY IDENTICAL to narration?

   Verify character-for-character equality.

   displayText === narration

4. Does the imagePrompt visually support the same teaching point?

5. Are there multiple independent concepts unnecessarily
   combined in this scene?

6. Would splitting the scene improve understanding?

7. Is the narration concise enough?

8. Is any important supported teaching step missing?

9. If this is a question, exercise, activity, or student task:
   - Is it clear what is given?
   - Is it clear what must be found or done?
   - If solvable, has it been correctly solved?
   - Are the important reasoning or calculation steps explained?
   - Is the final answer stated when applicable?

If the answer to any of these indicates a problem:

- simplify the narration
- align displayText with narration
- improve the imagePrompt
- improve visualFacts, mustShow, and mustNotShow
- or SPLIT the scene into smaller scenes

Do this for EVERY educational scene.

The final result must prioritize clear learning and
student comprehension over preserving the original
scene count.

==================================================
SCENE ORDER
==================================================

After reviewing and/or splitting scenes:

Renumber ALL scenes continuously:

1, 2, 3, 4, ...

There must be no duplicate scene numbers.

There must be no missing scene numbers.

==================================================
CARD ID
==================================================

After reviewing and/or splitting scenes:

- Every scene MUST have a cardId.
- cardId MUST be a positive integer.
- cardId MUST match the final scene number.
- Renumber cardId continuously together with scene numbers.

The final relationship MUST always be:

scene 1 -> cardId 1
scene 2 -> cardId 2
scene 3 -> cardId 3
...

If scenes are added, removed, merged, or split, regenerate cardId
values according to the FINAL scene order.

Do NOT preserve old cardId values when the scene order changes.

==================================================
COMMON TUTORIAL SCENES
==================================================

The common tutorial opening and closing scenes are NOT part of the
educational review.

The application preserves these scenes separately:

- First 3 scenes = common opening scenes
- Last scene = common closing scene

Do NOT create, modify, replace, remove, or review these common scenes.

Review ONLY the educational scenes supplied in INPUT 2.

==================================================
DISPLAY TEXT
==================================================

displayText MUST be EXACTLY IDENTICAL to narration.

Do NOT write a shorter version of narration in displayText.

Do NOT treat displayText as a title, label, summary, or shortened caption.

All explanation that is spoken in narration MUST also appear in
displayText exactly.

All text shown in displayText MUST also be spoken in narration exactly.

The following MUST always be true:

displayText === narration

Keep both fields concise.

If the teaching point is too long, split it into additional scenes
instead of making displayText or narration unnecessarily long.

IMPORTANT:

If a transition is used in narration, the EXACT SAME transition
must also appear in displayText.

Never add transition wording to narration alone.

If a transition makes the scene too long, create a separate short
transition scene instead.

==================================================
NARRATION
==================================================

Narration must sound like a teacher explaining the topic naturally.

Each narration should make the relationship between consecutive
scenes clear.

When a new idea depends on the previous scene, use a short,
natural transition so the student understands why the new idea
is being introduced.

It should be:
- simple
- clear
- connected
- student-friendly
- educational

Avoid:
- robotic wording
- unnecessary repetition
- unexplained jumps
- vague statements
- vague pronouns or references
- unexplained "this", "these", "it", or "they"
- sentences that require the student to look back to understand
  what is being discussed

==================================================
IMAGE CONSISTENCY
==================================================

For every scene:

imagePrompt
visualFacts
mustShow
mustNotShow

must describe and support the CURRENT scene only.

Do not introduce visual elements unrelated to the current scene.

Do not invent visual facts.

For questions, calculations, processes, comparisons, diagrams,
or relationships, prefer visuals that help the student understand
the actual task or relationship rather than merely illustrating
the topic generally.

A visual should answer:
"What should the student understand from this image?"

Do not create an image merely because the scene contains narration.

The visual must have a clear educational purpose.

==================================================
OUTPUT REQUIREMENT
==================================================

Return ONLY the COMPLETE UPDATED NARRATION JSON.

Do NOT return:
- explanations
- suggestions
- review comments
- markdown
- code fences
- analysis
- "here is the revised version"

Return valid JSON only.

==================================================
STRICT JSON OUTPUT RULES
==================================================

The response MUST be valid JSON and MUST be directly parseable
using JSON.parse().

Return ONLY the JSON object.

Do NOT return markdown.
Do NOT return code fences.
Do NOT return explanations.
Do NOT return comments.
Do NOT return analysis.
Do NOT return any text before or after the JSON.

--------------------------------------------------
STRING SAFETY
--------------------------------------------------

CRITICAL:

Inside JSON string values, DO NOT use unescaped double quotation
marks.

Whenever possible, DO NOT use double quotation marks inside
string values at all.

If a topic name, title, phrase, dialogue, or other text would
normally be written inside quotation marks, write it WITHOUT
quotation marks.

For example:

VALID:
"imagePrompt": "Create a visual explaining the topic Taxicab Numbers."

INVALID:
"imagePrompt": "Create a visual explaining the topic "Taxicab Numbers"."

If a double quotation mark is absolutely necessary inside a
string value, it MUST be escaped as \".

--------------------------------------------------
JSON STRING RULES
--------------------------------------------------

Every JSON property name MUST use normal double quotes.

Every JSON string value MUST use normal JSON double quotes.

Do NOT place raw line breaks inside JSON string values.

Do NOT place unescaped backslashes inside JSON string values.

Do NOT copy malformed quotation marks from the input narration.

When rewriting any of these fields:

- heading
- displayText
- narration
- imagePrompt
- visualFacts
- mustShow
- mustNotShow

make sure the resulting value is valid JSON.

--------------------------------------------------
FINAL JSON CHECK
--------------------------------------------------

Before returning the response, verify the COMPLETE response.

Check that:

1. Every { has a matching }.
2. Every [ has a matching ].
3. Every JSON property has a colon.
4. Every property is separated by a comma where required.
5. Every string starts and ends with a valid JSON double quote.
6. No unescaped double quote exists inside a string value.
7. No raw newline exists inside a string value.
8. No explanatory text exists outside the JSON object.

The final response MUST work directly with:

JSON.parse(response)

Return ONLY the valid JSON object.

==================================================
ORIGINAL NCERT TOPIC CONTENT
==================================================

${String(topicContent).trim()}

==================================================
CURRENT EDUCATIONAL NARRATION JSON
==================================================

The first 3 common opening scenes and the final common closing scene
are handled separately by the application and are NOT included here.

Review ONLY the educational scenes provided below.

${JSON.stringify(narrationForReview, null, 2)}

==================================================
FINAL INSTRUCTION
==================================================

Review the COMPLETE narration against the COMPLETE original
content.

--------------------------------------------------
METADATA PRESERVATION
--------------------------------------------------

Preserve all existing top-level metadata fields from the current
narration JSON unless a change is explicitly necessary and supported.

Do NOT silently remove existing top-level metadata fields.

Do NOT invent new top-level metadata fields.

Keep the existing metadata values unchanged unless they must be
changed because of the reviewed content.

The final reviewed narration must be suitable for the actual
educational level, subject, topic, and difficulty provided in
the input.

This framework must work consistently across Class 6 to Class 12
and across all academic subjects.

Preserve scenes that are already correct, clear, complete,
well-connected, and pedagogically effective.

Fix genuine problems such as:
- unclear explanations
- missing supported teaching steps
- incorrect or incomplete wording
- unnecessary repetition
- abrupt transitions
- vague references
- overloaded scenes
- mismatched displayText
- weak or generic visual support
- unclear questions or activities

For every question, exercise, activity, or student task:

- clearly explain what is given
- clearly explain what must be found or done
- identify the relevant concept, rule, formula, or reasoning
- solve the task whenever a reliable solution can be derived
- explain the important reasoning or calculation steps used
- state the final answer when applicable

The original source does NOT need to provide the solution explicitly.

The reviewer may independently solve the question using the
information available in the source and correct academic reasoning.

A correctly derived solution is NOT considered an invented answer.

Never guess, fabricate, or assume an answer without sufficient basis.

If a reliable solution cannot be derived from the available
information, do not manufacture one. Preserve and explain the
task accurately instead.

Do not skip important reasoning steps or jump directly from
the question to the final answer.

If the solution requires multiple logical steps, use separate
scenes when necessary to make the reasoning easy to follow.

Split scenes whenever doing so genuinely improves understanding.

Create additional scenes when they are pedagogically necessary.
There is no requirement to preserve the original scene count.

However, do not create unnecessary scenes.

The final narration should be:
- factually faithful to the source
- logically structured
- concise
- natural
- student-friendly
- appropriate for the actual class level
- clear without unnecessary assumptions
- visually teachable
- consistent between displayText, narration, and imagePrompt

Before returning the JSON, perform a final student-understanding
check on EVERY scene.

--------------------------------------------------
COMPLETE SOURCE COVERAGE AUDIT — MANDATORY
--------------------------------------------------

Before returning the final JSON, scan the COMPLETE ORIGINAL CONTENT
from beginning to end again.

Identify every meaningful educational element, including:

- important facts
- definitions
- concepts
- explanations
- examples
- formulas
- equations
- calculations
- relationships
- comparisons
- processes
- instructions
- questions
- exercises
- activities
- conclusions
- important statements that help explain the topic

Every important supported educational element MUST be represented
in the reviewed narration.

Do NOT omit an important teaching point simply because the original
narration already contained it.

Do NOT assume that preserving a scene automatically means the content
has been properly taught.

For every important source element, verify:

1. Is it present in the reviewed narration?
2. Is its meaning preserved?
3. Is it explained clearly enough for the intended class level?
4. Is it placed in the correct logical sequence?
5. Does the student have enough information to understand it?
6. Is any required explanation missing?
7. Is any unnecessary information added?

If an important supported teaching point is missing, add or revise
the necessary scene before returning the JSON.

Do NOT remove an important source-supported teaching point merely
because it makes the narration shorter.

Student understanding and complete source coverage are more important
than preserving the original scene count.

FINAL COVERAGE RULE:

No important educational content from the original source may be
silently omitted.

QUESTION AUDIT — MANDATORY:

Before returning the final JSON, scan the COMPLETE ORIGINAL CONTENT
again for every question or student task indicator, including every
occurrence of the character "?".

For EVERY detected question or task, verify that the reviewed narration:

- preserves the question/task meaning,
- clearly explains what is given when applicable,
- clearly explains what is required,
- identifies the relevant concept or reasoning,
- provides a reliable solution or answer when one can be derived,
- explains important reasoning or calculation steps,
- states the final answer when applicable.

If a detected STUDENT TASK is reliably solvable but the reviewed
narration only repeats or paraphrases the question, revise it and
include the solution.

MANDATORY ANSWER COMPLETENESS CHECK:

For every reliably solvable STUDENT TASK, do not consider the task
properly solved merely because the final answer is present.

The reviewed narration MUST show the actual reasoning or calculation
that connects the given information to the final answer.

For calculation-based tasks, the narration MUST contain the important
calculation or transformation itself.

For reasoning-based tasks, the narration MUST contain the key reasoning
that leads from the given information to the conclusion.

If the current reviewed narration contains the final answer but does not
show how that answer was obtained, the task is INCOMPLETE and MUST be
revised before returning the JSON.

If the reasoning requires more than one meaningful step, create additional
concise scenes.

Do not rely on imagePrompt, visualFacts, mustShow, or mustNotShow to
communicate reasoning that is missing from displayText and narration.

The student must be able to understand the solution from the
displayText and narration themselves.

Do NOT return the final JSON until every detected question/task has
been completely solved or appropriately explained.

A STUDENT TASK is NOT completely handled if the narration only states
the question and its final answer.

Before accepting the reviewed narration, internally verify for every
solvable STUDENT TASK:

1. Is the required answer present?
2. Is the relevant reasoning or calculation present?
3. Can the student understand how the answer was obtained from the
   narration alone?
4. If any important step is missing, revise the narration and check again.

Do not accept your own output if any of these checks fail.

A question mark (?) must never be ignored merely because the question
appears inside a paragraph or story.

Ask:

"If a student at the intended educational level watches this scene,
will they clearly understand what is being taught, why it is being
shown, and what they are expected to understand or do?"

If not, revise the scene before returning the final JSON.

Return the COMPLETE UPDATED NARRATION JSON ONLY.
`;

  console.log("Sending content + narration to Gemini...");
  console.log(`Account: ${accountId || "default"}`);
  console.log(`Current scenes: ${narration.scenes.length}`);

  const response = await generateNarrationPlaywright(prompt, accountId);

 const cleanedResponse = cleanJsonResponse(response);

let reviewedNarration;

try {
    reviewedNarration = JSON.parse(cleanedResponse);

} catch (error) {

    console.log("Normal JSON.parse failed.");
    console.log("Trying jsonrepair...");

    try {

        const repairedJson = jsonrepair(cleanedResponse);

        reviewedNarration = JSON.parse(repairedJson);

        console.log("JSON repaired successfully.");

    } catch (repairError) {

        console.error("Gemini returned invalid JSON.");
        console.error(cleanedResponse.slice(0, 2000));

        throw new Error(
            `Failed to parse Gemini reviewed narration JSON: ${repairError.message}`
        );
    }
}

    // ==================================================
  // RESTORE COMMON OPENING + CLOSING SCENES
  // ==================================================

  reviewedNarration.scenes = [
    ...commonStartScenes,
    ...reviewedNarration.scenes,
    commonEndScene,
  ];

  // Normalize reviewed scenes after Gemini response.
  reviewedNarration.scenes.forEach((scene, index) => {
  const newId = index + 1;

  // Scene number must always be continuous.
  scene.scene = newId;

  // cardId must always be regenerated after review.
  scene.cardId = newId;

  // displayText and narration must be exactly identical.
  scene.displayText = scene.narration;
});

// Final validation after normalization.
validateReviewedNarration(reviewedNarration);

console.log(
  `Gemini review complete. Reviewed scenes: ${reviewedNarration.scenes.length}`
);

  // Save reviewed narration separately.
  if (outputPath) {
    await saveJson(outputPath, reviewedNarration);

    console.log("----------------------------------------");
    console.log("Reviewed narration saved:");
    console.log(outputPath);
    console.log("----------------------------------------");
  }

  return reviewedNarration;
}