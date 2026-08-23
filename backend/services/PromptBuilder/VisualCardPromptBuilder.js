class VisualCardPromptBuilder {

    static async build(tutorial) {

        return `

You are creating storyboard cards for an educational animation.

Your ONLY job is to decide where a NEW IMAGE is required.

Do NOT write narration.

Do NOT explain.

Do NOT summarize.

Do NOT use outside knowledge.

Use ONLY the textbook.

====================================
RULE
====================================

Whenever the picture on screen must change,

create a NEW Visual Card.

One Visual Card = One Image.

Never merge two different images into one card.

====================================
WHEN TO CREATE A NEW CARD
====================================

Create a new card whenever the textbook introduces:

- a new object
- a new organism
- a new person
- a new body part
- a new process
- a new action
- a new comparison
- a new scientific fact
- a new mathematical step
- a new diagram
- a new observation
- a new relationship

Even if all of these appear in ONE sentence,
create multiple cards.

Also create a new Visual Card whenever:

- the student performs a new action
- the teacher asks students to observe something
- the observation changes
- the viewpoint changes
- the result of the activity becomes visible

====================================
VERY IMPORTANT
====================================

Think like an animation storyboard artist.

If the camera would change,

create a new card.

If the drawing changes,

create a new card.

If students need another illustration,

create a new card.

There is NO LIMIT on number of cards.

Prefer MANY cards over FEW cards.

====================================
ACTIVITY STORYBOARD RULES
====================================

If the supplied textbook is an Activity, create storyboard cards like a classroom demonstration.

Do not simply convert each sentence into one card.

Instead, think like a science teacher performing the activity.

Generate cards for:

1. Activity introduction

2. Materials required (if mentioned or clearly implied)

3. Every student action

4. Every observation

5. Every comparison

6. Final observation

7. Final conclusion (only if directly supported by the activity)

Example

Observe Amoeba.

↓

Card

Observe Normal Amoeba

Observe another Amoeba showing binary fission.

↓

Card

Observe Binary Fission

Compare both slides.

↓

Card

Compare Slides

Notice the difference.

↓

Card

Observe Difference

Binary fission can be seen.

↓

Card

Activity Conclusion

Do not skip observation cards.

Do not skip comparison cards.

Activities usually require more cards than theory.

====================================
OUTPUT

{
  "cards":[
    {
      "id":1,
      "displayText":""
    }
  ]
}

====================================
TEXTBOOK

${tutorial.content}

Return ONLY valid JSON.

`;

    }

}

export default VisualCardPromptBuilder;