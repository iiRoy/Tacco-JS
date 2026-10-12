'use strict';

const fileContentBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
const inputCharacters = fileContentBuffer.split("");

let finalVerdict = "Yes";

const checkOddParity = (numericValue) => {
  return numericValue % 2 !== 0;
};

const characterOccurrenceMap = new Map();

for (const singleChar of inputCharacters) {
  const currentCount = characterOccurrenceMap.get(singleChar) || 0;
  characterOccurrenceMap.set(singleChar, currentCount + 1);
}

for (const [charKey, charCount] of characterOccurrenceMap.entries()) {
  if (checkOddParity(charCount)) {
    finalVerdict = "No";
    break;
  }
}

console.log(finalVerdict);
