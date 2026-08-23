// ==================================================
// IMAGE PROMPT RULES
// Common + Mathematics + Science
// Subject Based Prompt System
// ==================================================

function getImagePromptRules(
    subject = "",
    sceneType = "",
    imagePrompt = "",
    displayText = "",
    heading = "",
    sceneNumber = ""
) {

    const normalizedSubject =
        String(subject || "")
            .trim()
            .toLowerCase();

    const normalizedSceneType =
        String(sceneType || "")
            .trim()
            .toLowerCase();

    const combinedText = `
        ${imagePrompt}
        ${displayText}
        ${heading}
    `.toLowerCase();


    // ==================================================
    // COMMON RULES
    // ==================================================

   const commonRules = `

==================================
COMMON EDUCATIONAL IMAGE RULES
==================================

Create a high-quality, child-friendly educational
illustration for a school YouTube lesson.

The image must communicate ONE tiny learning idea
from the supplied concept.

==================================
STORYTELLING
==================================

The lesson should feel like a continuous visual story.

Each scene should feel connected to the previous
learning moment and naturally lead to the next one.

Use visual storytelling such as:

notice → explore → understand → connect → remember

when supported by the concept.

Create curiosity and discovery so the child feels:

"Let's see what happens next."

Do NOT invent:
- facts
- examples
- events
- characters
- objects
- explanations

Storytelling must improve visual continuity without
changing the supplied meaning.

Do not make every scene look identical.

Vary composition, framing, action, perspective or
environment when appropriate.

==================================
ONE CONCEPT
==================================

Show exactly ONE tiny learning concept.

The image must match the supplied Display Text
and Image Prompt.

Use maximum 3 important educational objects.

Every important visual object must help explain
the concept.

Do not create:
- collage
- infographic
- unrelated panels
- crowded scenes
- unrelated objects
- decorative objects

The image should communicate the concept even
without narration.

==================================
EDUCATIONAL STYLE
==================================

Use:

- modern educational illustration
- child-friendly visual storytelling
- clean digital artwork
- polished 2D or simplified 3D style
- professional educational YouTube quality
- bright but balanced colors
- clear visual hierarchy

The main teaching concept must immediately
attract the student's attention.

Avoid unnecessary:
- icons
- arrows
- decorations
- labels
- props
- characters

==================================
TEXT RULES
==================================

Display Text is MANDATORY for every scene.

Display Text must NEVER be empty.

The EXACT Display Text provided by the scene
MUST appear visibly inside the generated image.

This is NOT optional.

Every generated image MUST contain the
Display Text as visible educational text.

Never generate an image without the Display Text.

IMPORTANT:

If Display Text appears visibly inside the image,
show ONLY the exact text contained in Display Text.

Copy it exactly.

Do NOT rewrite it.
Do NOT paraphrase it.
Do NOT shorten it.
Do NOT expand it.
Do NOT translate it.

NEVER add:

"Display Text:"

"Display Text"

"text:"

"Text:"

or any other metadata label before the actual text.

For example, if Display Text is:

6 × 6 grid

The image may show:

6 × 6 grid

The image MUST NOT show:

Display Text: 6 × 6 grid

The image MUST NOT show:

Text: 6 × 6 grid

==================================
NARRATION TEXT RULE
==================================

Narration is ONLY an internal teaching instruction.

NEVER render narration as visible text.

NEVER copy narration into the image.

NEVER create subtitles from narration.

NEVER create captions from narration.

NEVER combine narration with Display Text.

Display Text and narration may be identical
or different in wording.

This does NOT matter.

Only Display Text may be used as visible
educational text.

==================================
METADATA LABEL RULE
==================================

NEVER show these labels inside the image:

"Heading:"
"Heading"
"Display Text:"
"Display Text"
"Narration:"
"Narration"
"Scene Number:"
"Scene Number"
"Image Prompt:"
"Image Prompt"
"Card ID:"
"Card ID"

These are internal prompt metadata only.

They must NEVER appear as visible text.

==================================
TEXT CONTENT RULE
==================================

Do not invent additional educational text.

Do not create explanatory sentences.

Do not create extra captions.

Do not create paragraphs.

Do not create UI labels.

Do not create title banners.

Do not create text boxes containing metadata.

The exact Display Text MUST be the visible
educational text in every generated image.

Do NOT decide whether Display Text is needed.

It is ALWAYS required.

Use ONLY the exact Display Text provided
by the scene.

Do NOT replace it with Narration.

Do NOT omit it.

Mathematical equations, formulas, numbers,
scientific symbols, chemical formulas and
essential scientific or diagram labels may also
appear when they are genuinely required by
the supplied concept.

However, do not use Narration as visible text.

==================================
FINAL TEXT CHECK
==================================

✓ Display Text is not empty
✓ Display Text is copied exactly when used
✓ No "Display Text:" label
✓ No "Text:" label
✓ No Heading label
✓ No Narration text
✓ No Narration subtitles
✓ No metadata labels
✓ No invented educational text
✓ No extra explanation

- Never show prompt metadata as visible text.

For example, if:

Heading:
Alcohol

Display Text:
Alcohol: 1.36

Then the image may contain:

Alcohol
Alcohol: 1.36

But it MUST NOT contain:

Heading: Alcohol
Display Text: Alcohol: 1.36

Do not repeat the same text multiple times.

Do not create:
- text boxes containing prompt instructions
- metadata labels
- explanations
- paragraphs
- prompt field names
- UI labels

The Display Text must be reproduced exactly,
regardless of its length.

Never shorten the Display Text to satisfy
a visual text limit.

The Display Text must remain exactly as supplied.

==================================
NO TEXT DUPLICATION
==================================

NEVER repeat the same Heading or Display Text.

If the Heading already identifies the main object,
do not write the same name again as a second label.

For example:

Heading:
Crown Glass

Display Text:
Crown Glass: 1.52

DO NOT create:

Crown Glass
Crown Glass
Crown Glass: 1.52

Instead, use the minimum necessary text.

Prefer:

Crown Glass

and show 1.52 only as a scientific value
when it is necessary for understanding the concept.

Do not repeat a noun in multiple places
unless the repetition is essential to the lesson.

Do not create duplicate labels around
the same object.

Do not place the same text:
- at the top
- above the object
- inside the object
- below the object

at the same time.

ONE educational label is preferred.

==================================
DISPLAY TEXT VISIBILITY RULE
==================================

Display Text MUST be visibly present in EVERY image.

Display Text is the ONLY scene text that may
be intentionally reproduced as visible text.

When visible text is needed:

Use the exact Display Text.

Do not modify it.

Do not paraphrase it.

Do not shorten it.

Do not expand it.

Do not translate it.

Do not add a label before it.

Never write:

"Display Text:"

"Text:"

"Caption:"

"Label:"

The actual Display Text must appear directly,
without any metadata label.

Narration must NEVER be reproduced as text.

Heading must NOT be reproduced as text unless
it is already part of the exact Display Text.

Do not create additional educational sentences.

Do not invent text.

Display Text must never be empty.

FINAL TEXT CHECK:

✓ Heading is not copied unnecessarily
✓ Display Text is not copied unnecessarily
✓ Narration is not copied
✓ Scene Number is not shown
✓ Card ID is not shown
✓ No automatic title
✓ No automatic caption
✓ No unnecessary text boxes
✓ Only essential educational text is allowed

==================================
PROMPT METADATA
==================================

Never visually reproduce prompt metadata.

The following are instructions, NOT image text:

Heading
Display Text
Scene Number
Image Prompt
Image Prompt Subject
Scene Type
Prompt

==================================
NO SCREENSHOT / NO UI
==================================

The generated image must be the actual educational
illustration itself.

NEVER generate a screenshot of:
- YouTube
- YouTube video player
- browser window
- Gemini
- computer screen
- mobile screen
- website
- application interface
- video editing software
- presentation software

NEVER include:
- YouTube play button
- YouTube progress bar
- video timeline
- playback controls
- pause button
- volume control
- fullscreen button
- settings button
- browser address bar
- browser tabs
- mouse cursor
- browser borders
- application windows
- screenshot frames
- screen-recording UI
- player controls
- black video-player borders

The output must NOT look like a screenshot
taken from a video or computer screen.

Create the educational artwork directly.

The entire 16:9 image must be the illustration.

No external UI should surround the illustration.

If the concept is about a video, animation,
screen, website or software, represent the concept
inside the educational illustration without
showing the actual interface.

FINAL SCREENSHOT CHECK:

✓ No screenshot
✓ No browser UI
✓ No YouTube UI
✓ No video player
✓ No playback controls
✓ No progress bar
✓ No computer screen frame
✓ No application interface
✓ No cursor
✓ No external borders
✓ Full educational illustration only

==================================
FULL FRAME / 16:9
==================================

Landscape 16:9 only.

Fill the complete canvas.

The background must reach all four edges.

Do NOT create:
- white margins
- blank borders
- white cards
- white title panels
- empty poster backgrounds
- portrait images
- square images
- worksheet-style layouts

Do NOT reserve space for the Heading or
Display Text.

Do NOT place a title banner at the top.

The educational illustration should naturally
fill the complete canvas.

Do not reserve a large blank area for text.

==================================
QUALITY
==================================

Keep the image:

- sharp
- readable
- clean
- balanced
- accurate
- distortion-free
- free from random text
- free from text artifacts
- free from duplicate objects
- free from watermarks
- free from logos

Do not crop important objects.

==================================
EDUCATIONAL ACCURACY
==================================

Visual creativity must NEVER change the
meaning of the supplied concept.

For subject-specific concepts:

- preserve mathematical accuracy
- preserve scientific accuracy
- follow the supplied Image Prompt exactly
- do not introduce facts from another subject

==================================
FINAL CHECK
==================================

✓ One tiny learning concept
✓ One connected story moment
✓ Maximum 3 important objects
✓ Child friendly
✓ Educational
✓ Story-like
✓ Visually interesting
✓ No invented facts
✓ No unrelated objects
✓ No collage
✓ No infographic
✓ Very little text
✓ Full 16:9 frame
✓ No white margins
✓ Clear visual hierarchy
✓ Ready for educational YouTube video

`;


    // ==================================================
    // MATHEMATICS RULES
    // ONLY FOR MATHEMATICS
    // ==================================================

    const mathematicsRules = `

==================================
MATHEMATICS-SPECIFIC RULES
==================================

This is a Mathematics lesson.

Use mathematical textbook accuracy.

Do not introduce concepts from another
subject.

Do not add unrelated real-world examples.

==================================
MATHEMATICAL NOTATION
==================================

If an equation or mathematical expression
is supplied:

KEEP IT EXACTLY.

Never rewrite mathematical notation
into spoken English.

Do not convert:

x²

into:

x square

Do not convert:

√2

into:

square root of two

Do not convert:

3x

into:

three x

Do not change mathematical symbols.

Do not change:

fractions

equations

coordinates

angles

units

variables

indices

powers

mathematical operators

==================================
MATH STORYTELLING
==================================

Mathematical storytelling should show
the learner discovering the mathematical
idea step by step.

Prefer:

question
→ observation
→ calculation
→ relationship
→ conclusion

when supported by the concept.

The story must never introduce a new
mathematical example.

Use only the numbers and relationships
provided in the concept.

==================================
MATHEMATICAL DIAGRAMS
==================================

If the scene is a mathematical diagram,
accuracy is more important than artistic beauty.

Treat the imagePrompt as a technical
drawing specification.

Do NOT redesign the diagram.

Do NOT invent objects.

Do NOT approximate quantities.

Do NOT change orientation.

Do NOT rotate.

Do NOT mirror.

Do NOT rearrange.

Do NOT change spacing.

Do NOT change mathematical structure.

Draw exactly the stated:

- rows
- columns
- dots
- lines
- angles
- shapes
- blocks
- partitions
- labels

If a specific number of objects is given,
draw exactly that number.

For grids:

If the prompt says 6 × 6,
draw exactly 6 rows and 6 columns.

Do not add extra cells.

For highlighted mathematical groups:

Highlight ONLY the specified objects.

Do not highlight extra cells.

Do not extend boundaries.

Do not invent partitions.

For technical diagrams:

Use clean textbook-style drawing.

Accuracy is more important than decoration.

==================================
MATH DIAGRAM VISUAL STYLE
==================================

Use:

- clean textbook diagram
- precise geometry
- readable symbols
- thin clean lines
- accurate spacing

Avoid:

- cartoon characters
- decorative objects
- unnecessary classroom scenes
- random props
- artistic distortion

If the prompt requires a technical diagram,
follow it exactly.

// ==================================
// PROTRACTOR / ANGLE DIAGRAM RULES
// ==================================

If the mathematical diagram contains a protractor,
angle measurement, angle construction, or angle reading,
follow these rules STRICTLY.

PROTRACTOR STRUCTURE:

- Use a standard 180-degree semicircular protractor.
- The protractor must have exactly ONE center/vertex point.
- The straight baseline must pass exactly through the
  center/vertex point.
- The 90-degree mark must be exactly at the top center.
- Keep the protractor horizontally aligned unless the
  supplied Image Prompt explicitly requires another
  orientation.

PROTRACTOR NUMBER SCALES:

- The two number scales must run in opposite directions.
- The scale must contain the mathematically correct
  sequence from 0 to 180 degrees.
- Use:
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90,
  100, 110, 120, 130, 140, 150, 160, 170, 180.
- Do NOT duplicate any number.
- Do NOT omit any number.
- Do NOT change the order of numbers.
- Do NOT invent numbers.
- Do NOT mirror only one side of the scale.
- Do NOT place the same value twice where it should
  appear only once on a scale.

ANGLE MEASUREMENT:

- The actual geometric angle must match the supplied
  angle value exactly.
- Never approximate the angle.
- If the required angle is 116 degrees, the two rays
  must form exactly 116 degrees.
- Do NOT draw 115, 117, 120, or any approximate angle
  when the required value is 116 degrees.
- The angle arc must connect the exact two rays forming
  the angle.
- The displayed angle value must match the actual
  geometric angle.

CORRECT SCALE SELECTION:

- Start reading from 0 degrees on the scale located
  at the same side as the starting ray.
- Use the correct scale according to the direction
  of the starting ray.
- Do NOT accidentally read the opposite scale.
- Do NOT mix the inner scale and outer scale.
- The selected scale must correspond to the actual
  geometric angle.

GEOMETRIC ALIGNMENT:

- The vertex of the angle must be exactly at the
  center point of the protractor.
- The starting ray must lie exactly along the
  protractor baseline when required.
- The second ray must pass through the exact
  requested degree mark.
- The angle arc, rays, vertex and degree marking
  must all agree.
- Do NOT draw the ray at one angle and label it
  with another angle.
- Do NOT rotate the protractor independently from
  the angle.

PROTRACTOR ACCURACY HAS PRIORITY OVER ARTISTIC STYLE.

Do NOT beautify, stylize, distort, rotate, mirror,
or redesign a mathematical protractor diagram.

Mathematical correctness is more important than
visual creativity.

==================================
MATH SCENE RANDOMIZATION
==================================

For normal mathematical illustrations:

Visual variation is allowed.

For technical mathematical diagrams:

DO NOT randomize:

- mathematical structure
- object position
- orientation
- number of objects
- diagram relationships
- proportions

Accuracy always wins.
`;


    // ==================================================
    // SCIENCE RULES
    // ONLY FOR SCIENCE
    // ==================================================

    const scienceRules = `

==================================
SCIENCE-SPECIFIC RULES
==================================

This is a Science educational lesson.

Use scientifically accurate educational
visuals.

The visual style must be suitable for
school students from Class 1 to Class 12.

Do not introduce mathematical concepts
unless mathematics is explicitly part
of the supplied Science concept.

Do not introduce unrelated facts.

Use only the supplied concept.

==================================
SCIENCE VISUAL STORYTELLING
==================================

Science scenes should feel like a child
is discovering how the world works.

Prefer visual storytelling such as:

observe
→ investigate
→ discover
→ understand
→ connect

Example structure:

A student observes a natural phenomenon.

Then the next scene shows the relevant
scientific process.

Then the next scene shows the result.

Then the final scene helps the student
understand the scientific idea.

IMPORTANT:

This is storytelling through visuals.

Do NOT invent fictional scientific events.

Do NOT add unsupported facts.

Do NOT create unrelated experiments.

Do NOT add extra scientific objects.

==================================
SCIENCE ART STYLE
==================================

Prefer:

- modern educational illustration
- clean textbook illustration
- polished 2D educational artwork
- simplified educational 3D artwork
- scientific diagram style when needed

The visual should feel like a high-quality
school learning video.

Avoid photorealistic photography unless
the supplied concept specifically requires
a real-world visual and the image system
can represent it safely and educationally.

For most Science lessons prefer
illustrated educational visuals.

==================================
HUMAN FIGURE RULES
==================================

IMPORTANT:

Do NOT create photorealistic photographs
of boys or girls for ordinary educational
scenes.

When a human figure is needed:

Use:

- simple educational cartoon character
- clean 2D textbook character
- simplified 3D educational character
- neutral school-appropriate character

The character should look like a generic
educational illustration.

Do NOT make the character look like a
real identifiable person.

Do NOT emphasize:

- beauty
- fashion
- body attractiveness
- realistic skin details
- celebrity appearance

Use simple, age-appropriate clothing.

The character exists only to demonstrate
the scientific concept.

==================================
HUMAN BODY / ANATOMY
==================================

For human-body concepts:

Use a clean educational medical-textbook
illustration.

Do NOT use realistic photographs.

Do NOT create graphic medical imagery.

Do NOT show:

- blood
- wounds
- injuries
- surgery
- graphic internal organs
- disturbing body details

Show only the body system or organ required
by the concept.

Examples:

digestive system
respiratory system
circulatory system
skeletal system
nervous system
muscular system
sense organs
cells

Use simplified educational anatomy.

If a whole human body is unnecessary,
show only the relevant body area.

Use clear labels only when necessary.

Maximum 1–2 word labels.

==================================
CELLS AND MICROSCOPIC LIFE
==================================

For cells and microscopic concepts:

Use a clean scientific educational
illustration.

Show the required structures clearly.

Examples:

- cell membrane
- nucleus
- cytoplasm
- chloroplast
- mitochondria
- microorganisms

Do not add unrelated organelles.

Do not turn a scientific diagram into
a decorative fantasy image.

Use a clear microscopic visual style.

If the concept describes a process,
show the process visually.

==================================
PLANT RULES
==================================

For plants:

Use educational botanical illustration.

Show only the plant structures relevant
to the supplied concept.

Possible structures include:

- root
- stem
- leaf
- flower
- fruit
- seed
- pollen

Keep the plant scientifically recognizable.

For plant processes:

Show the process visually.

Examples include:

- water movement
- photosynthesis
- germination
- pollination
- reproduction

Do not add unrelated plants.

Do not create a decorative garden unless
the concept requires it.

Do not turn the image into a landscape
when the actual concept is a plant structure.

==================================
ANIMAL RULES
==================================

For animal-related concepts:

Use educational animal illustrations.

Animals should be recognizable and
scientifically appropriate.

Avoid unnecessary groups of animals.

Show only the animals required by
the concept.

For:

habitat
adaptation
food chain
classification
movement
reproduction

show the relevant relationship clearly.

Do not add unrelated animals.

Do not make animals look frightening
unless the concept specifically requires
their natural behavior.

==================================
MICROORGANISMS
==================================

For bacteria, fungi, viruses or other
microorganisms:

Use scientific educational illustration.

Prefer microscope-inspired visuals.

Keep structures simplified enough for
school students.

Do not create horror-style microorganisms.

Do not make them scary.

Do not add fictional features.

Show only scientifically relevant
structures.

==================================
CHEMISTRY RULES
==================================

For Chemistry concepts:

Use clean scientific educational visuals.

Suitable visual styles include:

- laboratory illustration
- molecular model
- atom model
- reaction diagram
- beaker/flask illustration
- particle-level illustration

Do not add unnecessary laboratory equipment.

Use only the apparatus relevant to
the supplied concept.

If chemical symbols or equations are
provided, preserve them exactly.

Do not invent chemical formulas.

Do not change element symbols.

Do not invent reaction products.

For particles:

Show particles clearly and consistently.

Use simple visual distinctions for
different particles when needed.

Do not make molecular diagrams
decorative.

==================================
PHYSICS RULES
==================================

For Physics concepts:

Show the physical phenomenon clearly.

Possible concepts include:

- force
- motion
- speed
- acceleration
- gravity
- friction
- pressure
- energy
- heat
- light
- sound
- electricity
- magnetism

Use visual cause-and-effect.

For example:

object
→ force
→ movement

when that relationship is present
in the supplied concept.

Do not invent forces or measurements.

If vectors or arrows are explicitly
required, show them clearly.

Do not add unnecessary arrows.

==================================
ELECTRICITY AND CIRCUITS
==================================

For circuit concepts:

Use clean educational circuit diagrams
or classroom-style scientific illustrations.

Show only the components required.

Examples:

- cell
- battery
- wire
- switch
- bulb
- resistor

Keep circuit connections accurate.

Do not create random wires.

Do not add decorative electricity effects.

Do not change the supplied circuit structure.

==================================
LIGHT AND OPTICS
==================================

For light concepts:

Show the actual light path clearly.

Use accurate:

- rays
- reflection
- refraction
- mirrors
- lenses
- shadows

Do not add random rays.

Do not create decorative glowing effects
that make the scientific relationship unclear.

==================================
EARTH AND ENVIRONMENT
==================================

For Earth and Environmental Science:

Use realistic but educationally simplified
natural environments.

Possible environments:

- forest
- river
- ocean
- mountain
- soil
- atmosphere
- ecosystem
- city
- village

Show environmental relationships clearly.

For:

water cycle
food chain
ecosystem
pollution
soil
climate
weather

show the relevant process or relationship.

Do not combine multiple environmental
processes unless the supplied concept
requires them.

==================================
SPACE AND ASTRONOMY
==================================

For astronomy:

Use scientifically educational space visuals.

Suitable visuals:

- Sun
- Moon
- planets
- stars
- Solar System
- eclipses
- orbit
- gravity

Do not add fantasy spacecraft unless
the concept specifically requires one.

Do not add fictional planets.

Keep relative scientific relationships
clear when relevant.

Use a beautiful educational space style,
but accuracy comes first.

==================================
GENETICS AND EVOLUTION
==================================

For genetics:

Use simplified scientific educational
visuals for:

- DNA
- genes
- chromosomes
- heredity
- traits
- variation

Do not create realistic biological
imagery when a clean diagram is better.

Use simplified textbook-style structures.

Do not invent genetic information.

For evolution:

Show only the evolutionary relationship
supported by the supplied concept.

Do not create fictional evolutionary stages.

==================================
SCIENCE DIAGRAM RULES
==================================

If the Science concept requires a diagram:

Treat it as an educational scientific
diagram.

Accuracy is more important than decoration.

Do not redesign scientific structures.

Do not add unrelated labels.

Do not add unnecessary objects.

Do not randomly change:

- number of parts
- structure
- relationships
- direction
- sequence
- labels

If the concept specifies exact parts,
show exactly those parts.

Use clean textbook-style scientific
illustration.

==================================
SCIENCE EXPERIMENT RULES
==================================

For experiments:

Show only the apparatus required
by the supplied concept.

Use clean educational laboratory
illustration.

Do not create dangerous or graphic
situations.

Do not add chemicals or equipment
not mentioned in the concept.

Show the cause-and-effect relationship
clearly.

The experiment should feel like a
simple educational story:

setup
→ action
→ observation
→ result

ONLY when those stages are supported
by the supplied concept.

==================================
SCIENCE STORY CONTINUITY
==================================

When several scenes belong to the same
scientific process:

Keep visual continuity.

For example:

Scene 1:
introduce the object.

Scene 2:
show the scientific action.

Scene 3:
show the resulting change.

Scene 4:
show what the change means.

Do not reset the visual world randomly
between every scene.

However, do not repeat identical images.

The child should feel that the science
story is progressing.

==================================
SCIENCE SAFETY
==================================

Keep all Science visuals:

- educational
- age appropriate
- non-graphic
- non-disturbing
- school appropriate

Avoid:

- gore
- wounds
- graphic anatomy
- frightening medical imagery
- horror-style microorganisms
- scary realistic human faces
- inappropriate body emphasis

Use clean textbook-style educational
visualization.

==================================
SCIENCE FINAL CHECK
==================================

✓ Scientifically appropriate
✓ One concept
✓ One visual story moment
✓ Child friendly
✓ Educational
✓ Cartoon/textbook style where humans are needed
✓ No photorealistic student portraits
✓ No unnecessary boys/girls
✓ No graphic anatomy
✓ No blood
✓ No horror imagery
✓ Plants visually accurate
✓ Animals visually appropriate
✓ Cells visually clear
✓ Chemistry visually accurate
✓ Physics relationships clear
✓ Environment relevant
✓ Space visuals educational
✓ Maximum 3 important objects
✓ No unrelated facts
✓ No invented examples
✓ No collage
✓ No infographic
✓ 16:9
✓ Full frame
✓ Ready for educational YouTube video
`;


    // ==================================================
    // MATHEMATICS CONDITION
    // ==================================================

    if (
        normalizedSubject === "mathematics" ||
        normalizedSubject === "math" ||
        normalizedSubject === "maths"
    ) {

        console.log(
            "Image Prompt Subject: Mathematics"
        );

        return `
${commonRules}

${mathematicsRules}
`;
    }


    // ==================================================
    // SCIENCE CONDITION
    // ==================================================

    if (
        normalizedSubject === "science"
    ) {

        console.log(
            "Image Prompt Subject: Science"
        );

        return `
${commonRules}

${scienceRules}
`;
    }


    // ==================================================
    // UNKNOWN / OTHER SUBJECT
    // ==================================================

    console.log(
        `Image Prompt Subject: ${subject}`
    );

    return `
${commonRules}
`;
}


// ==================================================
// EXPORT
// ==================================================

export default getImagePromptRules;