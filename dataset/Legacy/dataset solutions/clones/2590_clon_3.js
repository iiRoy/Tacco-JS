function getMatchingPrefixCount(sequenceOne, sequenceTwo, comparisonLength) {
  let currentMatches = 0;
  for (let k = 0; k < comparisonLength; k++) {
    const charFromOne = sequenceOne[k];
    const charFromTwo = sequenceTwo[k];
    if (charFromOne === charFromTwo) {
      currentMatches++;
    }
  }
  return currentMatches;
}

function processInput(sourceData) {
  const inputLines = sourceData.split("\n");
  const firstStringSegment = inputLines[0];
  const secondStringSegment = inputLines[1];

  const firstCharSequence = Array.from(firstStringSegment);
  const secondCharSequence = Array.from(secondStringSegment);
  
  const prefixComparisonLimit = 3; 

  const matchingCharCount = getMatchingPrefixCount(
    firstCharSequence,
    secondCharSequence,
    prefixComparisonLimit
  );
  
  console.log(matchingCharCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
