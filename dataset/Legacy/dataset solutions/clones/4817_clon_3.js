const fileSystem = require("fs");

const inputCharacter = fileSystem.readFileSync("/dev/stdin", "utf8");

const VOWEL_IDENTIFIERS = "aeiou";

function checkIsVowel(charToEvaluate) {
  return VOWEL_IDENTIFIERS.includes(charToEvaluate);
}

let outputMessage;
if (checkIsVowel(inputCharacter)) {
  outputMessage = "vowel";
} else {
  outputMessage = "consonant";
}

console.log(outputMessage);
