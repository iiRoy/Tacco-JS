'use strict';

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const charSequence = fileContent.split("");

const charFrequencies = charSequence.reduce((accumulator, currentCharacter) => {
  accumulator[currentCharacter] = (accumulator[currentCharacter] || 0) + 1;
  return accumulator;
}, {});

let finalVerdict = "Yes";

const hasOddCount = Object.values(charFrequencies).some(occurrenceCount => {
  return occurrenceCount % 2 !== 0;
});

if (hasOddCount) {
  finalVerdict = "No";
}

console.log(finalVerdict);
