let programInput = require("node:fs").readFileSync("/dev/stdin", "utf8");

const linesOfInput = programInput.split("\n");
const primaryString = linesOfInput[0];
const searchPattern = linesOfInput[1];

const primaryLength = primaryString.length;
const patternLength = searchPattern.length;
const maxPossibleOffset = primaryLength - patternLength;

const divergenceResults = [];

for (
  let currentWindowStart = 0, windowEnd = patternLength;
  currentWindowStart <= maxPossibleOffset;
  currentWindowStart++, windowEnd++
) {
  let currentSubstring = primaryString.slice(currentWindowStart, windowEnd);

  if (currentSubstring === searchPattern) {
    console.log(0);
    return;
  } else {
    let currentDivergence = 0;
    for (
      let characterIndex = 0, nextCharacterIndex = 1;
      characterIndex <= patternLength;
      nextCharacterIndex++, characterIndex++
    ) {
      let segmentCharacter = currentSubstring.slice(characterIndex, nextCharacterIndex);
      let patternCharacter = searchPattern.slice(characterIndex, nextCharacterIndex);

      if (segmentCharacter !== patternCharacter) {
        currentDivergence++;
      }
    }
    divergenceResults.push(currentDivergence);
  }
}
console.log(divergenceResults.reduce((val1, val2) => Math.min(val1, val2)));