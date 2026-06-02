function parseIntegerLine(lineContent) {
  return parseInt(lineContent, 10);
}

function processInput(rawData) {
  const BASE_VALUE_FOR_CALCULATION = 6;
  const trimmedInputData = rawData.trim();
  const inputLinesArray = trimmedInputData.split('\n');

  const firstNumericValue = parseIntegerLine(inputLinesArray[0]);
  const secondNumericValue = parseIntegerLine(inputLinesArray[1]);

  const computedDifference = BASE_VALUE_FOR_CALCULATION - firstNumericValue - secondNumericValue;
  console.log(computedDifference);
}

const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processInput(standardInputContent);
