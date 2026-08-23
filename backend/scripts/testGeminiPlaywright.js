import { generateNarrationPlaywright } from "./playwright/generateNarration.js";

const result = await generateNarrationPlaywright(`
this is very large prompt. ${"Hello ".repeat(5000)}
`, 1);

console.log("Final Result:", result);