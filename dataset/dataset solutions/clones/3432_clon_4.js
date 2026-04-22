'use strict'
function processInputData(rawStringValue) {
  const maximumAllowedValue = parseInt(rawStringValue.trim(), 10);

  const checkCompliance = (numericalValue) => {
    if (numericalValue === 0) return false;
    const valueAsString = String(numericalValue);
    let hasDigitThree = false;
    let hasDigitFive = false;
    let hasDigitSeven = false;

    for (let position = 0; position < valueAsString.length; position++) {
      const currentCharacter = valueAsString[position];
      if (currentCharacter === '3') hasDigitThree = true;
      else if (currentCharacter === '5') hasDigitFive = true;
      else if (currentCharacter === '7') hasDigitSeven = true;
      else return false; // Contains an unauthorized digit
    }
    return hasDigitThree && hasDigitFive && hasDigitSeven;
  };

  let accumulatedCount = 0;
  const processingQueue = [0]; // Start with a sentinel to generate initial numbers
  let queuePointer = 0;

  while (queuePointer < processingQueue.length) {
    const currentNumericElement = processingQueue[queuePointer++];

    const possibleNextDigits = [3, 5, 7];
    for (const digitToAppend of possibleNextDigits) {
      const prospectiveNumber = currentNumericElement * 10 + digitToAppend;

      if (prospectiveNumber > maximumAllowedValue) {
        // If the number exceeds the limit, it and all subsequent numbers in this branch
        // (which would be even larger) are not relevant.
        // For BFS, we just don't enqueue it.
        continue;
      }

      processingQueue.push(prospectiveNumber);

      if (checkCompliance(prospectiveNumber)) {
        accumulatedCount++;
      }
    }
  }
  return accumulatedCount;
}

function executeSolution(sourceContent) {
  const result = processInputData(sourceContent);
  console.log(result);
}

const fileSystemReader = {
  obtainData: (pathIdentifier) => {
    return require('node:fs').readFileSync(pathIdentifier, 'utf8');
  }
};

executeSolution(fileSystemReader.obtainData('/dev/stdin'));