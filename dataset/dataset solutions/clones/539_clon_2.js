const fileSystemModule = require('fs');

let rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputContent
  .trim()
  .split("\n");

let elementCount = processedLines.shift() | 0;

const originalSequence = processedLines
  .shift()
  .split(" ")
  .map(Number);

const orderedSequence = originalSequence
  .slice()
  .sort((firstVal, secondVal) => firstVal - secondVal);

let numberOfOperations = processedLines.shift() | 0;

const swapOperationIndices = processedLines.map(
  (singleLine) =>
    singleLine
      .split(" ")
      .map(Number)
      .map((valToAdjust) => valToAdjust - 1)
);

swapOperationIndices.unshift([0, 0]);

let currentMismatchValues = {};
let targetMismatchValues = {};

for (let idx = 0; idx < originalSequence.length; ++idx) {
  if (originalSequence[idx] !== orderedSequence[idx]) {
    currentMismatchValues[idx] = originalSequence[idx];
    targetMismatchValues[idx] = orderedSequence[idx];
  }
}

let targetMismatchString = "";
for (const mismatchKey in targetMismatchValues) {
  targetMismatchString += targetMismatchValues[mismatchKey];
}

let isTargetAchieved = false;

for (let opIter = 0; opIter <= numberOfOperations; ++opIter) {
  [
    currentMismatchValues[swapOperationIndices[opIter][0]],
    currentMismatchValues[swapOperationIndices[opIter][1]],
  ] = [
    currentMismatchValues[swapOperationIndices[opIter][1]],
    currentMismatchValues[swapOperationIndices[opIter][0]],
  ];

  let currentMismatchString = "";
  for (const keyPosition in currentMismatchValues) {
    currentMismatchString += currentMismatchValues[keyPosition];
  }

  if (currentMismatchString === targetMismatchString) {
    isTargetAchieved = true;
    console.log(opIter);
    break;
  }
}

if (!isTargetAchieved) {
  console.log(-1);
}