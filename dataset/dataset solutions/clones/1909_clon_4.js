"use strict";

const fs = require("fs");

const rawInput = fs.readFileSync("/dev/stdin", "utf8");
const allLines = rawInput.trim().split("\n");

const headerParts = allLines[0].trim().split(" ").map(Number);
const numSteps = headerParts[0];
const initialAlpha = headerParts[1];
const initialBeta = headerParts[2];
const initialGamma = headerParts[3];

const operationStrings = allLines.slice(1, numSteps + 1);

const charToIndexMap = { 'A': 0, 'B': 1, 'C': 2 };

let solutionPath = null;
const processingQueue = [];

processingQueue.push({
  currentCounts: [initialAlpha, initialBeta, initialGamma],
  currentPath: []
});

while (processingQueue.length > 0) {
  const { currentCounts, currentPath } = processingQueue.shift();

  const currentProgress = currentPath.length;
  if (currentProgress === numSteps) {
    solutionPath = currentPath;
    break;
  }

  const currentOperationPair = operationStrings[currentProgress];
  const firstChar = currentOperationPair[0];
  const secondChar = currentOperationPair[1];

  const firstIdx = charToIndexMap[firstChar];
  const secondIdx = charToIndexMap[secondChar];

  if (currentCounts[firstIdx] > 0) {
    const nextCountsOption1 = [...currentCounts];
    nextCountsOption1[firstIdx]--;
    nextCountsOption1[secondIdx]++;
    const nextPathOption1 = [...currentPath, secondChar];
    processingQueue.push({ currentCounts: nextCountsOption1, currentPath: nextPathOption1 });
  }

  if (currentCounts[secondIdx] > 0) {
    const nextCountsOption2 = [...currentCounts];
    nextCountsOption2[secondIdx]--;
    nextCountsOption2[firstIdx]++;
    const nextPathOption2 = [...currentPath, secondChar];
    processingQueue.push({ currentCounts: nextCountsOption2, currentPath: nextPathOption2 });
  }
}

if (solutionPath) {
  console.log("Yes");
  console.log(solutionPath.join("\n"));
} else {
  console.log("No");
}
