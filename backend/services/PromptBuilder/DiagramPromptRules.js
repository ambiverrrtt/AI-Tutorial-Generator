const DiagramPromptRules = (
    subject = "",
    sceneType = ""
) => {

    const normalizedSubject =
        String(subject || "")
            .trim()
            .toLowerCase();


    // ==========================================
    // MATHEMATICS DIAGRAM
    // ==========================================

    if (
        normalizedSubject === "mathematics" ||
        normalizedSubject === "math" ||
        normalizedSubject === "maths"
    ) {

        return `

THIS IS A MATHEMATICAL TEXTBOOK DIAGRAM.

This is NOT a normal illustration.

Draw exactly what is described.

MATHEMATICS DIAGRAM RULES:

- Follow the imagePrompt exactly.
- Do not redesign the diagram.
- Do not beautify the diagram.
- Keep exact mathematical structure.
- Keep exact rows and columns.
- Keep exact number of dots.
- Keep exact L-shaped partitions.
- Keep exact mathematical relationships.
- Keep exact number of shapes.
- Keep exact number of objects.
- Do not add mathematical objects.
- Do not remove mathematical objects.
- Do not change mathematical values.

VISUAL STYLE:

- Clean NCERT-style textbook figure.
- White background.
- Thin black lines.
- Black dots.
- Simple mathematical shapes.
- Use colors ONLY when highlighting is explicitly required.
- No cartoon characters.
- No smiling children.
- No classroom.
- No decorative objects.
- No unnecessary labels.

ACCURACY IS MORE IMPORTANT THAN ARTISTIC STYLE.

Do not change:
- orientation
- proportions
- spacing
- number of objects
- rows
- columns
- partitions
- mathematical relationships

If the imagePrompt specifies an exact
mathematical structure, reproduce it exactly.

`;
    }


    // ==========================================
    // SCIENCE DIAGRAM
    // ==========================================

    if (
        normalizedSubject === "science"
    ) {

        return `

THIS IS A SCIENCE EDUCATIONAL DIAGRAM.

This is NOT a mathematical diagram.

Follow the imagePrompt exactly.

SCIENCE DIAGRAM RULES:

- Keep the scientific structure accurate.
- Do not redesign the scientific concept.
- Do not add unrelated objects.
- Do not remove required scientific parts.
- Keep the correct relationships between parts.
- Keep the correct direction of processes.
- Keep the correct sequence when a process is shown.
- Use only structures mentioned in the imagePrompt.

VISUAL STYLE:

- Clean school textbook-style scientific illustration.
- Simple educational artwork.
- Clear scientific structure.
- Bright but controlled colors.
- Easy for school students to understand.
- Professional educational YouTube style.

Do NOT use:
- mathematical grid rules
- L-shaped mathematical partitions
- random dots
- mathematical diagram styling
- unrelated equations

==================================
SCIENCE HUMAN BODY DIAGRAMS
==================================

If the concept is about the human body:

- Use simplified educational anatomy.
- Do not use a realistic human photograph.
- Use a clean textbook-style illustration.
- Show only the required body part/system.
- Keep the anatomy scientifically appropriate.
- No blood.
- No wounds.
- No surgery.
- No graphic medical details.
- No unnecessary body details.

If a human figure is needed,
use a generic educational cartoon/textbook character.

==================================
PLANT DIAGRAMS
==================================

For plant concepts:

- Use a clean botanical educational illustration.
- Show only the required plant structures.
- Keep roots, stem, leaves, flowers, seeds, etc. accurate.
- Do not add decorative plants.
- Do not turn the diagram into a landscape.
- Do not add unrelated plant parts.

==================================
CELL DIAGRAMS
==================================

For cell concepts:

- Show only the required cell structures.
- Keep organelles visually distinct.
- Use clean textbook-style structure.
- Do not add unrelated organelles.
- Do not make the cell look like fantasy artwork.

==================================
PHYSICS DIAGRAMS
==================================

For Physics:

- Keep physical relationships accurate.
- Keep arrows and directions correct.
- Keep rays accurate when required.
- Keep forces accurate when required.
- Do not add unnecessary arrows.
- Do not invent measurements.
- Do not change the supplied structure.

For circuits:

- Keep the exact circuit connections.
- Do not add random wires.
- Do not add unnecessary components.

==================================
CHEMISTRY DIAGRAMS
==================================

For Chemistry:

- Keep atoms, molecules and particles clear.
- Preserve chemical symbols exactly.
- Do not invent chemical formulas.
- Do not invent reaction products.
- Keep the supplied chemical relationship accurate.

==================================
FINAL SCIENCE CHECK
==================================

✓ Scientifically accurate
✓ One concept
✓ One diagram
✓ Only required structures
✓ No unrelated objects
✓ No photorealistic humans
✓ No graphic anatomy
✓ No mathematical diagram rules
✓ Clean educational style
✓ Suitable for school students
✓ Suitable for educational YouTube video

`;
    }


    // ==========================================
    // OTHER SUBJECT
    // ==========================================

    return `

EDUCATIONAL DIAGRAM.

Follow the imagePrompt exactly.

Use a clean textbook-style educational
illustration.

Do not add unrelated objects.

Keep the supplied structure accurate.

Do not create a collage.

Do not create an infographic.

`;
};


export default DiagramPromptRules;