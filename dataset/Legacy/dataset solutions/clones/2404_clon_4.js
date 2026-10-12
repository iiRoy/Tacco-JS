"use strict";
const createInputProcessor = (rawInputContent) => {
  const allLines = rawInputContent.trim().split('\n');
  let currentLineIdx = 0;
  let lineBufferTokens = [];

  const retrieveNextToken = (returnAsString) => {
    while (lineBufferTokens.length === 0 && currentLineIdx < allLines.length) {
      lineBufferTokens = allLines[currentLineIdx++].split(' ');
    }
    if (lineBufferTokens.length === 0) {
      return undefined;
    }
    const tokenValue = lineBufferTokens.shift();
    return returnAsString ? tokenValue : Number(tokenValue);
  };

  const extractFullLineTokens = (returnAsString) => {
    if (currentLineIdx >= allLines.length) return [];
    const lineContent = allLines[currentLineIdx++];
    const tokensOnLine = lineContent.split(' ');
    return returnAsString ? tokensOnLine : tokensOnLine.map(Number);
  };

  const gatherMultiLineTokens = (numberOfRows, returnAsString) => {
    const collectedRows = [];
    for (let rowCounter = 0; rowCounter < numberOfRows; rowCounter++) {
      collectedRows.push(extractFullLineTokens(returnAsString));
    }
    return collectedRows;
  };

  const collectRawLines = (numberOfRows, returnAsString) => {
    const collectedLines = [];
    for (let rowCounter = 0; rowCounter < numberOfRows; rowCounter++) {
      if (currentLineIdx >= allLines.length) break;
      const lineContent = allLines[currentLineIdx++];
      collectedLines.push(returnAsString ? lineContent : Number(lineContent));
    }
    return collectedLines;
  };

  return {
    pullValue: (isString) => retrieveNextToken(isString),
    extractLine: (isString) => extractFullLineTokens(isString),
    gatherMatrix: (rows, isString) => gatherMultiLineTokens(rows, isString),
    collectLines: (rows, isString) => collectRawLines(rows, isString),
  };
};

const inputProcessor = createInputProcessor(require("fs").readFileSync("/dev/stdin","utf8"));

function generateMultiDimArray(fillValue, ...dimensions) {
  const createNestedArray = (remainingDimensions) => {
    if (remainingDimensions.length === 0) {
      return fillValue;
    }
    const currentDimensionSize = remainingDimensions[0];
    const nextDimensions = remainingDimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () => createNestedArray(nextDimensions));
  };
  return createNestedArray(dimensions);
}

console.log(processJumps());

function processJumps() {
  const totalLength = inputProcessor.pullValue();
  const maxStep = inputProcessor.pullValue();
  const pathString = inputProcessor.pullValue(true);

  const zeroPositions = [];
  for (let currentIdx = totalLength - 1; currentIdx >= 0; --currentIdx) {
    if (pathString[currentIdx] === '0') {
      zeroPositions.push(currentIdx);
    }
  }

  const jumpDistances = [];
  let currentLoc = totalLength;
  let zeroPointer = 0;

  while (currentLoc > 0 && zeroPointer < zeroPositions.length) {
    let bestReachableZero = -1;
    let nextTargetIndex = -1;

    for (let k = zeroPointer; k < zeroPositions.length; k++) {
      const potentialLanding = zeroPositions[k];
      const distanceToPotential = currentLoc - potentialLanding;

      if (distanceToPotential <= maxStep) {
        bestReachableZero = potentialLanding;
        nextTargetIndex = k;
      } else {
        break;
      }
    }

    if (bestReachableZero === -1) {
      return -1;
    }

    jumpDistances.push(currentLoc - bestReachableZero);
    currentLoc = bestReachableZero;
    zeroPointer = nextTargetIndex + 1;
  }

  return jumpDistances.reverse().join(" ");
}
