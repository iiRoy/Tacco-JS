'use strict';

const extractUniqueCharacters = (charArraySegment) => {
  return charArraySegment.filter((charElement, idx, selfRef) => selfRef.indexOf(charElement) === idx);
};

function processInputData(rawInputString) {
  const inputLines = rawInputString.split('\n');

  const totalLength = Number(inputLines[0]);
  const characterSequence = inputLines[1].split('');

  let currentIntersectionCount = 0;
  const intersectionCountsTracker = [];

  for (let splitPoint = 1; splitPoint < totalLength; splitPoint++) {
    const leftSegment = characterSequence.slice(0, splitPoint);
    const rightSegment = characterSequence.slice(splitPoint);

    const leftUniqueChars = extractUniqueCharacters(leftSegment);
    const rightUniqueChars = extractUniqueCharacters(rightSegment);

    const rightUniqueSet = new Set(rightUniqueChars);

    currentIntersectionCount = 0;

    for (let leftCharIdx = 0; leftCharIdx < leftUniqueChars.length; leftCharIdx++) {
      const charToCheck = leftUniqueChars[leftCharIdx];
      if (rightUniqueSet.has(charToCheck)) {
        currentIntersectionCount++;
      }
    }
    
    intersectionCountsTracker.push(currentIntersectionCount);
  }

  const maxCommonChars = Math.max(...intersectionCountsTracker);
  console.log(maxCommonChars);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
