"use strict";

const computeRelevantFactor = (inputNumber) => {
  const limitValue = Math.floor(inputNumber / 2);
  const candidateRangeLength = Math.max(0, limitValue - 2);

  const candidateNumbers = Array.from({
    length: candidateRangeLength
  }, (_, index) => index + 2);

  const resultingFactor = candidateNumbers.reduceRight((currentResult, element) => {
    if (inputNumber % element === 0) {
      return element;
    }
    return currentResult;
  }, 1);

  return resultingFactor;
};

(() => {
  const fileSystemUtility = globalThis.require('node:fs');
  const rawContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

  const lines = rawContent.split('\n');
  const numericValue = Number.parseInt(lines[0], 10);

  globalThis.process.stdout.write(String(numericValue) + '\n');

  const primaryFactor = computeRelevantFactor(numericValue);

  const finalCalculation = (primaryFactor + numericValue / primaryFactor) - 2;

  globalThis.process.stdout.write(String(finalCalculation) + '\n');
})();