"use strict";

const findPathLength = (currentPos, stepsTaken, limitSteps, sequenceData, visitedPath) => {
  if (currentPos === 2) {
    return stepsTaken;
  }

  if (stepsTaken > limitSteps) {
    return -1;
  }

  if (visitedPath.has(currentPos)) {
    return -1;
  }

  visitedPath.add(currentPos);

  const nextPosInSequence = sequenceData[currentPos - 1];

  if (nextPosInSequence === undefined) {
    return -1;
  }

  return findPathLength(nextPosInSequence, stepsTaken + 1, limitSteps, sequenceData, visitedPath);
};

const processInput = inputContent => {
  const inputLines = inputContent.split("\n");
  const totalEntries = Number(inputLines[0]);
  const sequenceArray = inputLines.slice(1, totalEntries + 1).map(Number);

  const finalResult = findPathLength(1, 0, totalEntries, sequenceArray, new Set());
  console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
