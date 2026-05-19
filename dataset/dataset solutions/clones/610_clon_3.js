function checkLastCharMatch(targetCharacters, currentBoardString, spacingFactor) {
  const targetLength = targetCharacters.length;
  const boardLength = currentBoardString.length;

  if (targetLength === 0) {
    return false;
  }

  const lastCharIndexInTarget = targetLength - 1;
  const computedBoardIndex = lastCharIndexInTarget + spacingFactor * lastCharIndexInTarget;

  const isIndexWithinBounds = computedBoardIndex < boardLength;

  const doesLastCharMatch = isIndexWithinBounds && currentBoardString[computedBoardIndex] === targetCharacters[lastCharIndexInTarget];

  return doesLastCharMatch;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
  const inputLines = inputData.split("\n");

  const numCases = parseInt(inputLines[0], 10);

  const targetString = inputLines[1];
  const targetCharacters = Array.from(targetString);

  let totalMatchCount = 0;

  for (let caseIteration = 1; caseIteration <= numCases; caseIteration++) {
    const currentBoardString = inputLines[caseIteration];
    const boardLength = currentBoardString.length;

    let foundMatchForCurrentBoard = false;

    for (let spacingFactor = 0; spacingFactor < boardLength; spacingFactor++) {
      if (checkLastCharMatch(targetCharacters, currentBoardString, spacingFactor)) {
        foundMatchForCurrentBoard = true;
        break;
      }
    }

    if (foundMatchForCurrentBoard) {
      totalMatchCount++;
    }
  }

  console.log(totalMatchCount);
});
