'use strict';

function processInput(rawData) {
  const inputLines = rawData.split('\n');
  inputLines.pop(); // Remove the last empty line if present

  for (const currentLine of inputLines) {
    const {
      rangeFactor,
      centerValue
    } = parseLineParameters(currentLine);
    generateAndPrintRange(rangeFactor, centerValue);
  }
}

function parseLineParameters(lineString) {
  const parts = lineString.split(' ');
  const factor = parseInt(parts[0], 10);
  const center = parseInt(parts[1], 10);
  return {
    rangeFactor: factor,
    centerValue: center
  };
}

function generateAndPrintRange(rangeFactor, centerValue) {
  const offsetValue = rangeFactor - 1;
  const globalLowerBound = -1000000;
  const globalUpperBound = 1000000;

  let calculatedMin = centerValue - offsetValue;
  let calculatedMax = centerValue + offsetValue;

  // Apply boundary clamping using Math.max/min for conciseness
  calculatedMin = Math.max(calculatedMin, globalLowerBound);
  calculatedMax = Math.min(calculatedMax, globalUpperBound);

  for (let currentNumber = calculatedMin; currentNumber <= calculatedMax; currentNumber++) {
    console.log(currentNumber);
  }
}

// Entry point for the script
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
