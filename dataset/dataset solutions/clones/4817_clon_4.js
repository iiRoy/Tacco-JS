const fileSystem = require("fs");
const charRead = fileSystem.readFileSync("/dev/stdin", "utf8");

const vowelChecker = new Set(['a', 'e', 'i', 'o', 'u']);

console.log(vowelChecker.has(charRead) ? "vowel" : "consonant");
