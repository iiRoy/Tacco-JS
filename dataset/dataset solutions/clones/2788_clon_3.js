function processInputData(rawDataContent) {
  const cleanedInput = rawDataContent.trim();
  const inputSegments = cleanedInput.split('\n');

  const firstLineParts = inputSegments[0].split(" ");
  const dataItemCount = parseInt(firstLineParts[0], 10);

  const rawNumbersString = inputSegments[1];
  const parsedNumericValues = rawNumbersString.split(' ').map(strVal => parseInt(strVal, 10));

  parsedNumericValues.sort((valA, valB) => valA - valB);

  const baseMidpointIndex = dataItemCount / 2;
  const lowerBoundIndex = baseMidpointIndex;
  const upperBoundIndex = baseMidpointIndex + 1;

  const valueAtLowerBound = parsedNumericValues[lowerBoundIndex];
  const valueAtUpperBound = parsedNumericValues[upperBoundIndex];

  const finalDifference = valueAtUpperBound - valueAtLowerBound;

  console.log(finalDifference);
}

const fileSystemHandler = require('fs');
const standardInputFile = '/dev/stdin';
const fileContents = fileSystemHandler.readFileSync(standardInputFile, 'utf8');

processInputData(fileContents);
