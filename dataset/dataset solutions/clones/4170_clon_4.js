const fileSystem = require('fs');

const calculateTwoFactorCount = (currentNumericValue, accumulatedDivisions = 0) => {
  if (currentNumericValue % 2 !== 0) {
    return accumulatedDivisions;
  }
  return calculateTwoFactorCount(currentNumericValue / 2, accumulatedDivisions + 1);
};

const processInputData = (inputContent) => {
  const contentLines = inputContent.split('\n');
  const initialCountValue = parseInt(contentLines[0], 10);

  const numericSequence = contentLines[1].split(' ').map(valueString => parseInt(valueString, 10));

  const divisibilityCounts = numericSequence.map(calculateTwoFactorCount);

  const minimumDivisibility = divisibilityCounts.reduce((currentMin, currentCount) => Math.min(currentMin, currentCount), 100);

  console.log(minimumDivisibility);
};

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
processInputData(rawInputContent);
