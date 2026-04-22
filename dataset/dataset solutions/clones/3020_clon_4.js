'use strict'

const acquireInputData = () => {
  const allSourceLines = require("fs").readFileSync("/dev/stdin", "utf8").split('\n');
  const numericParam = parseInt(allSourceLines[0]);
  const characterSequence = allSourceLines[1];
  return { sequenceLength: numericParam, charArray: characterSequence };
};

const calculateMinimization = () => {
  const { sequenceLength: totalLength, charArray: initialSequence } = acquireInputData();
  
  let currentWorkingSequence = initialSequence;
  
  // First transformation: Eliminate leading '.' characters
  let firstMarkerIndex = -1;
  for (let position = 0; position < totalLength; ++position) {
    if (currentWorkingSequence[position] === '#') {
      firstMarkerIndex = position;
      break;
    }
  }

  if (firstMarkerIndex === -1) {
    // If no '#' is found at all, the result is 0
    return 0;
  }
  
  currentWorkingSequence = currentWorkingSequence.substring(firstMarkerIndex);

  // Second transformation: Eliminate trailing '#' characters
  let effectiveEndPosition = currentWorkingSequence.length;
  for (let position = currentWorkingSequence.length - 1; position >= 0; --position) {
    if (currentWorkingSequence[position] === '.') {
      effectiveEndPosition = position + 1; // +1 because substring end is exclusive
      break;
    }
  }
  
  currentWorkingSequence = currentWorkingSequence.substring(0, effectiveEndPosition);

  // Count occurrences of each character in the processed sequence
  let sharpCount = 0;
  let periodCount = 0;
  for (let position = 0; position < currentWorkingSequence.length; ++position) {
    if (currentWorkingSequence[position] === '#') {
      sharpCount++;
    } else {
      periodCount++;
    }
  }

  // Determine the smaller of the two counts
  return sharpCount < periodCount ? sharpCount : periodCount;
};

const provideOutput = (finalValue) => {
  console.log(finalValue);
};

provideOutput(calculateMinimization());