const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split(/\n/);

const lineCount = inputLines.length;

let firstSequence = [];
let secondSequence = [];

let exactMatches;
let partialMatches;

for (let mainIndex = 0; mainIndex < lineCount; mainIndex += 2) {
  exactMatches = 0;
  partialMatches = 0;

  firstSequence = inputLines[mainIndex].trim().split(/\s/);
  secondSequence = inputLines[mainIndex + 1].trim().split(/\s/);

  for (let currentDigitIndex = 0; currentDigitIndex < 4; currentDigitIndex++) {
    if (firstSequence[currentDigitIndex] === secondSequence[currentDigitIndex]) {
      exactMatches++;
    } else {
      for (let comparisonIndex = 0; comparisonIndex < 4; comparisonIndex++) {
        if (firstSequence[currentDigitIndex] === secondSequence[comparisonIndex]) {
          partialMatches++;
        }
      }
    }
  }

  console.log(exactMatches + ' ' + partialMatches);
}
