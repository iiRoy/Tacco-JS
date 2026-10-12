'use strict'

function ProcessInput(rawData) {
  const lines = rawData.split('\n');
  const barLengthStrings = lines[1].split(' ');
  const numericBarLengths = barLengthStrings.map(Number);

  numericBarLengths.sort((a, b) => b - a); // Sort in descending order

  const lengthFrequencyMap = new Map();
  for (const lengthValue of numericBarLengths) {
    lengthFrequencyMap.set(lengthValue, (lengthFrequencyMap.get(lengthValue) || 0) + 1);
  }

  const uniqueSortedLengths = Array.from(lengthFrequencyMap.keys()).sort((a, b) => b - a);

  const rectangleDimensions = [];
  const requiredSidesCount = 2;

  for (const currentLengthCandidate of uniqueSortedLengths) {
    const currentLengthCount = lengthFrequencyMap.get(currentLengthCandidate);

    if (currentLengthCount >= 4) {
      rectangleDimensions.push(currentLengthCandidate);
      rectangleDimensions.push(currentLengthCandidate);
      break;
    } else if (currentLengthCount >= 2) {
      rectangleDimensions.push(currentLengthCandidate);
    }

    if (rectangleDimensions.length === requiredSidesCount) {
      break;
    }
  }

  if (rectangleDimensions.length === requiredSidesCount) {
    console.log(rectangleDimensions[0] * rectangleDimensions[1]);
  } else {
    console.log(0);
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
