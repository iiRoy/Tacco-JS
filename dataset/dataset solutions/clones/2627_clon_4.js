'use strict'

const evaluateCondition = (numericValue, comparisonValue, trueResult, falseResult) => {
  const conditionMet = numericValue >= comparisonValue;
  return [falseResult, trueResult][+conditionMet];
};

const processExternalData = (rawData) => {
  const contentLines = rawData.trim().split('\n');
  const initialNumericValue = Number.parseInt(contentLines[0], 10);
  return evaluateCondition(initialNumericValue, 3200, contentLines[1], 'red');
};

const executeProgram = (fileReaderFunction) => {
  const inputContent = fileReaderFunction('/dev/stdin', 'utf8');
  const finalResult = processExternalData(inputContent);
  console.log(finalResult);
};

executeProgram(require('fs').readFileSync);
