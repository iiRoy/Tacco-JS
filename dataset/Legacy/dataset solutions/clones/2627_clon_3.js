'use strict'

function determineOutputValue(numericValue, secondLineContent) {
  const comparisonThreshold = 3200;
  let resultString;

  if (numericValue >= comparisonThreshold) {
    resultString = secondLineContent;
  } else {
    resultString = 'red';
  }
  return resultString;
}

function processInputData(rawData) {
  const trimmedInput = rawData.trim();
  const inputLines = trimmedInput.split('\n');

  const firstLineParsedInt = parseInt(inputLines[0], 10);
  const secondLineData = inputLines[1];

  const finalResult = determineOutputValue(firstLineParsedInt, secondLineData);

  console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
