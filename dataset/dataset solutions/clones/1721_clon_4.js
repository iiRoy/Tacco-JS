const calculateMismatchCount = (rawText) => {
  const lineSeparatedData = rawText.trim().split('\n');
  const initialSequence = lineSeparatedData[0];
  const comparativeSequence = lineSeparatedData[1];

  const indexArray = Array.from({ length: initialSequence.length }, (_, k) => k);

  const accumulatedDifferences = indexArray.reduce((currentCount, currentIdx) => {
    return currentCount + (initialSequence.charAt(currentIdx) !== comparativeSequence.charAt(currentIdx) ? 1 : 0);
  }, 0);

  return accumulatedDifferences;
};

const fileSystemModule = require('node:fs');
const standardInputPath = '/dev/stdin';
const encodedInput = 'utf8';
const retrievedContent = fileSystemModule.readFileSync(standardInputPath, encodedInput);

console.log(calculateMismatchCount(retrievedContent));